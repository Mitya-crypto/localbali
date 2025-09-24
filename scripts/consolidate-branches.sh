#!/usr/bin/env bash
set -euo pipefail

TARGET_BRANCH="${1:-main}"
REMOTE="${2:-origin}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "This script must be run inside a git repository." >&2
  exit 1
fi

if ! git rev-parse --verify "$TARGET_BRANCH" >/dev/null 2>&1; then
  echo "Branch '$TARGET_BRANCH' does not exist locally." >&2
  exit 1
fi

if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  echo "Remote '$REMOTE' does not exist." >&2
  exit 1
fi

if [[ -n $(git status --porcelain) ]]; then
  echo "Your working tree has uncommitted changes. Please commit or stash them before running this script." >&2
  exit 1
fi

cat <<CONFIRM
You are about to:
  * check out '$TARGET_BRANCH'
  * fetch and prune the '$REMOTE' remote
  * delete every local branch except '$TARGET_BRANCH'
  * delete every branch on '$REMOTE' except '$TARGET_BRANCH'

This operation is destructive and cannot be undone.
CONFIRM

read -rp "Type 'yes' to continue: " confirmation
if [[ "$confirmation" != "yes" ]]; then
  echo "Aborted." >&2
  exit 1
fi

echo "Checking out $TARGET_BRANCH..."
git checkout "$TARGET_BRANCH"

echo "Fetching updates from $REMOTE..."
git fetch "$REMOTE" --prune

if git show-ref --verify "refs/remotes/$REMOTE/$TARGET_BRANCH" >/dev/null 2>&1; then
  echo "Fast-forwarding $TARGET_BRANCH from $REMOTE/$TARGET_BRANCH..."
  git merge --ff-only "$REMOTE/$TARGET_BRANCH" || {
    echo "Fast-forward failed; attempting a regular pull." >&2
    git pull "$REMOTE" "$TARGET_BRANCH"
  }
fi

for branch in $(git for-each-ref --format='%(refname:short)' refs/heads/); do
  if [[ "$branch" != "$TARGET_BRANCH" ]]; then
    echo "Deleting local branch $branch..."
    git branch -D "$branch"
  fi
done

for ref in $(git for-each-ref --format='%(refname:short)' "refs/remotes/$REMOTE/"); do
  remote_branch="${ref#*/}"
  if [[ "$remote_branch" != "$TARGET_BRANCH" && "$remote_branch" != "HEAD" ]]; then
    echo "Deleting remote branch $remote_branch from $REMOTE..."
    git push "$REMOTE" --delete "$remote_branch"
  fi
done

echo "Remaining branches:"
git branch

echo "Remaining remote branches on $REMOTE:"
git branch -r | grep "^  $REMOTE/" || true

echo "Done."
