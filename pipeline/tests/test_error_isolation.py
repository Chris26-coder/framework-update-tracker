"""
Unit tests for pipeline error isolation.

Verifies that if one framework fetch/parse fails, other frameworks
continue running without disruption, and the failure is logged.
"""

from unittest.mock import MagicMock, patch

from pipeline.run_job import process_framework


class TestErrorIsolation:
    @patch("pipeline.run_job.db")
    @patch("pipeline.run_job.fetch_content")
    def test_failing_framework_does_not_raise(
        self,
        mock_fetch: MagicMock,
        mock_db: MagicMock,
    ) -> None:
        """When fetch fails with an exception, process_framework returns 'failed'."""
        mock_db.start_run.return_value = {"id": "test-run-id"}
        mock_fetch.side_effect = ConnectionError("Upstream server unreachable")

        fw = {
            "id": "mock-fw-id",
            "slug": "mock-framework",
            "parser_key": "oscal",
            "source_type": "github_repo",
            "check_config": {},
        }

        # Should not raise exception
        status = process_framework(fw)

        assert status == "failed"
        mock_db.finish_run.assert_called_once()
        _args, kwargs = mock_db.finish_run.call_args
        assert kwargs["status"] == "failed"
        assert "Upstream server unreachable" in kwargs["error_message"]

    @patch("pipeline.run_job.db")
    @patch("pipeline.run_job.fetch_content")
    def test_multi_framework_isolation(
        self,
        mock_fetch: MagicMock,
        mock_db: MagicMock,
    ) -> None:
        """Sequential runs of framework A (failing) and B (succeeding)."""
        mock_db.start_run.side_effect = [
            {"id": "run-fail"},
            {"id": "run-success"},
        ]
        mock_db.get_latest_version.return_value = None

        # Framework 1 fails on fetch, Framework 2 returns valid controls
        mock_fetch.side_effect = [
            RuntimeError("DNS resolution failed"),
            (b"{}", {"commit_sha": "abc123456789"}),
        ]

        fw1 = {
            "id": "fw-1",
            "slug": "failing-fw",
            "parser_key": "oscal",
            "source_type": "github_repo",
            "check_config": {},
        }

        status1 = process_framework(fw1)
        assert status1 == "failed"

        # Framework 2 should still process even after fw1 failed
        fw2 = {
            "id": "fw-2",
            "slug": "working-fw",
            "parser_key": "asvs",
            "source_type": "github_repo",
            "check_config": {},
        }
        with patch("pipeline.run_job.PARSERS") as mock_parsers:
            mock_parsers.get.return_value = lambda content: [
                {"control_id": "REQ-1", "title": "Test", "body": "Body", "metadata": {}}
            ]
            status2 = process_framework(fw2)

        assert status2 == "success"
