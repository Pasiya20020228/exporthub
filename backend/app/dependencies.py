"""Reusable FastAPI dependencies."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from .config import BackendConfig
from .database import get_sessionmaker
from .auth import hash_token
from .models import SessionToken, User


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
        await session.commit()
    except Exception:  # pragma: no cover - ensure transactional safety
        await session.rollback()
        raise
    finally:
        await session.close()


SessionDep = Annotated[AsyncSession, Depends(_session_dependency)]


_bearer_scheme = HTTPBearer(auto_error=False)


async def _resolve_user_from_token(token: str, session: AsyncSession) -> User:
    token_hash = hash_token(token)
    token_result = await session.execute(
        select(SessionToken).where(SessionToken.token_hash == token_hash).limit(1)
    )
    record = token_result.scalar_one_or_none()
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )

    if record.expires_at <= datetime.now(timezone.utc):
        await session.delete(record)
        await session.flush()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token has expired.",
        )

    user_result = await session.execute(
        select(User).where(User.id == record.user_id).limit(1)
    )
    user = user_result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User linked to the token no longer exists.",
        )

    return user


async def get_optional_user(
    session: SessionDep,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> User | None:
    """Return the authenticated user when credentials are supplied."""

    if credentials is None:
        return None
    try:
        return await _resolve_user_from_token(credentials.credentials, session)
    except HTTPException:
        return None


async def get_current_user(
    session: SessionDep,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> User:
    """Ensure the request is authenticated and return the associated user."""

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
        )
    return await _resolve_user_from_token(credentials.credentials, session)


async def get_current_admin(user: Annotated[User, Depends(get_current_user)]) -> User:
    """Restrict access to administrator accounts only."""

    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator privileges are required for this operation.",
        )
    return user


UserDep = Annotated[User, Depends(get_current_user)]
AdminDep = Annotated[User, Depends(get_current_admin)]

__all__ = [
    "AdminDep",
    "SessionDep",
    "UserDep",
    "get_current_user",
    "get_optional_user",
]
