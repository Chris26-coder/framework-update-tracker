"""
GitHub REST API fetcher.

Provides functions to:
1. Check the latest commit SHA for a file path (cheap pre-check).
2. Download raw file content from a repository.
3. Look up the latest release tag.

Uses optional GITHUB_TOKEN for higher rate limits.
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

from pipeline.config import settings

from .base import request_with_retry

logger = logging.getLogger(__name__)

GITHUB_API = "https://api.github.com"


def _auth_headers() -> dict[str, str]:
    """Build GitHub auth headers if a token is configured."""
    headers: dict[str, str] = {"Accept": "application/vnd.github.v3+json"}
    if settings.github_token:
        headers["Authorization"] = f"Bearer {settings.github_token}"
    return headers


def get_latest_commit_sha(
    repo: str,
    branch: str,
    path: str,
) -> dict[str, Any]:
    """Get the latest commit SHA that touched a specific file path.

    This is the *cheap pre-check*: if the SHA hasn't changed since
    last run, there is no need to download the full file.

    Args:
        repo: ``owner/repo`` format.
        branch: Branch name (e.g. ``main``).
        path: File path within the repository.

    Returns:
        dict with ``sha``, ``message``, ``date``, ``url``.
    """
    url = f"{GITHUB_API}/repos/{repo}/commits"
    params = {"sha": branch, "path": path, "per_page": 1}

    response = request_with_retry("GET", url, headers=_auth_headers(), params=params)
    commits = response.json()

    if not commits:
        raise ValueError(f"No commits found for {repo}/{path} on branch {branch}")

    commit = commits[0]
    return {
        "sha": commit["sha"],
        "message": commit["commit"]["message"],
        "date": commit["commit"]["committer"]["date"],
        "url": commit["html_url"],
    }


def fetch_file_content(
    repo: str,
    branch: str,
    path: str,
) -> bytes:
    """Download raw file content via raw.githubusercontent.com.

    This avoids consuming API rate-limit quota for the actual
    file payload.

    Args:
        repo: ``owner/repo`` format.
        branch: Branch name or commit SHA.
        path: File path within the repository.

    Returns:
        Raw file content as bytes.
    """
    url = f"https://raw.githubusercontent.com/{repo}/{branch}/{path}"
    logger.info("Downloading %s/%s from branch %s", repo, path, branch)
    response = request_with_retry("GET", url, headers=_auth_headers())
    return response.content


def get_latest_release_tag(
    repo: str,
    tag_pattern: str | None = None,
) -> dict[str, Any] | None:
    """Get the latest release tag from a repository.

    Args:
        repo: ``owner/repo`` format.
        tag_pattern: Optional glob pattern to filter tags.

    Returns:
        dict with ``tag_name``, ``published_at``, ``url``, or *None*.
    """
    url = f"{GITHUB_API}/repos/{repo}/releases/latest"
    try:
        response = request_with_retry("GET", url, headers=_auth_headers())
        release = response.json()
        return {
            "tag_name": release["tag_name"],
            "published_at": release.get("published_at"),
            "url": release.get("html_url"),
        }
    except (httpx.HTTPStatusError, httpx.HTTPError, ValueError):
        logger.warning("No releases found for %s", repo)
        return None
