"""
Base fetcher utilities.

Common HTTP client configuration and retry logic
shared across all fetcher modules.
"""

from __future__ import annotations

import logging
import time
from typing import Any

import httpx

from pipeline.config import settings

logger = logging.getLogger(__name__)


def get_http_client(**kwargs: Any) -> httpx.Client:
    """Create a configured httpx client with timeout settings."""
    return httpx.Client(
        timeout=settings.http_timeout,
        follow_redirects=True,
        **kwargs,
    )


def request_with_retry(
    method: str,
    url: str,
    *,
    headers: dict[str, str] | None = None,
    max_retries: int | None = None,
    **kwargs: Any,
) -> httpx.Response:
    """Make an HTTP request with exponential-backoff retry.

    Retries on 429 (rate-limit), 500, 502, 503, 504.
    """
    retries = max_retries if max_retries is not None else settings.max_retries
    headers = headers or {}

    for attempt in range(retries + 1):
        try:
            with get_http_client() as client:
                response = client.request(method, url, headers=headers, **kwargs)

                if response.status_code == 200:
                    return response

                if response.status_code in (429, 500, 502, 503, 504) and attempt < retries:
                    wait = 2**attempt
                    logger.warning(
                        "HTTP %d from %s, retrying in %ds (attempt %d/%d)",
                        response.status_code,
                        url,
                        wait,
                        attempt + 1,
                        retries,
                    )
                    time.sleep(wait)
                    continue

                response.raise_for_status()

        except httpx.TimeoutException:
            if attempt < retries:
                wait = 2**attempt
                logger.warning(
                    "Timeout for %s, retrying in %ds (attempt %d/%d)",
                    url,
                    wait,
                    attempt + 1,
                    retries,
                )
                time.sleep(wait)
                continue
            raise

    raise httpx.HTTPError(f"Failed after {retries} retries: {url}")
