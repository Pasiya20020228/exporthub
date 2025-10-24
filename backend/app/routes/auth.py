"""Authentication and account management endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import delete, select

from ..auth import build_session_token, hash_password, hash_token, normalize_email, verify_password
from ..dependencies import SessionDep, UserDep
from ..models import SessionToken, User
from ..schemas import LoginRequest, LoginResponse, UserCreate, UserRead

router = APIRouter(prefix="/auth", tags=["auth"])
_bearer_scheme = HTTPBearer(auto_error=False)


@router.post("/signup", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def signup(payload: UserCreate, session: SessionDep) -> User:
    """Register a brand new ExportHub account."""

    normalized_email = normalize_email(payload.email)
    result = await session.execute(
        select(User).where(User.email == normalized_email).limit(1)
    )
    if result.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with that email already exists.",
        )

    user = User(
        email=normalized_email,
        full_name=payload.full_name.strip(),
        password_hash=hash_password(payload.password),
        role=payload.role,
    )
    session.add(user)
    await session.flush()
    await session.refresh(user)
    return user


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest, session: SessionDep) -> LoginResponse:
    """Authenticate a user with email and password credentials."""

    normalized_email = normalize_email(payload.email)
    result = await session.execute(
        select(User).where(User.email == normalized_email).limit(1)
    )
    user = result.scalar_one_or_none()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token_value, token_record = build_session_token(user)
    session.add(token_record)
    await session.flush()

    return LoginResponse(token=token_value, user=user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    session: SessionDep,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
) -> Response:
    """Invalidate the active session token."""

    if credentials is None:
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    token_hash_value = hash_token(credentials.credentials)
    await session.execute(
        delete(SessionToken).where(SessionToken.token_hash == token_hash_value)
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=UserRead)
async def me(current_user: UserDep) -> User:
    """Return the profile of the authenticated user."""

    return current_user
