"""
MITRE ATT&CK STIX 2.1 JSON Parser.

Parses the Enterprise ATT&CK STIX bundle and extracts
techniques (``attack-pattern`` objects) as controls.

Filters out revoked and deprecated techniques.
Each technique's ``external_id`` (e.g. T1059, T1059.001)
becomes the ``control_id``.
"""

from __future__ import annotations

import json
import logging
from typing import Any

logger = logging.getLogger(__name__)


def parse_stix_bundle(raw_content: bytes | str) -> list[dict[str, Any]]:
    """Parse a STIX 2.1 bundle into a flat list of control dicts.

    Only ``attack-pattern`` objects that are neither revoked
    nor deprecated are included.
    """
    if isinstance(raw_content, bytes):
        raw_content = raw_content.decode("utf-8")

    data = json.loads(raw_content)
    objects = data.get("objects", [])

    controls: list[dict[str, Any]] = []

    for obj in objects:
        if obj.get("type") != "attack-pattern":
            continue
        if obj.get("revoked", False) or obj.get("x_mitre_deprecated", False):
            continue

        technique_id = _get_attack_id(obj)
        if not technique_id:
            continue

        tactics = [
            phase.get("phase_name", "")
            for phase in obj.get("kill_chain_phases", [])
            if phase.get("kill_chain_name") == "mitre-attack"
        ]

        controls.append(
            {
                "control_id": technique_id,
                "title": obj.get("name", ""),
                "body": obj.get("description", ""),
                "metadata": {
                    "tactics": tactics,
                    "platforms": obj.get("x_mitre_platforms", []),
                    "is_subtechnique": obj.get("x_mitre_is_subtechnique", False),
                    "stix_id": obj.get("id", ""),
                    "created": obj.get("created", ""),
                    "modified": obj.get("modified", ""),
                },
            }
        )

    logger.info(
        "Parsed %d techniques from STIX bundle (%d total objects)",
        len(controls),
        len(objects),
    )
    return controls


def _get_attack_id(obj: dict[str, Any]) -> str | None:
    """Extract the ATT&CK technique ID from external references."""
    for ref in obj.get("external_references", []):
        if ref.get("source_name") == "mitre-attack":
            return ref.get("external_id")
    return None
