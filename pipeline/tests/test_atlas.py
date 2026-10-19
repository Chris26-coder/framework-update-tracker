"""Unit tests for pipeline.parsers.atlas."""

from pathlib import Path

from pipeline.parsers.atlas import parse_atlas_yaml

FIXTURES = Path(__file__).resolve().parent / "fixtures"


class TestAtlasParser:
    def setup_method(self):
        self.raw = (FIXTURES / "atlas_sample.yaml").read_bytes()
        self.controls = parse_atlas_yaml(self.raw)

    def test_total_techniques(self):
        # 2 top-level + 2 subtechniques = 4
        assert len(self.controls) == 4

    def test_technique_ids(self):
        ids = {c["control_id"] for c in self.controls}
        assert ids == {"AML.T0000", "AML.T0000.000", "AML.T0000.001", "AML.T0001"}

    def test_subtechnique_extracted(self):
        sub = next(c for c in self.controls if c["control_id"] == "AML.T0000.000")
        assert "Discover ML Model Family" in sub["title"]

    def test_body_extracted(self):
        t = next(c for c in self.controls if c["control_id"] == "AML.T0001")
        assert "manipulate products" in t["body"]

    def test_metadata_has_version(self):
        t = next(c for c in self.controls if c["control_id"] == "AML.T0000")
        assert t["metadata"]["atlas_version"] == "4.5.2"

    def test_subtechnique_has_parent(self):
        sub = next(c for c in self.controls if c["control_id"] == "AML.T0000.001")
        assert sub["metadata"]["parent_id"] == "AML.T0000"
        assert sub["metadata"]["is_subtechnique"] is True
