"""Configuration loader for the ExportHub backend service."""

import os
from dataclasses import dataclass
from typing import Mapping, MutableMapping, Optional, cast
from urllib.parse import quote_plus


class MissingEnvironmentVariableError(RuntimeError):
    """Raised when a required environment variable has not been provided."""


def _get_source(env: Optional[Mapping[str, str]]) -> Mapping[str, str]:
    if env is not None:
        return env
    return cast(MutableMapping[str, str], os.environ)


def _required(name: str, source: Mapping[str, str]) -> str:
    value = source.get(name)
    if value is None or value == "":
        raise MissingEnvironmentVariableError(
            "Missing required environment variable: {}".format(name)
        )
    return value


def _string(
    name: str,
    default: str,
    source: Mapping[str, str],
    allow_default: bool,
) -> str:
    value = source.get(name)
    if value is None or value == "":
        if allow_default:
            return default
        return _required(name, source)
    return value


def _bool(name: str, default: bool, source: Mapping[str, str]) -> bool:
    value = source.get(name)
    if value is None:
        return default
    lowered = value.lower()
    if lowered in {"1", "true", "t", "yes", "y"}:
        return True
    if lowered in {"0", "false", "f", "no", "n"}:
        return False
    raise ValueError(
        "Environment variable {} must be a boolean value, got {!r}".format(
            name, value
        )
    )


def _int(name: str, default: int, source: Mapping[str, str]) -> int:
    value = source.get(name)
    if value is None:
        return default
    try:
        return int(value)
    except ValueError as exc:
        raise ValueError(
            "Environment variable {} must be an integer, got {!r}".format(
                name, value
            )
        ) from exc


@dataclass(frozen=True)
class BackendConfig:
    """Immutable configuration for the backend service."""

    port: int
    debug: bool
    database_url: str
    secret_key: str
    storage_bucket: str


def _build_database_url(
    source: Mapping[str, str], *, allow_default: bool
) -> str:
    """Resolve the database URL from common environment variable layouts."""

    value = source.get("DATABASE_URL")
    if value:
        return value

    # Railway exposes PostgreSQL credentials via PG* variables when the
    # DATABASE_URL secret is not configured manually on the service. Assemble a
    # SQLAlchemy-compatible URL from those pieces so deployments still succeed.
    host = source.get("PGHOST")
    database = source.get("PGDATABASE")
    user = source.get("PGUSER")
    password = source.get("PGPASSWORD")
    port = source.get("PGPORT", "5432")

    if host and database and user and password:
        safe_password = quote_plus(password)
        return "postgresql://{}:{}@{}:{}/{}".format(
            user,
            safe_password,
            host,
            port,
            database,
        )

    if allow_default:
        return "sqlite:///./exporthub.db"

    raise MissingEnvironmentVariableError("Missing required environment variable: DATABASE_URL")


def load_config(
    env: Optional[Mapping[str, str]] = None, *, allow_defaults: bool = False
) -> BackendConfig:
    """Load configuration values from the provided environment.

    When ``allow_defaults`` is True, sensible development defaults are supplied for
    values that are missing so the application can boot in ephemeral environments
    such as Railway deployments or local tests.
    """

    source = _get_source(env)
    return BackendConfig(
        port=_int("BACKEND_PORT", 8000, source),
        debug=_bool("BACKEND_DEBUG", False, source),
        database_url=_build_database_url(source, allow_default=allow_defaults),
        secret_key=_string(
            "BACKEND_SECRET_KEY", "exporthub-development-secret", source, allow_defaults
        ),
        storage_bucket=_string(
            "BACKEND_STORAGE_BUCKET", "exporthub-local", source, allow_defaults
        ),
    )


__all__ = ["BackendConfig", "MissingEnvironmentVariableError", "load_config"]
