#!/usr/bin/env bash
set -euo pipefail

# Ensure we run from the repository root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Default Railway port if none provided
PORT="${PORT:-8080}"

# Ensure the frontend assets exist so the UI can be served by FastAPI. When
# running on Railway the build step already runs `npm run build --prefix
# frontend`, but local executions (or custom Railway builders) may skip that
# phase. Rebuild the dashboard when the compiled index is missing so the
# backend can redirect visitors to the UI.
FRONTEND_DIR="frontend"
STATIC_DIR="backend/app/static"

if command -v npm >/dev/null 2>&1; then
  if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install --prefix "$FRONTEND_DIR"
  fi

  if [ ! -f "$STATIC_DIR/index.html" ]; then
    echo "Building frontend dashboard..."
    npm run build --prefix "$FRONTEND_DIR"
  else
    echo "Using existing frontend build in $STATIC_DIR"
  fi
else
  echo "npm command not found; skipping frontend dependency installation and build." >&2
  if [ ! -f "$STATIC_DIR/index.html" ]; then
    echo "Frontend assets are missing. Install Node.js and npm to build the dashboard." >&2
  fi
fi

# Run the FastAPI backend
cd backend
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
