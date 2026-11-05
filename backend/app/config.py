from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEV_JWT_SECRET = "dev-only-secret-change-me-in-production-please"
# Secrets that have appeared in this repo's docs or configs; never valid outside development.
KNOWN_WEAK_SECRETS = {DEV_JWT_SECRET, "change-me-in-production", "changeme", "secret"}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: Literal["development", "production"] = "development"
    database_url: str = "postgresql+psycopg://ledger:ledger@127.0.0.1:5433/ledger"
    jwt_secret: str = DEV_JWT_SECRET
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60 * 24 * 7
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    # Requests with a larger declared body are rejected before parsing.
    max_body_bytes: int = 2 * 1024 * 1024
    # When set and the folder exists, the built frontend is served from here.
    static_dir: Path | None = Path(__file__).resolve().parents[2] / "dist" / "public"

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    @model_validator(mode="after")
    def _require_strong_secret(self) -> "Settings":
        # A guessable signing key lets anyone mint a token for any user.
        if len(self.jwt_secret) < 32 or (
            self.is_production and self.jwt_secret in KNOWN_WEAK_SECRETS
        ):
            raise ValueError(
                "JWT_SECRET must be a random value of at least 32 characters (and not a "
                'documented example). Generate one with: python -c "import secrets; '
                'print(secrets.token_urlsafe(48))"'
            )
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
