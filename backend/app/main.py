"""Entrypoint module for running the ExportHub backend via Uvicorn."""

from __future__ import annotations

import os

import uvicorn

from . import create_app

app = create_app()


if __name__ == "__main__":  # pragma: no cover - manual execution helper
    port = int(os.environ.get("PORT", os.environ.get("BACKEND_PORT", "8000")))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
