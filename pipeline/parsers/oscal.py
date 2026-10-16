"""
OSCAL JSON Catalog Parser.

Parses the NIST SP 800-53 Rev 5 OSCAL catalog format and
extracts all controls and control enhancements into a flat
list of normalised control dicts.

The OSCAL catalog structure is::

    catalog -> groups[] -> controls[] -> controls[] (enhancements)

Each control has:
  - id: ``ac-2``
  - title: ``Account Management``
  - parts[]: contains the requirement prose text
  - controls[]: nested enhancements like ``ac-2.1``
"""

from __future__ import annotations

import json
import logging
from typing import Any

logger = logging.getLogger(__name__)


def parse_oscal_catalog(raw_content: bytes | str) -> list[dict[str, Any]]:
    """Parse an OSCAL JSON catalog into a flat list of control dicts.

    Args:
        raw_content: Raw JSON content (bytes or string).

    Returns:
        List of dicts with keys: ``control_id``, ``title``, ``body``, ``metadata``.
    """
    if isinstance(raw_content, bytes):
        raw_content = raw_content.decode("utf-8")

    data = json.loads(raw_content)
    catalog = data.get("catalog", data)

    controls: list[dict[str, Any]] = []

    for group in catalog.get("groups", []):
        group_id = group.get("id", "")
        group_title = group.get("title", "")

        for control in group.get("controls", []):
            _extract_control(control, group_id, group_title, controls)

    logger.info("Parsed %d controls from OSCAL catalog", len(controls))
    return controls


def _extract_control(
    control: dict[str, Any],
    group_id: str,
    group_title: str,
    output: list[dict[str, Any]],
) -> None:
    """Recursively extract a control and its enhancements."""
    control_id = control.get("id", "")
    title = control.get("title", "")
    body = _extract_prose(control)

    output.append(
        {
            "control_id": control_id,
            "title": title,
            "body": body,
            "metadata": {
                "family": group_id,
                "family_title": group_title,
                "class": control.get("class", ""),
            },
        }
    )

    # Recurse into enhancements
    for enhancement in control.get("controls", []):
        _extract_control(enhancement, group_id, group_title, output)


def _extract_prose(control: dict[str, Any]) -> str:
    """Extract all prose text from a control's parts tree.

    OSCAL controls store their text in ``parts``, which can be
    nested.  Parts carry a ``prose`` field with the actual text.
    """
    prose_parts: list[str] = []
    for part in control.get("parts", []):
        _collect_prose(part, prose_parts)
    return "\n".join(prose_parts)


def _collect_prose(part: dict[str, Any], output: list[str]) -> None:
    """Recursively collect prose from parts and sub-parts."""
    if "prose" in part:
        output.append(part["prose"])
    for sub_part in part.get("parts", []):
        _collect_prose(sub_part, output)
