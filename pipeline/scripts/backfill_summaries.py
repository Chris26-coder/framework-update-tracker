"""
Backfill plain-English summaries for changes already in Supabase.
"""

import sys
from pipeline.core.summarizer import summarize_change
from pipeline.db import _get_client


def backfill(force: bool = False) -> None:
    client = _get_client()
    query = client.table("changes").select("*")
    if not force:
        query = query.is_("llm_summary", "null")
    changes = query.execute().data

    print(f"Found {len(changes)} changes to summarize (force={force}).")

    for ch in changes:
        change_dict = {
            "change_type": ch["change_type"],
            "control_id": ch["control_id"],
            "diff_payload": ch.get("field_changes") or {},
        }
        summary = summarize_change(change_dict)
        print(f"[{ch['control_id']} | {ch['change_type']}] -> {summary}")

        client.table("changes").update({"llm_summary": summary}).eq("id", ch["id"]).execute()

    print("Backfill complete!")


if __name__ == "__main__":
    force_run = "--force" in sys.argv
    backfill(force=force_run)
