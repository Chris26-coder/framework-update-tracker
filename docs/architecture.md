# Architecture Overview

## System Components

```
┌─────────────────────┐     ┌──────────────────────┐
│  GitHub Actions      │────▶│  Python Pipeline      │
│  (Cron / Manual)     │     │  (pipeline/)          │
└─────────────────────┘     └──────────┬───────────┘
                                       │ service_role key
                                       ▼
                            ┌──────────────────────┐
                            │  Supabase PostgreSQL  │
                            │  (RLS enabled)        │
                            └──────────┬───────────┘
                                       │ anon key (read-only)
                                       ▼
                            ┌──────────────────────┐
                            │  React Dashboard      │
                            │  (dashboard/)         │
                            └──────────────────────┘
```

## Pipeline Flow

1. **Fetch** — Check upstream source for new commits/tags/content
2. **Parse** — Transform raw format (OSCAL, STIX, YAML, CSV, HTML) into normalised controls
3. **Hash** — Compute canonical SHA-256 of all controls
4. **Compare** — If hash differs from latest stored version, proceed
5. **Store** — Append new version + controls to database
6. **Diff** — Compute control-level differences (added/removed/modified)
7. **Summarise** — Generate grounded LLM summary of each change
8. **Log** — Record fetch run status and duration

## Data Integrity Guarantees

- **Append-only**: No UPDATE/DELETE on versions, controls, or changes
- **Idempotent**: Unique constraints prevent duplicate rows on re-runs
- **Fault-isolated**: Each framework runs in its own try/except block
- **Zero-trust**: RLS separates read (dashboard) from write (pipeline)

## Database Tables

| Table | Purpose | Key Constraint |
|-------|---------|----------------|
| `frameworks` | Registry of tracked sources | `UNIQUE(slug)` |
| `framework_versions` | Append-only snapshots | `UNIQUE(framework_id, content_hash)` |
| `controls` | Individual controls per version | `UNIQUE(version_id, control_id)` |
| `changes` | Control-level diffs between versions | `UNIQUE(from_version_id, to_version_id, control_id)` |
| `fetch_runs` | Execution audit log | — |
