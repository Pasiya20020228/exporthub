"""Application factory for the ExportHub backend."""

from __future__ import annotations

import logging
import os
from functools import lru_cache
from pathlib import Path

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from .config import BackendConfig, MissingEnvironmentVariableError, load_config
from .database import init_models, verify_database_connection

logger = logging.getLogger(__name__)


@lru_cache()
def _load_settings() -> BackendConfig:
    """Load configuration, falling back to sensible defaults when needed."""

    try:
        return load_config()
    except MissingEnvironmentVariableError as exc:  # pragma: no cover - defensive
        logger.warning(
            "Missing required configuration values: %s. Falling back to defaults.",
            exc,
        )
        # Railway provides the HTTP port via the PORT variable. Use that value when
        # available so the service binds correctly in hosted environments.
        port = int(os.environ.get("PORT", os.environ.get("BACKEND_PORT", "8000")))
        return load_config(
            {
                **os.environ,
                "BACKEND_PORT": str(port),
                "BACKEND_DEBUG": os.environ.get("BACKEND_DEBUG", "false"),
                "DATABASE_URL": os.environ.get(
                    "DATABASE_URL", "sqlite:///./exporthub.db"
                ),
                "BACKEND_SECRET_KEY": os.environ.get(
                    "BACKEND_SECRET_KEY", "exporthub-development-secret"
                ),
                "BACKEND_STORAGE_BUCKET": os.environ.get(
                    "BACKEND_STORAGE_BUCKET", "exporthub-local"
                ),
            },
            allow_defaults=True,
        )


def get_settings() -> BackendConfig:
    """Expose cached settings for FastAPI dependency injection."""

    return _load_settings()


def create_app() -> FastAPI:
    """Create and configure the FastAPI application instance."""

    app = FastAPI(title="ExportHub Backend", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    static_dir = Path(__file__).resolve().parent / "static"
    static_available = static_dir.exists() and (static_dir / "index.html").exists()

    def _wants_html(request: Request) -> bool:
        accept = request.headers.get("accept")
        if not accept:
            return False
        return "text/html" in accept.lower()

    @app.get("/", tags=["system"], include_in_schema=not static_available)
    async def read_root(
        request: Request, settings: BackendConfig = Depends(get_settings)
    ) -> dict[str, str]:
        """Provide a simple landing route for uptime checks."""

        if static_available and _wants_html(request):
            return RedirectResponse(url="/app", status_code=307)

        return {
            "message": "ExportHub backend is running",
            "storage_bucket": settings.storage_bucket,
        }

    @app.get("/healthz", tags=["system"])
    async def healthcheck(settings: BackendConfig = Depends(get_settings)) -> dict[str, str]:
        """Return a health payload that indicates configuration readiness."""

        database_status = "unconfigured"
        if settings.database_url:
            try:
                await verify_database_connection(settings)
                database_status = "connected"
            except Exception as exc:  # pragma: no cover - defensive logging
                logger.exception("Database health check failed: %s", exc)
                database_status = "error"

        return {
            "status": "ok",
            "debug": str(settings.debug).lower(),
            "database": database_status,
        }

    @app.on_event("startup")
    async def log_startup() -> None:
        """Log the resolved configuration when the service boots."""

        settings = get_settings()
        logger.info(
            "ExportHub backend starting on port %s (debug=%s)",
            settings.port,
            settings.debug,
        )
        await verify_database_connection(settings)
        await init_models(settings)
        logger.info("Database connection verified")

    from .routes import orders, products

    app.include_router(products.router)
    app.include_router(orders.router)

    if static_available:
        app.mount("/app", StaticFiles(directory=static_dir, html=True), name="frontend")

        @app.get("/app", include_in_schema=False)
        async def serve_frontend() -> FileResponse:
            """Serve the single page application entrypoint."""

            return FileResponse(static_dir / "index.html")

    return app


__all__ = ["BackendConfig", "create_app", "get_settings", "verify_database_connection"]
