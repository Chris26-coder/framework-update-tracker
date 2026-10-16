"""
Control-level diff engine.

Compares two sets of controls (old vs new) by ``control_id``
and produces a list of changes: added, removed, modified.

Pure functions only - no I/O.
"""

from __future__ import annotations

from typing import Any


def build_control_map(controls: list[dict]) -> dict[str, dict]:
    """Build a lookup dict from ``control_id`` -> control dict."""
    return {c["control_id"]: c for c in controls}


def diff_controls(
    old_controls: list[dict],
    new_controls: list[dict],
) -> list[dict[str, Any]]:
    """Compute control-level differences between two versions.

    Args:
        old_controls: Normalised controls from the previous version.
        new_controls: Normalised controls from the new version.

    Returns:
        List of change dicts, each with:
          - control_id
          - change_type: 'added' | 'removed' | 'modified'
          - before_text / after_text
          - field_changes: dict of changed fields
    """
    old_map = build_control_map(old_controls)
    new_map = build_control_map(new_controls)

    old_ids = set(old_map.keys())
    new_ids = set(new_map.keys())

    changes: list[dict[str, Any]] = []

    # Added
    for cid in sorted(new_ids - old_ids):
        changes.append(
            {
                "control_id": cid,
                "change_type": "added",
                "before_text": None,
                "after_text": new_map[cid].get("body", ""),
                "field_changes": {},
            }
        )

    # Removed
    for cid in sorted(old_ids - new_ids):
        changes.append(
            {
                "control_id": cid,
                "change_type": "removed",
                "before_text": old_map[cid].get("body", ""),
                "after_text": None,
                "field_changes": {},
            }
        )

    # Modified
    for cid in sorted(old_ids & new_ids):
        old_c = old_map[cid]
        new_c = new_map[cid]

        field_changes: dict[str, dict[str, str]] = {}
        for field in ("title", "body"):
            old_val = old_c.get(field, "")
            new_val = new_c.get(field, "")
            if old_val != new_val:
                field_changes[field] = {"old": old_val, "new": new_val}

        if field_changes:
            changes.append(
                {
                    "control_id": cid,
                    "change_type": "modified",
                    "before_text": old_c.get("body", ""),
                    "after_text": new_c.get("body", ""),
                    "field_changes": field_changes,
                }
            )

    return changes
