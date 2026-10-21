"""
Web page fetcher.

Downloads HTML content from official web pages for Tier 2 frameworks
(e.g., OWASP Top 10 for LLMs, CIS Controls).
"""

from __future__ import annotations

import logging
from typing import Any

from .base import request_with_retry

logger = logging.getLogger(__name__)

DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


def fetch_web_page(
    url: str,
    *,
    headers: dict[str, str] | None = None,
) -> tuple[bytes, dict[str, Any]]:
    """Fetch HTML content from a web page URL.

    Args:
        url: The web page URL to fetch.
        headers: Optional custom HTTP headers.

    Returns:
        tuple of ``(raw_html_bytes, metadata_dict)``
    """
    req_headers = {**DEFAULT_HEADERS, **(headers or {})}
    logger.info("Fetching web page from %s", url)

    response = request_with_retry("GET", url, headers=req_headers)

    raw_bytes = response.content

    metadata: dict[str, Any] = {
        "url": str(response.url),
        "status_code": response.status_code,
        "content_type": response.headers.get("content-type", "text/html"),
        "etag": response.headers.get("etag", ""),
        "last_modified": response.headers.get("last-modified", ""),
        "content_length": len(raw_bytes),
    }

    logger.info("Fetched %d bytes from %s", len(raw_bytes), response.url)
    return raw_bytes, metadata
