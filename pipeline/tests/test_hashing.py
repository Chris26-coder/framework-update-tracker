"""Unit tests for pipeline.core.hashing."""

from pipeline.core.hashing import canonical_json, compute_hash
from pipeline.core.normalize import normalize_controls


class TestCanonicalJson:
    def test_deterministic_output(self):
        controls = [
            {"control_id": "AC-1", "title": "T", "body": "B"},
            {"control_id": "AC-2", "title": "T2", "body": "B2"},
        ]
        a = canonical_json(controls)
        b = canonical_json(controls)
        assert a == b

    def test_excludes_metadata(self):
        c1 = [{"control_id": "AC-1", "title": "T", "body": "B", "metadata": {"x": 1}}]
        c2 = [{"control_id": "AC-1", "title": "T", "body": "B", "metadata": {"y": 2}}]
        assert canonical_json(c1) == canonical_json(c2)


class TestComputeHash:
    def test_consistent_hash(self):
        controls = [{"control_id": "AC-1", "title": "T", "body": "B"}]
        h1 = compute_hash(controls)
        h2 = compute_hash(controls)
        assert h1 == h2
        assert len(h1) == 64  # SHA-256 hex length

    def test_different_content_different_hash(self):
        c1 = [{"control_id": "AC-1", "title": "T", "body": "version1"}]
        c2 = [{"control_id": "AC-1", "title": "T", "body": "version2"}]
        assert compute_hash(c1) != compute_hash(c2)

    def test_whitespace_normalised_before_hashing(self):
        raw1 = [{"control_id": "ac-1", "title": "  hello  ", "body": "a  b"}]
        raw2 = [{"control_id": "AC-1", "title": "hello", "body": "a b"}]
        n1 = normalize_controls(raw1)
        n2 = normalize_controls(raw2)
        assert compute_hash(n1) == compute_hash(n2)
