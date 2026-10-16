"""
Supabase data-access layer.

Provides typed helper functions for every table interaction.
All write operations use the service_role client (bypasses RLS).
The module is stateless — the client is initialised lazily on
first call so that import-time side-effects are avoided.
"""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any

from supabase import Client, create_client

from .config import settings

logger = logging.getLogger(__name__)

# ── Lazy singleton client ──
_client: Client | None = None


def _get_client() -> Client:
    """Return the Supabase client, creating it on first call."""
    global _client
    if _client is None:
        settings.validate()
        _client = create_client(settings.supabase_url, settings.supabase_service_key)
        logger.info("Supabase client initialised.")
    return _client


# ===================================================================
# Frameworks
# ===================================================================

def get_enabled_frameworks() -> list[dict[str, Any]]:
    """Return all frameworks where enabled = true."""
    resp = (
        _get_client()
        .table("frameworks")
        .select("*")
        .eq("enabled", True)
        .execute()
    )
    return resp.data


def get_framework_by_slug(slug: str) -> dict[str, Any] | None:
    """Look up a single framework by its slug."""
    resp = (
        _get_client()
        .table("frameworks")
        .select("*")
        .eq("slug", slug)
        .limit(1)
        .execute()
    )
    return resp.data[0] if resp.data else None


def update_framework_timestamps(
    framework_id: str,
    *,
    checked: bool = True,
    changed: bool = False,
) -> None:
    """Update last_checked_at (and optionally last_change_at)."""
    now = datetime.now(UTC).isoformat()
    payload: dict[str, Any] = {"last_checked_at": now}
    if changed:
        payload["last_change_at"] = now
    _get_client().table("frameworks").update(payload).eq("id", framework_id).execute()


# ===================================================================
# Framework Versions
# ===================================================================

def get_latest_version(framework_id: str) -> dict[str, Any] | None:
    """Return the most recent version row for a framework, or None."""
    resp = (
        _get_client()
        .table("framework_versions")
        .select("*")
        .eq("framework_id", framework_id)
        .order("fetched_at", desc=True)
        .limit(1)
        .execute()
    )
    return resp.data[0] if resp.data else None


def insert_version(
    framework_id: str,
    version_label: str,
    content_hash: str,
    raw_metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Insert a new version row.

    Returns the inserted row.  If a row with the same
    (framework_id, content_hash) already exists, the unique
    constraint prevents duplication — the caller should catch
    the error and treat it as 'no_change'.
    """
    payload = {
        "framework_id": framework_id,
        "version_label": version_label,
        "content_hash": content_hash,
        "raw_metadata": raw_metadata or {},
    }
    resp = (
        _get_client()
        .table("framework_versions")
        .insert(payload)
        .execute()
    )
    return resp.data[0]


# ===================================================================
# Controls
# ===================================================================

def bulk_insert_controls(
    version_id: str,
    controls: list[dict[str, Any]],
) -> int:
    """
    Insert a batch of control rows for a given version.

    Each dict in `controls` must have at least 'control_id'.
    Returns the number of rows inserted.
    """
    rows = [
        {
            "version_id": version_id,
            "control_id": c["control_id"],
            "title": c.get("title"),
            "body": c.get("body"),
            "metadata": c.get("metadata", {}),
        }
        for c in controls
    ]
    resp = (
        _get_client()
        .table("controls")
        .insert(rows)
        .execute()
    )
    return len(resp.data)


def get_controls_for_version(version_id: str) -> list[dict[str, Any]]:
    """Return all controls belonging to a specific version."""
    resp = (
        _get_client()
        .table("controls")
        .select("*")
        .eq("version_id", version_id)
        .execute()
    )
    return resp.data


# ===================================================================
# Changes
# ===================================================================

def bulk_insert_changes(
    framework_id: str,
    from_version_id: str,
    to_version_id: str,
    changes: list[dict[str, Any]],
) -> int:
    """
    Insert a batch of change rows between two versions.

    Each dict in `changes` must have 'control_id', 'change_type',
    and optionally 'before_text', 'after_text', 'field_changes'.
    Returns the number of rows inserted.
    """
    rows = [
        {
            "framework_id": framework_id,
            "from_version_id": from_version_id,
            "to_version_id": to_version_id,
            "control_id": ch["control_id"],
            "change_type": ch["change_type"],
            "before_text": ch.get("before_text"),
            "after_text": ch.get("after_text"),
            "field_changes": ch.get("field_changes", {}),
        }
        for ch in changes
    ]
    resp = (
        _get_client()
        .table("changes")
        .insert(rows)
        .execute()
    )
    return len(resp.data)


def get_unsummarised_changes(limit: int = 50) -> list[dict[str, Any]]:
    """Return changes that still need an LLM summary."""
    resp = (
        _get_client()
        .table("changes")
        .select("*")
        .is_("llm_summary", "null")
        .limit(limit)
        .execute()
    )
    return resp.data


def update_change_summary(change_id: str, summary: str) -> None:
    """Set the llm_summary for a change row."""
    _get_client().table("changes").update(
        {"llm_summary": summary}
    ).eq("id", change_id).execute()


# ===================================================================
# Fetch Runs
# ===================================================================

def start_run(framework_id: str) -> dict[str, Any]:
    """Create a new fetch_run in 'running' status.  Returns the row."""
    resp = (
        _get_client()
        .table("fetch_runs")
        .insert({"framework_id": framework_id, "status": "running"})
        .execute()
    )
    return resp.data[0]


def finish_run(
    run_id: str,
    *,
    status: str,
    version_id: str | None = None,
    error_message: str | None = None,
    duration_ms: int | None = None,
    metadata: dict[str, Any] | None = None,
) -> None:
    """Finalise a fetch_run with its outcome."""
    payload: dict[str, Any] = {
        "status": status,
        "finished_at": datetime.now(UTC).isoformat(),
    }
    if version_id:
        payload["version_id"] = version_id
    if error_message:
        payload["error_message"] = error_message
    if duration_ms is not None:
        payload["duration_ms"] = duration_ms
    if metadata:
        payload["metadata"] = metadata
    _get_client().table("fetch_runs").update(payload).eq("id", run_id).execute()


# ===================================================================
# Dashboard / Overview
# ===================================================================

def get_framework_overview() -> list[dict[str, Any]]:
    """Query the framework_overview view for the dashboard."""
    resp = (
        _get_client()
        .table("framework_overview")
        .select("*")
        .execute()
    )
    return resp.data
