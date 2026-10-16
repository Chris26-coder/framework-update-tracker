"""Basic smoke tests to ensure test runner and environment work properly."""

import sys


def test_python_version():
    """Verify running on Python 3.10+."""
    assert sys.version_info >= (3, 10)


def test_imports():
    """Verify critical packages can be imported."""
    import dotenv
    import httpx
    import supabase
    import yaml
    assert httpx is not None
    assert yaml is not None
    assert supabase is not None
    assert dotenv is not None
