#!/bin/zsh

# Auto Git sync on file changes (macOS)
# Requires: fswatch (brew install fswatch)

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BRANCH="${1:-}"  # optional: branch name override

cd "$ROOT_DIR"

if ! command -v fswatch >/dev/null 2>&1; then
  echo "[auto-sync] fswatch not found. Install with: brew install fswatch" >&2
  exit 1
fi

echo "[auto-sync] Watching: $ROOT_DIR"
echo "[auto-sync] Press Ctrl+C to stop."

sync_once() {
  # Skip if no changes staged/unstaged
  if git diff --quiet && git diff --cached --quiet; then
    return 0
  fi

  # Ensure branch if provided
  if [[ -n "$BRANCH" ]]; then
    current_branch="$(git rev-parse --abbrev-ref HEAD)" || true
    if [[ "$current_branch" != "$BRANCH" ]]; then
      echo "[auto-sync] Switching branch: $BRANCH"
      git checkout "$BRANCH" || return 0
    fi
  fi

  echo "[auto-sync] Adding changes..."
  git add -A

  ts="$(date '+%Y-%m-%d %H:%M:%S')"
  msg="Auto-sync: $ts"
  # Commit only if there is something to commit
  if ! git diff --cached --quiet; then
    git commit -m "$msg" || true
  fi

  echo "[auto-sync] Pull --rebase"
  git pull --rebase || true

  echo "[auto-sync] Push (with retry)"
  MAX_PUSH_RETRIES=3
  for i in $(seq 1 $MAX_PUSH_RETRIES); do
    if git push 2>&1; then
      echo "[auto-sync] Push successful"
      break
    else
      echo "[auto-sync] Push failed, retry $i/$MAX_PUSH_RETRIES"
      sleep 3
    fi
  done
}

# Debounce events within a short window
DEBOUNCE_SEC=2
last_run=0

fswatch -or --event Created --event Updated --event Removed --event Renamed \
  --exclude ".git/" \
  --exclude "node_modules/" \
  "$ROOT_DIR" | while read -r _; do
    now=$(date +%s)
    if (( now - last_run < DEBOUNCE_SEC )); then
      continue
    fi
    last_run=$now
    sync_once
  done


