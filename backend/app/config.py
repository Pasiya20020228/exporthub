"""Configuration loader for the ExportHub backend service."""

import os
from dataclasses import dataclass
from typing import Mapping, MutableMapping, Optional, cast


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


def load_config(env: Optional[Mapping[str, str]] = None) -> BackendConfig:
    """Load configuration values from the provided environment."""

    source = _get_source(env)
    return BackendConfig(
        port=_int("BACKEND_PORT", 8000, source),
        debug=_bool("BACKEND_DEBUG", False, source),
        database_url=_required("DATABASE_URL", source),
        secret_key=_required("BACKEND_SECRET_KEY", source),
        storage_bucket=_required("BACKEND_STORAGE_BUCKET", source),
    )


__all__ = ["BackendConfig", "MissingEnvironmentVariableError", "load_config"]
