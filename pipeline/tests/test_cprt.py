"""Unit tests for pipeline.parsers.cprt."""

from pathlib import Path

from pipeline.parsers.cprt import parse_cprt_json

FIXTURES = Path(__file__).resolve().parent / "fixtures"


class TestCprtParser:
    def setup_method(self):
        self.raw = (FIXTURES / "cprt_sample.json").read_bytes()
        self.controls = parse_cprt_json(self.raw)

    def test_total_controls(self):
        assert len(self.controls) == 3

    def test_control_ids(self):
        ids = {c["control_id"] for c in self.controls}
        assert ids == {"GV.OC-01", "GV.OC-02", "GV"}

    def test_body_extracted(self):
        gv = next(c for c in self.controls if c["control_id"] == "GV.OC-01")
        assert "cybersecurity risk management" in gv["body"]

    def test_metadata_has_type(self):
        gv = next(c for c in self.controls if c["control_id"] == "GV")
        assert gv["metadata"]["element_type"] == "Function"

    def test_accepts_string_input(self):
        text = self.raw.decode("utf-8")
        controls = parse_cprt_json(text)
        assert len(controls) == 3
