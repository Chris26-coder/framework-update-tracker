"""
Pipeline entry point - orchestrates the fetch-parse-hash-diff cycle.

Usage::

    python -m pipeline                              # all enabled
    python -m pipeline --slug nist-sp-800-53-r5     # just one

Each framework runs inside its own ``try / except`` block so that
a failure in one source never prevents others from running.
"""

from __future__ import annotations

import argparse
import logging
import time
from typing import Any

from . import db
from .config import settings
from .core.diff import diff_controls
from .core.hashing import compute_hash
from .core.normalize import normalize_controls
from .fetchers import cprt as cprt_fetcher
from .fetchers import github as github_fetcher
from .parsers import asvs as asvs_parser
from .parsers import atlas as atlas_parser
from .parsers import cprt as cprt_parser
from .parsers import oscal as oscal_parser
from .parsers import stix as stix_parser

logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


# ── Parser dispatch table ──

PARSERS: dict[str, Any] = {
    "oscal": oscal_parser.parse_oscal_catalog,
    "cprt": cprt_parser.parse_cprt_json,
    "stix": stix_parser.parse_stix_bundle,
    "atlas": atlas_parser.parse_atlas_yaml,
    "asvs": asvs_parser.parse_asvs_csv,
}


# ── Fetcher dispatch ──


def fetch_content(framework: dict[str, Any]) -> tuple[bytes, dict[str, Any]]:
    """Fetch raw content from the appropriate upstream source.

    Returns:
        ``(raw_content_bytes, metadata_dict)``
    """
    source_type = framework["source_type"]
    config = framework["check_config"]

    if source_type == "github_repo":
        repo = config["repo"]
        branch = config["branch"]
        path = config["path"]

        commit_info = github_fetcher.get_latest_commit_sha(repo, branch, path)
        raw_content = github_fetcher.fetch_file_content(repo, branch, path)

        metadata = {
            "commit_sha": commit_info["sha"],
            "commit_message": commit_info["message"],
            "commit_date": commit_info["date"],
            "commit_url": commit_info["url"],
        }
        return raw_content, metadata

    if source_type == "cprt_api":
        cprt_id = config.get("cprt_id")
        return cprt_fetcher.fetch_cprt_framework(cprt_id)

    raise NotImplementedError(f"Source type not yet implemented: {source_type}")


# ── Per-framework pipeline ──


def process_framework(framework: dict[str, Any]) -> str:
    """Run the full pipeline for a single framework.

    Returns the final status: ``success``, ``no_change``, or ``failed``.
    """
    fw_id = framework["id"]
    slug = framework["slug"]
    parser_key = framework["parser_key"]

    logger.info("\u2501\u2501\u2501 Processing: %s \u2501\u2501\u2501", slug)

    run = db.start_run(fw_id)
    run_id = run["id"]
    start_time = time.time()

    try:
        # 1. Fetch
        logger.info("[%s] Fetching from upstream\u2026", slug)
        raw_content, fetch_metadata = fetch_content(framework)

        # 2. Parse
        parser_fn = PARSERS.get(parser_key)
        if not parser_fn:
            raise NotImplementedError(f"Parser not implemented: {parser_key}")
        logger.info("[%s] Parsing with '%s' parser\u2026", slug, parser_key)
        raw_controls = parser_fn(raw_content)

        # 3. Normalise
        logger.info("[%s] Normalising %d controls\u2026", slug, len(raw_controls))
        controls = normalize_controls(raw_controls)

        # 4. Hash
        content_hash = compute_hash(controls)
        logger.info("[%s] Content hash: %s\u2026", slug, content_hash[:16])

        # 5. Compare with latest stored version
        latest_version = db.get_latest_version(fw_id)

        if latest_version and latest_version["content_hash"] == content_hash:
            duration_ms = int((time.time() - start_time) * 1000)
            logger.info("[%s] No change detected. Done in %dms.", slug, duration_ms)
            db.finish_run(
                run_id,
                status="no_change",
                duration_ms=duration_ms,
                metadata=fetch_metadata,
            )
            db.update_framework_timestamps(fw_id, checked=True, changed=False)
            return "no_change"

        # 6. Store new version
        version_label = fetch_metadata.get("commit_sha", "")[:12] or content_hash[:12]
        logger.info("[%s] Change detected! Storing version: %s", slug, version_label)

        new_version = db.insert_version(
            framework_id=fw_id,
            version_label=version_label,
            content_hash=content_hash,
            raw_metadata=fetch_metadata,
        )
        new_version_id = new_version["id"]

        # 7. Store controls
        logger.info("[%s] Inserting %d controls\u2026", slug, len(controls))
        db.bulk_insert_controls(new_version_id, controls)

        # 8. Diff against previous version (if any)
        if latest_version:
            logger.info("[%s] Computing diff against previous version\u2026", slug)
            old_controls = db.get_controls_for_version(latest_version["id"])
            old_normalised = normalize_controls(old_controls)

            changes = diff_controls(old_normalised, controls)
            if changes:
                logger.info("[%s] Found %d control-level changes.", slug, len(changes))
                db.bulk_insert_changes(
                    framework_id=fw_id,
                    from_version_id=latest_version["id"],
                    to_version_id=new_version_id,
                    changes=changes,
                )
            else:
                logger.info("[%s] No control-level changes in diff.", slug)
        else:
            logger.info("[%s] First version - nothing to diff against.", slug)

        # 9. Finalise
        duration_ms = int((time.time() - start_time) * 1000)
        logger.info("[%s] \u2713 Success in %dms.", slug, duration_ms)

        db.finish_run(
            run_id,
            status="success",
            version_id=new_version_id,
            duration_ms=duration_ms,
            metadata=fetch_metadata,
        )
        db.update_framework_timestamps(fw_id, checked=True, changed=True)
        return "success"

    except Exception as e:
        duration_ms = int((time.time() - start_time) * 1000)
        logger.exception("[%s] ✗ Failed", slug)

        db.finish_run(
            run_id,
            status="failed",
            error_message=str(e)[:500],
            duration_ms=duration_ms,
        )
        db.update_framework_timestamps(fw_id, checked=True, changed=False)
        return "failed"


# ── CLI ──


def main() -> None:
    """CLI entry point."""
    parser = argparse.ArgumentParser(description="Framework Update Tracker Pipeline")
    parser.add_argument(
        "--slug",
        type=str,
        default=None,
        help="Run only the framework with this slug.",
    )
    args = parser.parse_args()

    settings.validate()

    if args.slug:
        framework = db.get_framework_by_slug(args.slug)
        if not framework:
            logger.error("Framework not found: %s", args.slug)
            return
        frameworks = [framework]
    else:
        frameworks = db.get_enabled_frameworks()

    logger.info("Running pipeline for %d framework(s)\u2026", len(frameworks))

    results: dict[str, list[str]] = {"success": [], "no_change": [], "failed": []}

    for fw in frameworks:
        status = process_framework(fw)
        results[status].append(fw["slug"])

    logger.info("\u2501\u2501\u2501 Pipeline Complete \u2501\u2501\u2501")
    logger.info("  Success:   %s", results["success"] or "\u2014")
    logger.info("  No change: %s", results["no_change"] or "\u2014")
    logger.info("  Failed:    %s", results["failed"] or "\u2014")


if __name__ == "__main__":
    main()
