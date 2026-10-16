"""Idempotency tests.

Verify that normalising + hashing the same source content
twice always produces the identical hash, and that different
content produces a different hash.
"""

from pathlib import Path

from pipeline.core.hashing import compute_hash
from pipeline.core.normalize import normalize_controls
from pipeline.parsers.oscal import parse_oscal_catalog

FIXTURES = Path(__file__).resolve().parent / "fixtures"


class TestPipelineIdempotency:
    """End-to-end idempotency: parse -> normalise -> hash."""

    def test_same_input_same_hash(self):
        raw = (FIXTURES / "oscal_sample.json").read_bytes()

        controls_a = normalize_controls(parse_oscal_catalog(raw))
        controls_b = normalize_controls(parse_oscal_catalog(raw))

        hash_a = compute_hash(controls_a)
        hash_b = compute_hash(controls_b)

        assert hash_a == hash_b

    def test_whitespace_variance_same_hash(self):
        raw = (FIXTURES / "oscal_sample.json").read_text()
        # inject extra whitespace into the prose
        modified = raw.replace(
            "Develop, document, and disseminate",
            "  Develop,   document,  and   disseminate  ",
        )

        controls_a = normalize_controls(parse_oscal_catalog(raw))
        controls_b = normalize_controls(parse_oscal_catalog(modified))

        assert compute_hash(controls_a) == compute_hash(controls_b)

    def test_real_content_change_different_hash(self):
        raw = (FIXTURES / "oscal_sample.json").read_text()
        modified = raw.replace("Account Management", "Account Administration")

        controls_a = normalize_controls(parse_oscal_catalog(raw))
        controls_b = normalize_controls(parse_oscal_catalog(modified))

        assert compute_hash(controls_a) != compute_hash(controls_b)
