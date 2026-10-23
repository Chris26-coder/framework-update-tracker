"""
LLM Change Summarizer.

Generates concise, strictly-grounded plain-English summaries for
detected control changes (added, removed, modified).

When an LLM API key (e.g., OPENAI_API_KEY) is available, calls the LLM
with a tightly constrained prompt ensuring zero hallucination.
When no API key is set, falls back to a deterministic, rule-based
heuristic summarizer so pipelines and tests run completely offline.
"""

from __future__ import annotations

import difflib
import logging
import os
from typing import Any

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are an expert cybersecurity compliance auditor. "
    "Your job is to summarize changes made to a security control in 1-2 concise, "
    "plain-English sentences. "
    "CRITICAL RULE: You must ONLY state what changed based directly on the provided text. "
    "Do NOT assume, extrapolate, or introduce outside information. "
    "Keep the tone objective, factual, and professional."
)


def _generate_heuristic_summary(
    change_type: str,
    control_id: str,
    diff_payload: dict[str, Any],
) -> str:
    """Generate a clean, deterministic summary without calling an LLM."""
    if change_type == "added":
        new_title = diff_payload.get("title", {}).get("new", "")
        if new_title:
            return f"Control {control_id} ('{new_title}') was newly added to the framework."
        return f"Control {control_id} was newly added to the framework."

    if change_type == "removed":
        old_title = diff_payload.get("title", {}).get("old", "")
        if old_title:
            return f"Control {control_id} ('{old_title}') was removed from the framework."
        return f"Control {control_id} was removed from the framework."

    # Modified
    title_diff = diff_payload.get("title")
    body_diff = diff_payload.get("body")

    summaries: list[str] = []

    if title_diff:
        old_t = title_diff.get("old", "")
        new_t = title_diff.get("new", "")
        summaries.append(f"Title changed from '{old_t}' to '{new_t}'")

    if body_diff:
        old_b = body_diff.get("old", "")
        new_b = body_diff.get("new", "")
        # Compute brief diff highlight
        s = difflib.SequenceMatcher(None, old_b, new_b)
        ratio = s.ratio()
        if ratio > 0.9:
            summaries.append("Minor wording and clarification adjustments in requirements")
        elif len(new_b) > len(old_b) * 1.2:
            summaries.append("Expanded control requirements and guidance text")
        elif len(new_b) < len(old_b) * 0.8:
            summaries.append("Streamlined and simplified control requirements text")
        else:
            summaries.append("Updated requirements guidance and statements")

    if summaries:
        return f"Control {control_id}: " + "; ".join(summaries) + "."

    return f"Control {control_id} was modified."


def summarize_change(
    change: dict[str, Any],
    *,
    api_key: str | None = None,
) -> str:
    """Generate a plain-English summary for a single change record.

    Args:
        change: Dict containing ``change_type``, ``control_id``, and ``diff_payload``.
        api_key: Optional API key. Defaults to environment variable ``OPENAI_API_KEY``
                 or ``LLM_API_KEY``.

    Returns:
        A concise plain-English summary string.
    """
    change_type = change.get("change_type", "modified")
    control_id = change.get("control_id", "")
    diff_payload = change.get("diff_payload") or {}

    # Quick exits for added / removed
    if change_type == "added":
        return _generate_heuristic_summary(change_type, control_id, diff_payload)
    if change_type == "removed":
        return _generate_heuristic_summary(change_type, control_id, diff_payload)

    # For modified, check if LLM key is configured
    key = api_key or os.getenv("OPENAI_API_KEY") or os.getenv("LLM_API_KEY")
    if not key:
        return _generate_heuristic_summary(change_type, control_id, diff_payload)

    try:
        from openai import OpenAI

        client = OpenAI(api_key=key)

        title_diff = diff_payload.get("title", {})
        body_diff = diff_payload.get("body", {})

        user_content = (
            f"Control ID: {control_id}\n"
            f"Title Old: {title_diff.get('old', 'Unchanged')}\n"
            f"Title New: {title_diff.get('new', 'Unchanged')}\n\n"
            f"Requirement Body Old:\n{body_diff.get('old', 'Unchanged')[:2000]}\n\n"
            f"Requirement Body New:\n{body_diff.get('new', 'Unchanged')[:2000]}\n\n"
            "Provide a 1-2 sentence plain-English summary of what changed:"
        )

        resp = client.chat.completions.create(
            model=os.getenv("LLM_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_content},
            ],
            temperature=0.0,
            max_tokens=150,
        )
        content = resp.choices[0].message.content
        if content:
            return content.strip()
    except Exception as e:  # noqa: BLE001 - fallback for any network/API/auth error
        logger.warning("LLM API call failed (%s); falling back to heuristic summary", e)

    return _generate_heuristic_summary(change_type, control_id, diff_payload)


def summarize_changes(
    changes: list[dict[str, Any]],
    *,
    api_key: str | None = None,
) -> list[dict[str, Any]]:
    """Enrich a list of change records with the ``summary`` field in place."""
    for chg in changes:
        if not chg.get("summary"):
            chg["summary"] = summarize_change(chg, api_key=api_key)
    return changes
