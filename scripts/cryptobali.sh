#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
cd "$ROOT"

PORT_DEFAULT=3010
CMD="${1:-up}"
PORT="${2:-${PORT:-$PORT_DEFAULT}}"

kill_port() {
  local p="${1:-$PORT}"
  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids="$(lsof -ti tcp:$p || true)"
    [ -n "$pids" ] && kill -9 $pids || true
  fi
}
inst() {
  if [ -f package-lock.json ]; then npm ci; else npm i; fi
}

dev()   { inst; echo "→ Dev:  http://localhost:$PORT"; npm run dev -- -p "$PORT"; }
build() { inst; npm run build; }
start() { echo "→ Prod: http://localhost:$PORT"; npm run start -- -p "$PORT"; }
up()    { kill_port "$PORT"; dev; }

arch()  { node scripts/gen-arch.mjs 2>/dev/null || echo "No scripts/gen-arch.mjs"; }

envfile(){
  [ -f .env.local ] || cat > .env.local <<EOF
# --- runtime env ---
BOT_TOKEN=
WEBAPP_URL=http://localhost:$PORT
NEXT_PUBLIC_TG_MOCK=1
# --------------------
EOF
  echo ".env.local ready"
}

notes(){ ${EDITOR:-nano} docs/PROJECT_NOTES.md; }

usage(){ echo "Usage: $0 {up|dev|build|start|kill|arch|env|notes} [port]"; }

case "$CMD" in
  up) up ;;
  dev) dev ;;
  build) build ;;
  start) start ;;
  kill) kill_port "$PORT" ;;
  arch) arch ;;
  env) envfile ;;
  notes) notes ;;
  *) usage; exit 1 ;;
esac
