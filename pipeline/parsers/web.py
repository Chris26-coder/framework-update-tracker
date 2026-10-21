"""
Web page parsers for Tier 2 frameworks.

Supports:
  - OWASP Top 10 for LLM Applications (genai.owasp.org)
  - CIS Controls v8.1 (cisecurity.org)
  - Generic web page scraper (fallback)
"""

from __future__ import annotations

import logging
import re
from typing import Any

from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


def parse_owasp_llm(raw: bytes | str) -> list[dict[str, Any]]:
    """Parse OWASP Top 10 for LLMs from HTML content.

    Extracts the 10 core LLM vulnerabilities (e.g., LLM01: Prompt Injection).
    """
    html_text = raw.decode("utf-8", errors="replace") if isinstance(raw, bytes) else raw
    soup = BeautifulSoup(html_text, "html.parser")

    controls: dict[str, dict[str, Any]] = {}
    pattern = re.compile(r"(LLM\d{2})(?::(\d{4}))?\s*[:-]?\s*(.*)", re.IGNORECASE)

    # First look for structured articles
    articles = soup.find_all("article")
    for art in articles:
        h = art.find(["h2", "h3", "h4"])
        if not h:
            continue
        h_text = h.get_text(strip=True)
        m = pattern.search(h_text)
        if not m:
            continue

        cid_prefix = m.group(1).upper()  # LLM01
        year = m.group(2) or "2025"
        cid = f"{cid_prefix}:{year}"
        title = m.group(3).strip() or cid_prefix

        # Paragraph excerpt
        p = art.find("p") or art.find("div", class_="eael-entry-excerpt")
        body = p.get_text(strip=True) if p else ""

        if cid_prefix not in controls:
            controls[cid_prefix] = {
                "control_id": cid,
                "title": title,
                "body": body,
                "metadata": {
                    "vulnerability_id": cid_prefix,
                    "year": year,
                    "source": "owasp_llm_top10",
                },
            }

    # Fallback to headings if no articles found
    if not controls:
        for h in soup.find_all(["h2", "h3", "h4"]):
            h_text = h.get_text(strip=True)
            m = pattern.search(h_text)
            if not m:
                continue
            cid_prefix = m.group(1).upper()
            year = m.group(2) or "2025"
            cid = f"{cid_prefix}:{year}"
            title = m.group(3).strip() or cid_prefix

            # Next sibling paragraph
            p = h.find_next_sibling(["p", "div"])
            body = p.get_text(strip=True) if p else ""

            if cid_prefix not in controls:
                controls[cid_prefix] = {
                    "control_id": cid,
                    "title": title,
                    "body": body,
                    "metadata": {
                        "vulnerability_id": cid_prefix,
                        "year": year,
                        "source": "owasp_llm_top10",
                    },
                }

    sorted_controls = sorted(controls.values(), key=lambda c: c["control_id"])
    logger.info("Parsed %d controls from OWASP LLM Top 10 HTML", len(sorted_controls))
    return sorted_controls


def parse_cis_controls(raw: bytes | str) -> list[dict[str, Any]]:
    """Parse CIS Controls from HTML content.

    Extracts the 18 CIS Controls from cisecurity.org.
    """
    html_text = raw.decode("utf-8", errors="replace") if isinstance(raw, bytes) else raw
    soup = BeautifulSoup(html_text, "html.parser")

    controls: dict[str, dict[str, Any]] = {}
    pattern = re.compile(r"CIS\s+Control\s+(\d+)\s*[:–-]\s*(.*)", re.IGNORECASE)

    # Check accordion items
    items = soup.find_all("div", class_="accordion__item")
    for it in items:
        title_el = it.find(["h4", "h3", "div"], class_=lambda c: c and "title" in c)
        if not title_el:
            continue
        title_txt = title_el.get_text(strip=True)
        m = pattern.search(title_txt)
        if not m:
            continue

        num = int(m.group(1))
        cid = f"CIS-{num}"
        title = m.group(2).strip()

        # Body: look for content div or extract text after title
        body_el = it.find("div", class_=lambda c: c and ("content" in c or "body" in c or "desc" in c))
        if body_el:
            body = body_el.get_text(separator=" ", strip=True)
        else:
            all_txt = it.get_text(separator=" ", strip=True)
            body = all_txt.replace(title_txt, "").strip()

        controls[cid] = {
            "control_id": cid,
            "title": title,
            "body": body,
            "metadata": {
                "control_number": num,
                "framework": "cis-controls-v8",
                "version": "v8.1",
            },
        }

    # Fallback to headings
    if not controls:
        for h in soup.find_all(["h1", "h2", "h3", "h4", "h5"]):
            h_text = h.get_text(strip=True)
            m = pattern.search(h_text)
            if not m:
                continue
            num = int(m.group(1))
            cid = f"CIS-{num}"
            title = m.group(2).strip()
            p = h.find_next_sibling(["p", "div"])
            body = p.get_text(strip=True) if p else ""

            controls[cid] = {
                "control_id": cid,
                "title": title,
                "body": body,
                "metadata": {
                    "control_number": num,
                    "framework": "cis-controls-v8",
                    "version": "v8.1",
                },
            }

    sorted_controls = sorted(controls.values(), key=lambda c: int(c["metadata"]["control_number"]))
    logger.info("Parsed %d controls from CIS Controls HTML", len(sorted_controls))
    return sorted_controls


def parse_webpage(raw: bytes | str) -> list[dict[str, Any]]:
    """Generic web page parser dispatcher.

    Auto-detects whether the content is OWASP LLM Top 10, CIS Controls,
    or generic content.
    """
    html_text = raw.decode("utf-8", errors="replace") if isinstance(raw, bytes) else raw

    if "LLM01" in html_text or "Prompt Injection" in html_text:
        return parse_owasp_llm(html_text)

    if "CIS Control" in html_text:
        return parse_cis_controls(html_text)

    # Generic page fallback
    soup = BeautifulSoup(html_text, "html.parser")
    # Remove script, style, nav, footer
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()

    main_text = soup.get_text(separator=" ", strip=True)
    title = soup.title.string.strip() if soup.title and soup.title.string else "Web Page"

    return [
        {
            "control_id": "PAGE-CONTENT",
            "title": title,
            "body": main_text[:5000],
            "metadata": {
                "type": "web_page_summary",
                "length": len(main_text),
            },
        }
    ]
