"""
Canonical content hashing.

Produces a deterministic SHA-256 fingerprint of a list of
normalised controls.  The hash is used to detect whether
upstream content has actually changed.

Pure functions only - no I/O.
"""

from __future__ import annotations

import hashlib
import json


def canonical_json(controls: list[dict]) -> str:
    """Convert sorted, normalised controls to a canonical JSON string.

    Only the three fields that matter for change detection are
    included: ``control_id``, ``title``, ``body``.
    """
    canonical = [
        {
            "control_id": c["control_id"],
            "title": c.get("title", ""),
            "body": c.get("body", ""),
        }
        for c in controls
    ]
    return json.dumps(
        canonical, sort_keys=True, ensure_ascii=False, separators=(",", ":")
    )


def compute_hash(controls: list[dict]) -> str:
    """Compute SHA-256 hex digest of canonical control content.

    Args:
        controls: List of normalised, sorted control dicts.

    Returns:
        64-character lowercase hex SHA-256 string.
    """
    content = canonical_json(controls)
    return hashlib.sha256(content.encode("utf-8")).hexdigest()
