"""Unit tests for pipeline.core.normalize."""

from pipeline.core.normalize import (
    normalize_control,
    normalize_control_id,
    normalize_controls,
    normalize_text,
)


class TestNormalizeText:
    def test_empty_and_none(self):
        assert normalize_text(None) == ""
        assert normalize_text("") == ""

    def test_collapses_whitespace(self):
        assert normalize_text("  hello   world  ") == "hello world"

    def test_normalises_line_endings(self):
        assert normalize_text("a\r\nb\rc") == "a b c"

    def test_unicode_nfc(self):
        # e + combining acute  vs  precomposed e-acute
        assert normalize_text("e\u0301") == normalize_text("\u00e9")

    def test_mixed_whitespace(self):
        assert normalize_text("a\t\n  b") == "a b"


class TestNormalizeControlId:
    def test_uppercase(self):
        assert normalize_control_id("ac-2") == "AC-2"

    def test_with_enhancement(self):
        assert normalize_control_id("ac-2(1)") == "AC-2(1)"

    def test_mitre_style(self):
        assert normalize_control_id("t1059.001") == "T1059.001"

    def test_empty(self):
        assert normalize_control_id("") == ""

    def test_strips_whitespace(self):
        assert normalize_control_id("  ac-2  ") == "AC-2"


class TestNormalizeControl:
    def test_normalises_all_fields(self):
        raw = {
            "control_id": "ac-1",
            "title": "  Access  Control  ",
            "body": "some\r\n  text",
        }
        result = normalize_control(raw)
        assert result["control_id"] == "AC-1"
        assert result["title"] == "Access Control"
        assert result["body"] == "some text"

    def test_accepts_text_key(self):
        raw = {"control_id": "ac-2", "title": "T", "text": "body text"}
        result = normalize_control(raw)
        assert result["body"] == "body text"

    def test_preserves_metadata(self):
        raw = {"control_id": "x", "metadata": {"family": "ac"}}
        result = normalize_control(raw)
        assert result["metadata"] == {"family": "ac"}


class TestNormalizeControls:
    def test_sorts_by_control_id(self):
        controls = [
            {"control_id": "au-1", "title": "B"},
            {"control_id": "ac-1", "title": "A"},
        ]
        result = normalize_controls(controls)
        assert result[0]["control_id"] == "AC-1"
        assert result[1]["control_id"] == "AU-1"

    def test_empty_list(self):
        assert normalize_controls([]) == []
