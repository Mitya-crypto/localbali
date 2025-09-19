#!/usr/bin/env bash
set -euo pipefail
MODE="${1:-audit}"
ROOT="${2:-$HOME/Desktop/Bali}"
[ -d "$ROOT" ] || { echo "Нет папки: $ROOT"; exit 1; }

timestamp="$(date +%Y%m%d-%H%M%S)"
AUDIT_DIR="$ROOT/.audit-$timestamp"
mkdir -p "$AUDIT_DIR"

exclude_dirs_expr='-name .git -o -name node_modules -o -name .next -o -name dist -o -name build -o -name .turbo -o -name coverage -o -name .vercel -o -name .cache -o -name .parcel-cache'

audit_sizes () {
  du -h -d 1 "$ROOT" | sort -h > "$AUDIT_DIR/01_dir_sizes.txt" || true
  echo "== Крупные сервисные каталоги ==" > "$AUDIT_DIR/02_heavy_service_dirs.txt"
  find "$ROOT" -type d \( $exclude_dirs_expr \) -prune -exec du -sh {} + 2>/dev/null | sort -h >> "$AUDIT_DIR/02_heavy_service_dirs.txt" || true
}

audit_largest_files () {
  find "$ROOT" -type d \( $exclude_dirs_expr \) -prune -o -type f -print0 \
  | xargs -0 ls -ln 2>/dev/null \
  | sort -k5 -nr \
  | head -n 50 > "$AUDIT_DIR/04_top50_files.txt" || true
}

audit_lock_conflicts () {
  # конфликты менеджеров пакетов (наличие нескольких lock-файлов рядом с package.json)
  out="$AUDIT_DIR/05_lock_conflicts.txt"
  echo "dir	has_yarn	has_pnpm	has_npm" > "$out"
  find "$ROOT" -type d \( -name node_modules -o -name .git \) -prune -o -name package.json -print0 \
  | while IFS= read -r -d '' pkg; do
      d="$(dirname "$pkg")"
      y=""; p=""; n=""
      [ -f "$d/yarn.lock" ] && y="y"
      [ -f "$d/pnpm-lock.yaml" ] && p="y"
      [ -f "$d/package-lock.json" ] && n="y"
      printf "%s\t%s\t%s\t%s\n" "$d" "${y:-}" "${p:-}" "${n:-}" >> "$out"
    done
  awk -F'\t' 'NR==1{print;next}{c=0;for(i=2;i<=4;i++) if($i=="y") c++; if(c>1) print}' "$out" > "$AUDIT_DIR/05_lock_conflicts_only.txt" || true
}

audit_git () {
  if git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    git -C "$ROOT" status -s > "$AUDIT_DIR/06_git_status.txt" || true
    git -C "$ROOT" clean -Xdn > "$AUDIT_DIR/07_git_ignored_would_remove.txt" || true
  fi
}

audit_duplicates () {
  out="$AUDIT_DIR/03_duplicates.tsv"
  echo -e "hash\tsize\tpath" > "$out"
  # Хэш всех файлов вне сервисных папок (md5 на macOS; fallback на shasum)
  find "$ROOT" -type d \( $exclude_dirs_expr \) -prune -o -type f -size +0c -print0 \
  | while IFS= read -r -d '' f; do
      size=$(stat -f "%z" "$f" 2>/dev/null || stat -c "%s" "$f" 2>/dev/null || echo 0)
      if command -v md5 >/dev/null 2>&1; then
        h=$(md5 -q "$f" 2>/dev/null || echo unknown)
      else
        h=$(shasum -a 256 "$f" 2>/dev/null | awk '{print $1}' || echo unknown)
      fi
      printf "%s\t%s\t%s\n" "$h" "$size" "$f"
    done >> "$out"

  awk -F'\t' 'NR>1{c[$1]++; p[$1]=p[$1]"\n"$3} END{for(h in c) if(c[h]>1){print "---- "c[h]" copies, hash "h; print substr(p[h],2); print ""}}' "$out" \
    | sort > "$AUDIT_DIR/03_duplicates_groups.txt" || true
}

clean_build_trash () {
  echo "Удаляю артефакты сборки и кэш..." 
  find "$ROOT" -type d \( -name .next -o -name dist -o -name build -o -name .turbo -o -name coverage -o -name .vercel -o -name .cache -o -name .parcel-cache \) -prune -exec rm -rf {} + 2>/dev/null || true
  # .vercel/output внутри .vercel
  [ -d "$ROOT/.vercel/output" ] && rm -rf "$ROOT/.vercel/output" || true
  # мусорные файлы
  find "$ROOT" -name ".DS_Store" -delete 2>/dev/null || true
  # крупные .log (>20MB)
  find "$ROOT" -type f -name "*.log" -size +20M -delete 2>/dev/null || true
}


maybe_purge_node_modules () {
  read -r -p "Удалить ВСЕ node_modules (да/нет)? [нет] " ans
  if [[ "${ans:-нет}" =~ ^(да|y|Y)$ ]]; then
    find "$ROOT" -type d -name node_modules -prune -exec rm -rf {} + 2>/dev/null || true
  fi
}

case "$MODE" in
  audit)
    audit_sizes
    audit_largest_files
    audit_lock_conflicts
    audit_git
    audit_duplicates
    echo "Отчёты: $AUDIT_DIR"
    if [[ "$OSTYPE" == darwin* ]]; then open "$AUDIT_DIR" 2>/dev/null || true; fi
    ;;
  clean)
     clean_build_trash
    maybe_purge_node_modules
    echo "Готово. Повторный аудит:  $0 audit \"$ROOT\""
    ;;
  *)
    echo "Использование: $0 {audit|clean} [/путь/к/проекту]"; exit 1;;
esac
