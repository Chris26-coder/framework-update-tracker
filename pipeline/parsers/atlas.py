"""
MITRE ATLAS YAML Parser.

Parses ``ATLASlatest.yaml`` from ``mitre-atlas/atlas-data``
and extracts techniques and subtechniques as controls.
"""

from __future__ import annotations

import logging
from typing import Any

import yaml

logger = logging.getLogger(__name__)


def parse_atlas_yaml(raw_content: bytes | str) -> list[dict[str, Any]]:
    """Parse ATLAS YAML into a flat list of control dicts."""
    if isinstance(raw_content, bytes):
        raw_content = raw_content.decode("utf-8")

    data = yaml.safe_load(raw_content)
    if not isinstance(data, dict):
        return []

    atlas_version = str(data.get("version", "unknown"))
    techniques = list(data.get("techniques", []))

    for matrix in data.get("matrices", []):
        if isinstance(matrix, dict):
            techniques.extend(matrix.get("techniques", []))

    controls: list[dict[str, Any]] = []

    for tech in techniques:
        if isinstance(tech, dict):
            _extract_technique(tech, atlas_version, controls)

    logger.info("Parsed %d techniques from ATLAS v%s", len(controls), atlas_version)
    return controls


def _extract_technique(
    tech: dict[str, Any],
    version: str,
    output: list[dict[str, Any]],
) -> None:
    """Extract a technique and its subtechniques."""
    tech_id = tech.get("id", "")
    tactic_refs = tech.get("tactic-refs", [])

    output.append(
        {
            "control_id": tech_id,
            "title": tech.get("name", ""),
            "body": tech.get("description", ""),
            "metadata": {
                "tactics": tactic_refs,
                "atlas_version": version,
                "is_subtechnique": False,
            },
        }
    )

    for sub in tech.get("subtechniques", []):
        output.append(
            {
                "control_id": sub.get("id", ""),
                "title": sub.get("name", ""),
                "body": sub.get("description", ""),
                "metadata": {
                    "tactics": tactic_refs,
                    "atlas_version": version,
                    "is_subtechnique": True,
                    "parent_id": tech_id,
                },
            }
        )
