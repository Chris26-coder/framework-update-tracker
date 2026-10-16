"""Unit tests for pipeline.core.diff."""

from pipeline.core.diff import diff_controls


class TestDiffControls:
    def test_no_changes(self):
        old = [{"control_id": "AC-1", "title": "T", "body": "B"}]
        new = [{"control_id": "AC-1", "title": "T", "body": "B"}]
        assert diff_controls(old, new) == []

    def test_added_control(self):
        old = []
        new = [{"control_id": "AC-1", "title": "T", "body": "B"}]
        changes = diff_controls(old, new)
        assert len(changes) == 1
        assert changes[0]["change_type"] == "added"
        assert changes[0]["control_id"] == "AC-1"
        assert changes[0]["before_text"] is None
        assert changes[0]["after_text"] == "B"

    def test_removed_control(self):
        old = [{"control_id": "AC-1", "title": "T", "body": "B"}]
        new = []
        changes = diff_controls(old, new)
        assert len(changes) == 1
        assert changes[0]["change_type"] == "removed"
        assert changes[0]["control_id"] == "AC-1"
        assert changes[0]["before_text"] == "B"
        assert changes[0]["after_text"] is None

    def test_modified_control(self):
        old = [{"control_id": "AC-1", "title": "T", "body": "old text"}]
        new = [{"control_id": "AC-1", "title": "T", "body": "new text"}]
        changes = diff_controls(old, new)
        assert len(changes) == 1
        assert changes[0]["change_type"] == "modified"
        assert changes[0]["field_changes"]["body"]["old"] == "old text"
        assert changes[0]["field_changes"]["body"]["new"] == "new text"

    def test_title_change_counts_as_modified(self):
        old = [{"control_id": "AC-1", "title": "Old Title", "body": "B"}]
        new = [{"control_id": "AC-1", "title": "New Title", "body": "B"}]
        changes = diff_controls(old, new)
        assert len(changes) == 1
        assert "title" in changes[0]["field_changes"]

    def test_mixed_changes(self):
        old = [
            {"control_id": "AC-1", "title": "T1", "body": "B1"},
            {"control_id": "AC-2", "title": "T2", "body": "B2"},
        ]
        new = [
            {"control_id": "AC-2", "title": "T2", "body": "B2-updated"},
            {"control_id": "AC-3", "title": "T3", "body": "B3"},
        ]
        changes = diff_controls(old, new)
        types = {c["change_type"] for c in changes}
        assert types == {"added", "removed", "modified"}

    def test_empty_to_empty(self):
        assert diff_controls([], []) == []
