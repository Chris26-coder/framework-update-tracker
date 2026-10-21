"""
Tests for Tier 2 web page parsers (OWASP LLM Top 10, CIS Controls).
"""

from pathlib import Path

import pytest

from pipeline.parsers.web import parse_cis_controls, parse_owasp_llm, parse_webpage

FIXTURES_DIR = Path(__file__).parent / "fixtures"


@pytest.fixture
def owasp_html() -> str:
    path = FIXTURES_DIR / "owasp_llm_sample.html"
    return path.read_text(encoding="utf-8")


@pytest.fixture
def cis_html() -> str:
    path = FIXTURES_DIR / "cis_sample.html"
    return path.read_text(encoding="utf-8")


class TestOwaspLlmParser:
    def test_total_controls(self, owasp_html: str) -> None:
        controls = parse_owasp_llm(owasp_html)
        assert len(controls) == 3

    def test_control_ids(self, owasp_html: str) -> None:
        controls = parse_owasp_llm(owasp_html)
        ids = [c["control_id"] for c in controls]
        assert ids == ["LLM01:2025", "LLM02:2025", "LLM03:2025"]

    def test_title_and_body(self, owasp_html: str) -> None:
        controls = parse_owasp_llm(owasp_html)
        c1 = controls[0]
        assert c1["title"] == "Prompt Injection"
        assert "Prompt Injection Vulnerability" in c1["body"]
        assert c1["metadata"]["vulnerability_id"] == "LLM01"

    def test_accepts_bytes(self, owasp_html: str) -> None:
        controls = parse_owasp_llm(owasp_html.encode("utf-8"))
        assert len(controls) == 3


class TestCisControlsParser:
    def test_total_controls(self, cis_html: str) -> None:
        controls = parse_cis_controls(cis_html)
        assert len(controls) == 3

    def test_control_ids(self, cis_html: str) -> None:
        controls = parse_cis_controls(cis_html)
        ids = [c["control_id"] for c in controls]
        assert ids == ["CIS-1", "CIS-2", "CIS-3"]

    def test_title_and_body(self, cis_html: str) -> None:
        controls = parse_cis_controls(cis_html)
        c1 = controls[0]
        assert c1["title"] == "Inventory and Control of Enterprise Assets"
        assert "Actively manage" in c1["body"]
        assert c1["metadata"]["control_number"] == 1

    def test_accepts_bytes(self, cis_html: str) -> None:
        controls = parse_cis_controls(cis_html.encode("utf-8"))
        assert len(controls) == 3


class TestGenericWebParser:
    def test_auto_detects_owasp(self, owasp_html: str) -> None:
        controls = parse_webpage(owasp_html)
        assert len(controls) == 3
        assert controls[0]["control_id"] == "LLM01:2025"

    def test_auto_detects_cis(self, cis_html: str) -> None:
        controls = parse_webpage(cis_html)
        assert len(controls) == 3
        assert controls[0]["control_id"] == "CIS-1"

    def test_fallback_generic_page(self) -> None:
        html = "<html><head><title>Test Page</title></head><body><p>Hello world standard page.</p></body></html>"
        controls = parse_webpage(html)
        assert len(controls) == 1
        assert controls[0]["control_id"] == "PAGE-CONTENT"
        assert controls[0]["title"] == "Test Page"
