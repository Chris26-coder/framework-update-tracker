# Development Log

## Day 1 — 2026-10-15 — Foundations & Architecture Setup

### Decisions Made
- **Database**: Supabase (hosted PostgreSQL) with Row-Level Security.
- **Pipeline Language**: Python 3.11+ with `httpx` for HTTP, `supabase-py` for DB.
- **Dashboard**: React 18 + Vite + Tailwind CSS (to be scaffolded in Phase 6).
- **Change Detection**: Canonical SHA-256 hashing of normalised content.
- **Idempotency**: Enforced via database unique constraints — duplicate runs produce zero new rows.
- **I/O Separation**: Core logic modules (`normalize`, `hashing`, `diff`) are pure functions with no network or database calls.

### Files Created
- `sql/schema.sql` — 5 tables: frameworks, framework_versions, controls, changes, fetch_runs
- `sql/policies.sql` — RLS policies: anon=SELECT, service_role=ALL
- `sql/views.sql` — `framework_overview` view for dashboard
- `sql/seed.sql` — 10 framework registry entries (8 Tier 1, 2 Tier 2)
- `pipeline/config.py` — Pydantic-style settings loader from .env
- `pipeline/db.py` — Supabase data-access layer with typed helpers
- `pipeline/configs/frameworks.yaml` — Local framework registry mirror
- `.gitignore`, `.env.example`, `requirements.txt`
- `.github/workflows/ci.yml` — Lint + test CI pipeline

### Next Steps (Phase 2)
- Implement NIST SP 800-53 OSCAL fetcher and parser
- Build pure logic modules: `core/normalize.py`, `core/hashing.py`
- First end-to-end ingestion test
