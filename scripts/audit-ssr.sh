
#!/bin/bash
set -euo pipefail
ROOT="$HOME/Desktop/Bali"
PORT=3010
URL="http://localhost:$PORT"
cd "$ROOT"

# kill
/usr/sbin/lsof -nP -t -iTCP:$PORT -sTCP:LISTEN | xargs -I{} kill -9 {} 2>/dev/null || true
pkill -f "next dev -p $PORT" 2>/dev/null || true

# start dev
npm run dev >/tmp/bali-dev.log 2>&1 & DEV_PID=$!
trap 'kill -9 $DEV_PID 2>/dev/null || true; /usr/sbin/lsof -nP -t -iTCP:'"$PORT"' -sTCP:LISTEN | xargs -I{} kill -9 {} 2>/dev/null || true' EXIT

# wait ready
for i in {1..40}; do
  curl -sSf "$URL" >/dev/null 2>&1 && break || sleep 0.5
done

# run tests + summary
npm run audit:ssr || true
npm run audit:sum || true

# open report
open "$ROOT/docs/audit"
