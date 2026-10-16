"""Unit tests for pipeline.parsers.oscal."""

from pathlib import Path

from pipeline.parsers.oscal import parse_oscal_catalog

FIXTURES = Path(__file__).resolve().parent / "fixtures"


class TestOscalParser:
    def setup_method(self):
        self.raw = (FIXTURES / "oscal_sample.json").read_bytes()
        self.controls = parse_oscal_catalog(self.raw)

    def test_total_controls(self):
        # ac-1, ac-1.1 (enhancement), ac-2, au-1 = 4
        assert len(self.controls) == 4

    def test_control_ids(self):
        ids = {c["control_id"] for c in self.controls}
        assert ids == {"ac-1", "ac-1.1", "ac-2", "au-1"}

    def test_enhancement_extracted(self):
        enh = [c for c in self.controls if c["control_id"] == "ac-1.1"]
        assert len(enh) == 1
        assert "Automate" in enh[0]["body"]

    def test_nested_prose(self):
        ac2 = next(c for c in self.controls if c["control_id"] == "ac-2")
        # Should contain prose from parent and both sub-items
        assert "Define and document" in ac2["body"]
        assert "Identify types" in ac2["body"]
        assert "Assign account managers" in ac2["body"]

    def test_metadata_contains_family(self):
        ac1 = next(c for c in self.controls if c["control_id"] == "ac-1")
        assert ac1["metadata"]["family"] == "ac"
        assert ac1["metadata"]["family_title"] == "Access Control"

    def test_accepts_string_input(self):
        text = self.raw.decode("utf-8")
        controls = parse_oscal_catalog(text)
        assert len(controls) == 4

    def test_bytes_and_string_produce_same_result(self):
        from_bytes = parse_oscal_catalog(self.raw)
        from_string = parse_oscal_catalog(self.raw.decode("utf-8"))
        assert from_bytes == from_string
