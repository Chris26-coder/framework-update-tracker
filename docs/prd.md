# Framework Update Tracker: PRD, System Design and Build Plan

**Stack:** Python pipeline, Supabase (Postgres), React + Vite dashboard.  
**Timeline:** 2 weeks (10 working days).

---

## Part 1: Product Requirements Document (PRD)

### 1.1 Problem
Security teams rely on frameworks (NIST, MITRE, OWASP, CIS) that change without much notice. Checking each one by hand is slow, and nobody can easily see exactly what changed. We need a tool that watches the official sources, detects updates automatically, and shows a precise, readable change log.

### 1.2 Goals
- Detect updates to tracked frameworks automatically, with no manual steps once running.
- Store every version permanently (append-only history).
- Show exactly which controls were added, removed or modified.
- Explain each change in plain English, grounded only in the diff.
- Present everything in a clean, good-looking dashboard.

### 1.3 Non-goals
- Storing paid or gated content (Tier 3: announcements only, never the text).
- Editing or deleting history.
- User accounts or authentication (the dashboard is read-only).
- Compliance mapping or recommendations.

### 1.4 Users
- **Security analyst:** wants to know quickly whether a framework changed and what it means.
- **Compliance or GRC lead:** wants a trustworthy audit trail of versions.
- **Reviewer (mentor):** wants to see clean engineering, idempotency and failure handling.

### 1.5 Scope: Sources to Track

| Tier | Framework | Source | Format | Change Signal |
|------|-----------|--------|--------|---------------|
| 1 | NIST SP 800-53 Rev 5 | usnistgov/oscal-content | OSCAL JSON | New commit to catalog file |
| 1 | NIST CSF 2.0 | NIST CPRT | JSON export | Content hash |
| 1 | NIST SP 800-171 Rev 3 | NIST CPRT | JSON export | Content hash |
| 1 | NIST AI RMF | NIST CPRT | JSON export | Content hash |
| 1 | NIST Privacy Framework | NIST CPRT | JSON export | Content hash |
| 1 | MITRE ATT&CK | mitre/cti | STIX JSON | New commit or release |
| 1 | MITRE ATLAS | mitre-atlas/atlas-data (`dist/ATLASlatest.yaml`) | YAML | Content version change (monthly) |
| 1 | OWASP ASVS 5.0 | OWASP/ASVS | CSV | New release tag |
| 2 | OWASP Top 10 for LLMs | genai.owasp.org | Web page | Page content hash |
| 2 | CIS Controls v8.1 | cisecurity.org | Web page | Version string on page |
| 3 | ISO/IEC 27001, PCI DSS, SOC 2, CSA CCM | Official sites | Gated | Announcement only |

### 1.6 Functional Requirements
- **FR1 (Must):** Fetch each framework from its official source on a schedule.
- **FR2 (Must):** Compute a SHA-256 hash of normalized content and compare with latest stored hash.
- **FR3 (Must):** If unchanged, stop and log "no_change"; create zero new records.
- **FR4 (Must):** If changed, store a new version row plus all its controls; never overwrite.
- **FR5 (Must):** Diff old vs new by control ID: added, removed, modified.
- **FR6 (Must):** Store each change with from/to versions and control ID.
- **FR7 (Must):** Generate a plain-English LLM summary per change, using only the diff text.
- **FR8 (Must):** Log every run in `fetch_runs` with status and error message.
- **FR9 (Must):** One failing source must not stop others.
- **FR10 (Must):** Dashboard: framework overview, version history, change log, run history.
- **FR11 (Must):** Dashboard: side-by-side old/new text for modified controls.
- **FR12 (Should):** Tier 3: record announcements only.
- **FR13 (Could):** Slack or email alert on change.
- **FR14 (Could):** Search over latest controls (pgvector).

### 1.7 Non-functional Requirements
- **Idempotent:** running the job twice with no upstream change creates zero records.
- **Immutable history:** no UPDATE or DELETE on versions, controls or changes (except filling a null summary).
- **Secure:** no secrets in the repo; browser uses read-only anon key with Row Level Security.
- **Resilient:** timeouts, retries with backoff, per-source error isolation.
- **Observable:** every run logged; failures visible in the dashboard.
- **Maintainable:** adding a new framework means one config entry plus (at most) one parser.
- **Usable:** dashboard loads quickly, responsive, light and dark mode.

---

## Part 2: System Design

### 2.1 High-Level Architecture
Pipeline flow: Fetch -> Parse -> Normalize -> Hash -> Changed? -> Store version + controls -> Diff by control ID -> Save changes -> LLM summary (grounded) -> Supabase.

### 2.2 Normalization Rules
- Trim and collapse whitespace; normalize unicode and line endings.
- Uppercase control IDs and use consistent format (`ac-2` -> `AC-2`).
- Strip volatile fields (timestamps, internal IDs) before hashing.
- Sort controls by ID before hashing.
- Web pages: extract main content only (strip nav, footer, cookie banners).

### 2.3 Diff Algorithm
```python
old = {control_id: (title, text)}
new = {control_id: (title, text)}
added = new.keys - old.keys
removed = old.keys - new.keys
modified = {k for k in both if old[k] != new[k]}
```

---

## Part 3: Step-by-Step Build Plan Summary

- **Days 1–2: Foundations** (Repo, Supabase, schemas, policies, views, seed, config, db, CI).
- **Days 3–4: One Framework End-to-End** (NIST SP 800-53 OSCAL pipeline, hash check, idempotency test).
- **Days 5–6: Diffs and Remaining Tier 1 Sources** (Diff engine, CPRT, ATT&CK, ATLAS, ASVS).
- **Day 7: Automation and Resilience** (Generic runner, retries, error isolation, Tier 2 web scraping, GitHub Actions schedule).
- **Day 8: LLM Summaries** (Grounded prompt, summarizer, null-summary backfill).
- **Days 9–10: Dashboard, Docs & Demo** (React + Vite + Tailwind dashboard, 4 pages, demo rehearsal).
