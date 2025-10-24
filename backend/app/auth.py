"""Helpers for password hashing and session token management."""

from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from .models import SessionToken, User

PASSWORD_SALT_BYTES = 16
PBKDF2_ITERATIONS = 390_000
TOKEN_TTL_HOURS = 12


def _now() -> datetime:
    """Return the current UTC timestamp."""

    return datetime.now(timezone.utc)


def normalize_email(value: str) -> str:
    """Normalize an email address for consistent lookups."""

    return value.strip().lower()


def hash_password(password: str, *, salt: bytes | None = None) -> str:
    """Derive a secure password hash using PBKDF2."""

    if salt is None:
        salt = secrets.token_bytes(PASSWORD_SALT_BYTES)
    derived = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS
    )
    return base64.b64encode(salt + derived).decode("utf-8")


def verify_password(password: str, encoded: str) -> bool:
    """Compare a plain text password against a stored hash."""

    try:
        decoded = base64.b64decode(encoded.encode("utf-8"))
    except Exception:  # pragma: no cover - defensive decoding guard
        return False

    salt = decoded[:PASSWORD_SALT_BYTES]
    expected = decoded[PASSWORD_SALT_BYTES:]
    candidate = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS
    )
    return hmac.compare_digest(expected, candidate)


def hash_token(token: str) -> str:
    """Return a SHA-256 digest of the session token."""

    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def build_session_token(user: User, *, hours: int = TOKEN_TTL_HOURS) -> tuple[str, SessionToken]:
    """Generate a session token and the corresponding database record."""

    token = secrets.token_urlsafe(32)
    token_record = SessionToken(
        token_hash=hash_token(token),
        expires_at=_now() + timedelta(hours=hours),
        user=user,
    )
    return token, token_record


__all__ = [
    "PBKDF2_ITERATIONS",
    "PASSWORD_SALT_BYTES",
    "TOKEN_TTL_HOURS",
    "build_session_token",
    "hash_password",
    "hash_token",
    "normalize_email",
    "verify_password",
]
