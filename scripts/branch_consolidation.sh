#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

usage() {
  cat <<'USAGE'
Usage: branch_consolidation.sh [options]

Merge local branches into a single target branch and optionally delete them.

Options:
  -t, --target <branch>     Target branch to consolidate into (default: main)
  -k, --keep <branch>       Additional branch to keep. Can be repeated.
  -f, --filter <pattern>    Only process branches that match the extended regexp pattern.
  -s, --scan-cmd <command>  Command to run after consolidation (default: auto detect).
      --no-scan             Skip running the scan command.
  -n, --dry-run             Show actions without performing merges or deletions.
      --remote <name>       Also delete branches from the specified remote.
      --fetch               Fetch and prune remotes before running.
      --force               Force delete local branches (git branch -D).
  -h, --help                Show this help message.

Environment variables:
  SCAN_CMD   Alternate way to set the scan command.
USAGE
}

err() {
  printf '\e[31mError:\e[0m %s\n' "$*" >&2
}

info() {
  printf '\e[34m[INFO]\e[0m %s\n' "$*"
}

warn() {
  printf '\e[33m[WARN]\e[0m %s\n' "$*"
}

TARGET_BRANCH="main"
FILTER_PATTERN=""
RUN_SCAN=1
SCAN_COMMAND="${SCAN_CMD:-}"
DRY_RUN=0
REMOTE_NAME=""
PERFORM_FETCH=0
FORCE_DELETE=0
KEEP_BRANCHES=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    -t|--target)
      [[ $# -lt 2 ]] && { err "Missing argument for $1"; exit 1; }
      TARGET_BRANCH="$2"
      shift 2
      ;;
    -k|--keep)
      [[ $# -lt 2 ]] && { err "Missing argument for $1"; exit 1; }
      KEEP_BRANCHES+=("$2")
      shift 2
      ;;
    -f|--filter)
      [[ $# -lt 2 ]] && { err "Missing argument for $1"; exit 1; }
      FILTER_PATTERN="$2"
      shift 2
      ;;
    -s|--scan-cmd)
      [[ $# -lt 2 ]] && { err "Missing argument for $1"; exit 1; }
      SCAN_COMMAND="$2"
      shift 2
      ;;
    --no-scan)
      RUN_SCAN=0
      shift
      ;;
    -n|--dry-run)
      DRY_RUN=1
      shift
      ;;
    --remote)
      [[ $# -lt 2 ]] && { err "Missing argument for $1"; exit 1; }
      REMOTE_NAME="$2"
      shift 2
      ;;
    --fetch)
      PERFORM_FETCH=1
      shift
      ;;
    --force)
      FORCE_DELETE=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      err "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
done

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  err "This script must be run inside a Git repository."
  exit 1
fi

if [[ -z "$SCAN_COMMAND" && $RUN_SCAN -eq 1 ]]; then
  if [[ -f package.json ]]; then
    SCAN_COMMAND="npm run lint --if-present"
  else
    SCAN_COMMAND="git status"
  fi
fi

if [[ $PERFORM_FETCH -eq 1 ]]; then
  info "Fetching latest refs..."
  git fetch --all --prune
fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
trap 'git checkout "$CURRENT_BRANCH" >/dev/null 2>&1 || true' EXIT

if ! git show-ref --verify --quiet "refs/heads/$TARGET_BRANCH"; then
  err "Target branch '$TARGET_BRANCH' does not exist locally."
  exit 1
fi

status=$(git status --porcelain)
if [[ -n "$status" ]]; then
  err "Working tree is not clean. Commit or stash changes before running."
  exit 1
fi

mapfile -t ALL_BRANCHES < <(git for-each-ref --format='%(refname:short)' refs/heads --sort=committerdate)
if [[ ${#ALL_BRANCHES[@]} -eq 0 ]]; then
  info "No local branches found. Nothing to do."
  exit 0
fi

SHOULD_PROCESS=()
KEEP_SET=("$TARGET_BRANCH")
KEEP_SET+=("${KEEP_BRANCHES[@]}")

for branch in "${ALL_BRANCHES[@]}"; do
  skip=0
  for keep in "${KEEP_SET[@]}"; do
    if [[ "$branch" == "$keep" ]]; then
      skip=1
      break
    fi
  done
  if [[ $skip -eq 1 ]]; then
    continue
  fi
  if [[ -n "$FILTER_PATTERN" ]]; then
    if ! [[ "$branch" =~ $FILTER_PATTERN ]]; then
      continue
    fi
  fi
  SHOULD_PROCESS+=("$branch")
done

if [[ ${#SHOULD_PROCESS[@]} -eq 0 ]]; then
  info "No branches matched the selection criteria."
  RUN_SCAN=0
  exit 0
fi

info "Target branch: $TARGET_BRANCH"
if [[ ${#KEEP_BRANCHES[@]} -gt 0 ]]; then
  info "Protected branches: ${KEEP_BRANCHES[*]}"
fi
if [[ -n "$FILTER_PATTERN" ]]; then
  info "Filter pattern: $FILTER_PATTERN"
fi
info "Branches to consolidate: ${SHOULD_PROCESS[*]}"

if [[ $DRY_RUN -eq 1 ]]; then
  info "Dry run enabled. No merges or deletions will be performed."
  exit 0
fi

MERGED_BRANCHES=()
FAILED_BRANCH=""

git checkout "$TARGET_BRANCH" >/dev/null 2>&1

for branch in "${SHOULD_PROCESS[@]}"; do
  info "Merging '$branch' into '$TARGET_BRANCH'..."
  if ! git merge --no-ff --no-edit "$branch"; then
    err "Merge conflict encountered while merging '$branch'."
    FAILED_BRANCH="$branch"
    break
  fi
  MERGED_BRANCHES+=("$branch")
  if [[ $FORCE_DELETE -eq 1 ]]; then
    git branch -D "$branch"
  else
    git branch -d "$branch"
  fi
  if [[ -n "$REMOTE_NAME" ]]; then
    info "Deleting '$branch' from remote '$REMOTE_NAME'..."
    git push "$REMOTE_NAME" --delete "$branch"
  fi
  info "Branch '$branch' consolidated and removed."
  git checkout "$TARGET_BRANCH" >/dev/null 2>&1
done

if [[ -n "$FAILED_BRANCH" ]]; then
  warn "Resolve the merge conflict on '$TARGET_BRANCH' and rerun the script to continue."
  exit 1
fi

if [[ ${#MERGED_BRANCHES[@]} -gt 0 ]]; then
  info "Successfully consolidated branches: ${MERGED_BRANCHES[*]}"
else
  info "No branches required merging into '$TARGET_BRANCH'."
fi

trap - EXIT
SUCCESS_BRANCH="$TARGET_BRANCH"
git checkout "$SUCCESS_BRANCH" >/dev/null 2>&1

if [[ $RUN_SCAN -eq 1 && -n "$SCAN_COMMAND" ]]; then
  info "Running scan command: $SCAN_COMMAND"
  bash -c "$SCAN_COMMAND"
fi

info "Branch consolidation complete."
