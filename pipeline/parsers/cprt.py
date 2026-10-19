"""
NIST CPRT JSON Parser.

Parses JSON responses from the NIST Cybersecurity and Privacy
Reference Tool (CPRT) API.  Covers:
  - NIST CSF 2.0
  - NIST SP 800-171 Rev 3
  - NIST AI RMF 1.0
  - NIST Privacy Framework 1.0

CPRT elements carry:
  elementIdentifier, title, text, elementType.
"""

from __future__ import annotations

import json
import logging
from typing import Any

logger = logging.getLogger(__name__)


def parse_cprt_json(raw_content: bytes | str) -> list[dict[str, Any]]:
    """Parse CPRT JSON into a flat list of control dicts."""
    if isinstance(raw_content, bytes):
        raw_content = raw_content.decode("utf-8")

    data = json.loads(raw_content)
    elements = _extract_elements(data)

    controls: list[dict[str, Any]] = []

    for elem in elements:
        control_id = (
            elem.get("elementIdentifier")
            or elem.get("element_identifier")
            or elem.get("identifier")
            or ""
        )
        title = (
            elem.get("title")
            or elem.get("elementName")
            or elem.get("name")
            or ""
        )
        body = (
            elem.get("text")
            or elem.get("description")
            or elem.get("elementText")
            or ""
        )
        element_type = (
            elem.get("elementType")
            or elem.get("element_type")
            or elem.get("type")
            or ""
        )

        if not control_id:
            continue

        controls.append(
            {
                "control_id": control_id,
                "title": title,
                "body": body,
                "metadata": {"element_type": element_type},
            }
        )

    logger.info("Parsed %d controls from CPRT JSON", len(controls))
    return controls


def _extract_elements(data: dict | list) -> list[dict]:
    """Extract the elements array from various CPRT response wrappers."""
    if isinstance(data, list):
        return data
    if "elements" in data:
        return data["elements"]
    if "response" in data:
        resp = data["response"]
        if isinstance(resp, dict) and "elements" in resp:
            return resp["elements"]
        if isinstance(resp, list):
            return resp
    if "data" in data:
        d = data["data"]
        if isinstance(d, list):
            return d
        if isinstance(d, dict) and "elements" in d:
            return d["elements"]
    if "framework" in data:
        fw = data["framework"]
        if isinstance(fw, dict) and "elements" in fw:
            return fw["elements"]
    logger.warning("Could not find elements in CPRT response structure")
    return []
