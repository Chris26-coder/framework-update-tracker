"""
Historical Diff Testing Script for NIST SP 800-53 Rev 5.

Simulates an update by:
1. Clearing existing versions for 'nist-sp-800-53-r5' (clean test state).
2. Fetching & storing historical commit 941c978d14 (Feb 2024) as Version 1.
3. Running the standard pipeline runner, which fetches the latest commit
   (78650f02ad) as Version 2, detects the diff, and stores the changes.
4. Validating and displaying all detected changes from the database.
"""

from __future__ import annotations

import logging
import time

from pipeline import db
from pipeline.core.hashing import compute_hash
from pipeline.core.normalize import normalize_controls
from pipeline.fetchers.github import fetch_file_content
from pipeline.parsers.oscal import parse_oscal_catalog
from pipeline.run_job import process_framework

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

OLD_COMMIT_SHA = "941c978d14"
OLD_COMMIT_DATE = "2024-02-13T17:47:21Z"
OLD_COMMIT_MSG = "Publishing auto-converted artifacts [skip ci]"


def main() -> None:
    client = db._get_client()

    # 1. Fetch framework metadata
    fw = db.get_framework_by_slug("nist-sp-800-53-r5")
    if not fw:
        raise RuntimeError("Framework nist-sp-800-53-r5 not found in DB.")
    fw_id = fw["id"]
    logger.info("Found framework: %s (id=%s)", fw["name"], fw_id)

    # 2. Reset versions and changes for this framework (for a clean 2-step test)
    logger.info("Resetting existing versions and runs for %s...", fw["slug"])
    client.table("fetch_runs").delete().eq("framework_id", fw_id).execute()
    client.table("changes").delete().eq("framework_id", fw_id).execute()
    client.table("framework_versions").delete().eq("framework_id", fw_id).execute()
    logger.info("Clean test state ready.")

    # 3. Download and ingest Older Commit (941c978d14) as Version 1
    config = fw["check_config"]
    repo = config["repo"]
    path = config["path"]

    logger.info("Downloading historical commit %s from %s...", OLD_COMMIT_SHA, repo)
    t0 = time.time()
    raw_old = fetch_file_content(repo, OLD_COMMIT_SHA, path)
    old_controls_raw = parse_oscal_catalog(raw_old)
    old_controls = normalize_controls(old_controls_raw)
    old_hash = compute_hash(old_controls)
    fetch_time = time.time() - t0
    logger.info(
        "Older commit parsed: %d controls in %.2fs. Hash: %s",
        len(old_controls),
        fetch_time,
        old_hash[:16],
    )

    # Insert Version 1 into DB
    v1 = db.insert_version(
        framework_id=fw_id,
        version_label=OLD_COMMIT_SHA,
        content_hash=old_hash,
        raw_metadata={
            "commit_sha": OLD_COMMIT_SHA,
            "commit_message": OLD_COMMIT_MSG,
            "commit_date": OLD_COMMIT_DATE,
            "note": "Historical baseline commit for diff testing",
        },
    )
    v1_id = v1["id"]
    logger.info("Version 1 (Feb 2024) created: %s", v1_id)

    logger.info("Inserting %d controls for Version 1...", len(old_controls))
    db.bulk_insert_controls(v1_id, old_controls)
    logger.info("✓ Version 1 baseline fully loaded in database.")

    # 4. Run the standard pipeline to detect and ingest the latest version
    logger.info("\n" + "=" * 60)
    logger.info("RUNNING LIVE PIPELINE (Looking for latest upstream updates)...")
    logger.info("=" * 60)

    status = process_framework(fw)
    logger.info("Pipeline completed with status: %s", status)
    assert status == "success", f"Expected 'success', got '{status}'"

    # 5. Query and verify changes saved in Supabase
    changes_resp = (
        client.table("changes")
        .select("*")
        .eq("framework_id", fw_id)
        .order("control_id")
        .execute()
    )
    changes = changes_resp.data

    print("\n" + "=" * 60)
    print(f"*** HISTORICAL DIFF TEST RESULTS: {len(changes)} CHANGES SAVED IN SUPABASE ***")
    print("=" * 60)

    for i, c in enumerate(changes, start=1):
        ctype = c["change_type"].upper()
        cid = c["control_id"]
        print(f"\n[{i}] Control: {cid} | Type: {ctype}")
        if c["field_changes"]:
            print(f"    Field changes: {list(c['field_changes'].keys())}")
        if ctype == "ADDED":
            snippet = (c["after_text"] or "")[:120].replace("\n", " ")
            print(f"    Added text preview: \"{snippet}...\"")
        elif ctype == "MODIFIED":
            old_snip = (c["before_text"] or "")[:80].replace("\n", " ")
            new_snip = (c["after_text"] or "")[:80].replace("\n", " ")
            print(f"    Before: \"{old_snip}...\"")
            print(f"    After:  \"{new_snip}...\"")

    # 6. Verify framework_overview view
    overview = (
        client.table("framework_overview")
        .select("*")
        .eq("slug", "nist-sp-800-53-r5")
        .single()
        .execute()
    )
    data = overview.data
    print("\n" + "=" * 60)
    print("DATABASE VIEW 'framework_overview' SUMMARY:")
    print(f"  Framework:        {data['name']}")
    print(f"  Total Versions:   {data['total_versions']}")
    print(f"  Total Changes:    {data['total_changes']}")
    print(f"  Latest Version:   {data['latest_version_label']}")
    print(f"  Last Run Status:  {data['last_run_status']}")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
