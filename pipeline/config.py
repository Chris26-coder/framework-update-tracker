"""
Centralised configuration loader.

Reads environment variables (via .env in dev) and exposes them
as a validated, typed Settings object.  Every other module imports
`settings` from here — no raw os.getenv() calls elsewhere.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

# ── Load .env (no-op if the file doesn't exist) ──
_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_ENV_PATH)


@dataclass(frozen=True)
class Settings:
    """Immutable application settings."""

    # ── Supabase ──
    supabase_url: str = field(
        default_factory=lambda: os.environ.get("SUPABASE_URL", "")
    )
    supabase_service_key: str = field(
        default_factory=lambda: os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    )

    # ── GitHub ──
    github_token: str | None = field(
        default_factory=lambda: os.environ.get("GITHUB_TOKEN")
    )

    # ── LLM (for grounded summaries) ──
    openai_api_key: str | None = field(
        default_factory=lambda: os.environ.get("OPENAI_API_KEY")
    )
    llm_model: str = field(
        default_factory=lambda: os.environ.get("LLM_MODEL", "gpt-4o-mini")
    )

    # ── Pipeline behaviour ──
    http_timeout: int = field(
        default_factory=lambda: int(os.environ.get("HTTP_TIMEOUT", "30"))
    )
    max_retries: int = field(
        default_factory=lambda: int(os.environ.get("MAX_RETRIES", "3"))
    )
    log_level: str = field(
        default_factory=lambda: os.environ.get("LOG_LEVEL", "INFO")
    )

    # ── Derived / Frameworks config path ──
    frameworks_config: Path = field(
        default_factory=lambda: Path(__file__).resolve().parent
        / "configs"
        / "frameworks.yaml"
    )

    def validate(self) -> None:
        """Raise if critical settings are missing."""
        missing = []
        if not self.supabase_url:
            missing.append("SUPABASE_URL")
        if not self.supabase_service_key:
            missing.append("SUPABASE_SERVICE_ROLE_KEY")
        if missing:
            raise OSError(
                f"Missing required environment variables: {', '.join(missing)}"
            )


# Singleton — import this everywhere
settings = Settings()
