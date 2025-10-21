#!/usr/bin/env bash
set -euo pipefail

# Ensure we run from the repository root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Default Railway port if none provided
PORT="${PORT:-8080}"

# Run the FastAPI backend
cd backend
exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
