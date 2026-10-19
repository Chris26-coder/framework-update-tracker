"""
OWASP ASVS CSV Parser.

Parses the OWASP Application Security Verification Standard
CSV export into control dicts.
"""

from __future__ import annotations

import csv
import io
import logging
from typing import Any

logger = logging.getLogger(__name__)


def parse_asvs_csv(raw_content: bytes | str) -> list[dict[str, Any]]:
    """Parse ASVS CSV into a flat list of control dicts."""
    if isinstance(raw_content, bytes):
        raw_content = raw_content.decode("utf-8-sig")  # handle BOM

    reader = csv.DictReader(io.StringIO(raw_content))

    controls: list[dict[str, Any]] = []

    for row in reader:
        norm = {k.strip().lower(): v.strip() for k, v in row.items() if k}

        req_id = (
            norm.get("item")
            or norm.get("req_id")
            or norm.get("requirement_id")
            or norm.get("id")
            or norm.get("#")
            or ""
        )
        if not req_id:
            continue

        description = (
            norm.get("req_description")
            or norm.get("description")
            or norm.get("requirement")
            or norm.get("detailed requirement")
            or ""
        )
        if not description:
            continue

        section = norm.get("section", "") or norm.get("section_name", "")
        chapter = norm.get("name", "") or norm.get("chapter_name", "")

        controls.append(
            {
                "control_id": req_id,
                "title": f"{chapter} - {section}".strip(" -") if chapter or section else "",
                "body": description,
                "metadata": {
                    "chapter": chapter,
                    "section": section,
                    "l1": norm.get("l1", ""),
                    "l2": norm.get("l2", ""),
                    "l3": norm.get("l3", ""),
                    "cwe": norm.get("cwe", ""),
                },
            }
        )

    logger.info("Parsed %d requirements from ASVS CSV", len(controls))
    return controls
