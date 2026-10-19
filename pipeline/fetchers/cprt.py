"""
NIST CPRT (Cybersecurity and Privacy Reference Tool) fetcher.

Downloads framework data from the NIST CPRT JSON API for:
  - NIST CSF 2.0 (CSF_2_0_0)
  - NIST SP 800-171 Rev 3 (SP_800_171_3_0_0)
  - NIST AI RMF 1.0 (AI_100_1_0_0)
  - NIST Privacy Framework 1.0 (PF_1_0_0)
"""

from __future__ import annotations

import json
import logging
from typing import Any

import httpx

from .base import request_with_retry

logger = logging.getLogger(__name__)

CPRT_API_BASE = "https://csrc.nist.gov/extensions/nudp/services/json/nudp"

CPRT_VERSION_MAP: dict[str, str] = {
    "csf_2_0": "CSF_2_0_0",
    "sp_800_171_3_0_0": "SP_800_171_3_0_0",
    "ai_rmf_1_0": "AI_100_1_0_0",
    "privacy_1_0": "PF_1_0_0",
}


def fetch_cprt_framework(cprt_id: str) -> tuple[bytes, dict[str, Any]]:
    """Fetch all element types for a framework from the NIST CPRT API.

    Args:
        cprt_id: Identifier from check_config, e.g. 'csf_2_0'.

    Returns:
        (raw_json_bytes, metadata_dict)
    """
    version_id = CPRT_VERSION_MAP.get(cprt_id, cprt_id)

    # 1. Fetch metadata to discover all element types for this version
    meta_url = f"{CPRT_API_BASE}/framework/metadata"
    logger.info("Fetching CPRT framework metadata from %s", meta_url)
    meta_resp = request_with_retry("GET", meta_url, headers={"Accept": "application/json"})
    meta_data = meta_resp.json()

    frameworks = meta_data.get("cprt", {}).get("frameworks", [])
    target_version = None
    target_fw_name = ""

    for fw in frameworks:
        for v in fw.get("frameworkVersionList", []):
            if v.get("frameworkVersionIdentifier") == version_id:
                target_version = v
                target_fw_name = fw.get("name", "")
                break
        if target_version:
            break

    if not target_version:
        raise ValueError(f"Framework version identifier '{version_id}' not found in CPRT metadata")

    element_types = [
        t["elementTypeIdentifier"]
        for t in target_version.get("elementTypes", [])
        if "elementTypeIdentifier" in t
    ]

    logger.info(
        "Fetching %d element types for %s (%s)",
        len(element_types),
        target_fw_name,
        version_id,
    )

    all_elements: list[dict[str, Any]] = []

    for t_id in element_types:
        url = f"{CPRT_API_BASE}/framework/version/{version_id}/type/{t_id}/elements"
        try:
            r = request_with_retry("GET", url, headers={"Accept": "application/json"})
            resp_data = r.json()
            elems = resp_data.get("response", {}).get("elements", [])
            all_elements.extend(elems)
        except (httpx.HTTPError, json.JSONDecodeError, KeyError) as e:
            logger.warning("Could not fetch elements for type '%s': %s", t_id, e)

    logger.info("Collected %d total elements for %s", len(all_elements), version_id)

    bundle = {
        "frameworkVersionIdentifier": version_id,
        "name": target_fw_name,
        "version": target_version.get("version", ""),
        "elements": all_elements,
    }

    raw_bytes = json.dumps(bundle, ensure_ascii=False).encode("utf-8")
    metadata = {
        "cprt_id": cprt_id,
        "framework_version_identifier": version_id,
        "framework_name": target_fw_name,
        "version_label": target_version.get("version", version_id),
        "element_types_count": len(element_types),
        "total_elements": len(all_elements),
    }

    return raw_bytes, metadata
