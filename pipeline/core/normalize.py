"""
Pure text-normalisation utilities.

Every function here is a pure function with zero I/O.
Used to clean and standardise framework content before hashing,
so that insignificant differences (extra whitespace, Unicode
variants) do not cause false-positive change detections.
"""

from __future__ import annotations

import re
import unicodedata


def normalize_text(text: str | None) -> str:
    """Normalise a block of text for consistent comparison.

    Steps:
      1. Unicode NFC normalisation.
      2. Line-ending normalisation (CRLF / CR -> LF).
      3. Collapse runs of whitespace to a single space.
      4. Strip leading / trailing whitespace.
    """
    if not text:
        return ""
    text = unicodedata.normalize("NFC", text)
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def normalize_control_id(control_id: str) -> str:
    """Upper-case and trim a control identifier.

    Examples
    --------
    >>> normalize_control_id('ac-2')
    'AC-2'
    >>> normalize_control_id('ac-2(1)')
    'AC-2(1)'
    >>> normalize_control_id('t1059.001')
    'T1059.001'
    """
    if not control_id:
        return ""
    return control_id.strip().upper()


def normalize_control(control: dict) -> dict:
    """Normalise every text field inside a single control dict.

    Accepts either ``body`` *or* ``text`` as the prose key and
    always outputs ``body``.
    """
    return {
        "control_id": normalize_control_id(control.get("control_id", "")),
        "title": normalize_text(control.get("title")),
        "body": normalize_text(control.get("body") or control.get("text", "")),
        "metadata": control.get("metadata", {}),
    }


def normalize_controls(controls: list[dict]) -> list[dict]:
    """Normalise and sort a list of controls by ``control_id``."""
    normalised = [normalize_control(c) for c in controls]
    normalised.sort(key=lambda c: c["control_id"])
    return normalised
