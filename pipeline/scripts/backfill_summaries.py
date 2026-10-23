"""
Backfill plain-English summaries for changes already in Supabase.
"""

from pipeline.core.summarizer import summarize_change
from pipeline.db import _get_client


def backfill() -> None:
    client = _get_client()
    changes = (
        client.table("changes")
        .select("*")
        .is_("llm_summary", "null")
        .execute()
        .data
    )

    print(f"Found {len(changes)} changes without summaries.")

    for ch in changes:
        # Reconstruct change dict for summarizer
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
    backfill()
