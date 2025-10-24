"""Database helpers for the ExportHub backend."""

from __future__ import annotations

from contextlib import asynccontextmanager
from functools import lru_cache
from typing import AsyncIterator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.sql import text

from .config import BackendConfig


def _coerce_async_driver(database_url: str) -> str:
    """Ensure the SQLAlchemy URL uses an async-capable driver."""

    if database_url.startswith("postgresql+asyncpg://"):
        return database_url
    if database_url.startswith("postgresql://"):
        return "postgresql+asyncpg://" + database_url[len("postgresql://") :]
    if database_url.startswith("postgres://"):
        return "postgresql+asyncpg://" + database_url[len("postgres://") :]
    if database_url.startswith("sqlite+aiosqlite://"):
        return database_url
    if database_url.startswith("sqlite://"):
        return "sqlite+aiosqlite://" + database_url[len("sqlite://") :]
    return database_url


@lru_cache()
def _get_engine(database_url: str) -> AsyncEngine:
    """Create (or return a cached) async SQLAlchemy engine."""

    return create_async_engine(_coerce_async_driver(database_url), future=True)


@lru_cache()
def _get_sessionmaker(database_url: str) -> async_sessionmaker[AsyncSession]:
    """Create a session factory tied to the configured database URL."""

    engine = _get_engine(database_url)
    return async_sessionmaker(engine, expire_on_commit=False)


def get_sessionmaker(database_url: str) -> async_sessionmaker[AsyncSession]:
    """Expose the cached session factory for dependency wiring."""

    return _get_sessionmaker(database_url)


@asynccontextmanager
async def lifespan_session(settings: BackendConfig) -> AsyncIterator[AsyncSession]:
    """Provide an async session scoped to a FastAPI lifespan event."""

    session_factory = _get_sessionmaker(settings.database_url)
    session = session_factory()
    try:
        yield session
        await session.commit()
    except Exception:  # pragma: no cover - defensive rollback
        await session.rollback()
        raise
    finally:
        await session.close()


async def verify_database_connection(settings: BackendConfig) -> None:
    """Execute a lightweight query to ensure the database is reachable."""

    engine = _get_engine(settings.database_url)
    async with engine.connect() as connection:
        await connection.execute(text("SELECT 1"))


async def init_models(settings: BackendConfig) -> None:
    """Create database tables when they are missing."""

    from .models import Base

    engine = _get_engine(settings.database_url)
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)


__all__ = [
    "lifespan_session",
    "get_sessionmaker",
    "init_models",
    "verify_database_connection",
]
