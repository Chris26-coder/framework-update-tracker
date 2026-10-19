"""Unit tests for pipeline.parsers.stix."""

from pathlib import Path

from pipeline.parsers.stix import parse_stix_bundle

FIXTURES = Path(__file__).resolve().parent / "fixtures"


class TestStixParser:
    def setup_method(self):
        self.raw = (FIXTURES / "stix_sample.json").read_bytes()
        self.controls = parse_stix_bundle(self.raw)

    def test_filters_attack_patterns_only(self):
        # 5 objects total but only 2 valid attack-patterns
        assert len(self.controls) == 2

    def test_technique_ids(self):
        ids = {c["control_id"] for c in self.controls}
        assert ids == {"T1059", "T1059.001"}

    def test_excludes_deprecated(self):
        ids = {c["control_id"] for c in self.controls}
        assert "T9999" not in ids

    def test_excludes_revoked(self):
        ids = {c["control_id"] for c in self.controls}
        assert "T9998" not in ids

    def test_body_extracted(self):
        t1059 = next(c for c in self.controls if c["control_id"] == "T1059")
        assert "command and script interpreters" in t1059["body"]

    def test_tactics_in_metadata(self):
        t1059 = next(c for c in self.controls if c["control_id"] == "T1059")
        assert "execution" in t1059["metadata"]["tactics"]

    def test_subtechnique_flag(self):
        sub = next(c for c in self.controls if c["control_id"] == "T1059.001")
        assert sub["metadata"]["is_subtechnique"] is True
