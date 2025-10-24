"""Reusable FastAPI dependencies."""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from .config import BackendConfig
from .database import get_sessionmaker


def _resolve_settings() -> BackendConfig:
    from . import get_settings

    return get_settings()


async def _session_dependency(
    settings: BackendConfig = Depends(_resolve_settings),
) -> AsyncSession:
    session_factory = get_sessionmaker(settings.database_url)
    session = session_factory()
    try:
        yield session
    finally:
        await session.close()


SessionDep = Annotated[AsyncSession, Depends(_session_dependency)]

__all__ = ["SessionDep"]
