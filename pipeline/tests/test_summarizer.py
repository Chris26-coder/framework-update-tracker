"""
Unit tests for the LLM change summarizer module.
"""

from unittest.mock import MagicMock, patch

from pipeline.core.summarizer import (
    _generate_heuristic_summary,
    summarize_change,
    summarize_changes,
)


class TestHeuristicSummarizer:
    def test_added_control(self) -> None:
        change = {
            "change_type": "added",
            "control_id": "AC-2.1",
            "diff_payload": {"title": {"new": "Automated Account Management"}},
        }
        summary = summarize_change(change)
        assert "AC-2.1" in summary
        assert "newly added" in summary
        assert "Automated Account Management" in summary

    def test_removed_control(self) -> None:
        change = {
            "change_type": "removed",
            "control_id": "SI-15",
            "diff_payload": {"title": {"old": "Legacy System Tracking"}},
        }
        summary = summarize_change(change)
        assert "SI-15" in summary
        assert "removed" in summary
        assert "Legacy System Tracking" in summary

    def test_modified_title_only(self) -> None:
        diff_payload = {
            "title": {"old": "Access Enforcement", "new": "Access Enforcement and Auditing"},
        }
        summary = _generate_heuristic_summary("modified", "AC-3", diff_payload)
        assert "AC-3" in summary
        assert "Title changed" in summary
        assert "Access Enforcement and Auditing" in summary

    def test_modified_body(self) -> None:
        diff_payload = {
            "body": {
                "old": "The organization shall enforce access.",
                "new": "The organization shall enforce role-based access across all endpoints and servers.",
            }
        }
        summary = _generate_heuristic_summary("modified", "AC-3", diff_payload)
        assert "AC-3" in summary
        assert "requirements" in summary.lower() or "expanded" in summary.lower()


class TestLlmSummarizer:
    @patch("openai.OpenAI")
    def test_llm_summarizer_called_when_key_present(self, mock_openai_cls: MagicMock) -> None:
        mock_client = MagicMock()
        mock_openai_cls.return_value = mock_client
        mock_resp = MagicMock()
        mock_resp.choices = [
            MagicMock(message=MagicMock(content="Control AC-3 was updated to require MFA."))
        ]
        mock_client.chat.completions.create.return_value = mock_resp

        change = {
            "change_type": "modified",
            "control_id": "AC-3",
            "diff_payload": {
                "title": {"old": "Access", "new": "Access"},
                "body": {"old": "Old text", "new": "New text with MFA"},
            },
        }

        summary = summarize_change(change, api_key="test-api-key")
        assert summary == "Control AC-3 was updated to require MFA."
        mock_client.chat.completions.create.assert_called_once()

    def test_summarize_changes_enriches_list(self) -> None:
        changes = [
            {
                "change_type": "added",
                "control_id": "SA-15.13",
                "diff_payload": {"title": {"new": "Critical Software Analysis"}},
            },
            {
                "change_type": "modified",
                "control_id": "SI-2",
                "diff_payload": {
                    "title": {"old": "Flaw Remediation", "new": "Flaw Remediation"},
                    "body": {"old": "Short old text", "new": "Much longer expanded new text requirement"},
                },
            },
        ]

        result = summarize_changes(changes)
        assert len(result) == 2
        assert "summary" in result[0]
        assert "summary" in result[1]
        assert "SA-15.13" in result[0]["summary"]
        assert "SI-2" in result[1]["summary"]
