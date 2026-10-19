"""Unit tests for pipeline.parsers.asvs."""

from pathlib import Path

from pipeline.parsers.asvs import parse_asvs_csv

FIXTURES = Path(__file__).resolve().parent / "fixtures"


class TestAsvsParser:
    def setup_method(self):
        self.raw = (FIXTURES / "asvs_sample.csv").read_bytes()
        self.controls = parse_asvs_csv(self.raw)

    def test_total_requirements(self):
        assert len(self.controls) == 3

    def test_requirement_ids(self):
        ids = {c["control_id"] for c in self.controls}
        assert ids == {"1.1.1", "1.1.2", "2.1.1"}

    def test_body_extracted(self):
        req = next(c for c in self.controls if c["control_id"] == "2.1.1")
        assert "12 characters" in req["body"]

    def test_metadata_has_cwe(self):
        req = next(c for c in self.controls if c["control_id"] == "2.1.1")
        assert req["metadata"]["cwe"] == "521"

    def test_accepts_string_input(self):
        text = self.raw.decode("utf-8")
        controls = parse_asvs_csv(text)
        assert len(controls) == 3
