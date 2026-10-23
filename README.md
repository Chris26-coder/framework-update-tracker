# 🛡️ Framework Update Tracker

[![CI — Lint & Test](https://github.com/framework-tracker/framework-update-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/framework-tracker/framework-update-tracker)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python: 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![React: 18+](https://img.shields.io/badge/React-18%2B-61DAFB.svg)](https://react.dev/)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase%20(Postgres)-3ECF8E.svg)](https://supabase.com/)

An automated, tamper-proof compliance intelligence platform that watches official security framework sources (**NIST, MITRE, OWASP, CIS**), detects upstream modifications via content hashing, diffs changes at the individual control level, generates grounded plain-English summaries, and displays results in a modern **React + Vite** dashboard.

---

## 📑 Table of Contents

- [Problem Statement & Core Principles](#-problem-statement--core-principles)
- [System Architecture](#-system-architecture)
- [Tracked Frameworks Matrix](#-tracked-frameworks-matrix)
- [Database Schema & Security (Supabase)](#-database-schema--security-supabase)
- [Pipeline Workflow & Engine](#-pipeline-workflow--engine)
- [Grounded LLM Summarizer](#-grounded-llm-summarizer)
- [React + Vite Dashboard](#-react--vite-dashboard)
- [Quick Start Guide](#-quick-start-guide)
- [Automated Testing & Idempotency](#-automated-testing--idempotency)
- [Scheduled Automation (GitHub Actions)](#-scheduled-automation-github-actions)
- [Live Historical Diff Demo](#-live-historical-diff-demo)

---

## 🎯 Problem Statement & Core Principles

Security, GRC, and engineering teams rely heavily on compliance frameworks that update without prior notification. Auditing these updates manually is time-consuming and error-prone: a re-ordered section or formatting change can masquerade as hundreds of modifications.

This platform automates the entire lifecycle under strict engineering guarantees:

1. **Content Hashing:** Canonical SHA-256 fingerprints computed over sorted, whitespace-collapsed control objects. If nothing changed, execution stops in milliseconds (`no_change`).
2. **Immutable History:** Strict append-only architecture. Old versions, controls, and diff logs are never updated or deleted.
3. **Control-by-Control Diffing:** Compares catalogs by canonical `control_id` (e.g. `AC-2`, `T1059.001`, `CIS-1`), cleanly isolating `added`, `removed`, and `modified` controls without false positives from line re-ordering.
4. **Strict Idempotency:** Re-running the pipeline on unchanged data produces **0 new records** in Supabase.
5. **Grounded AI Summaries:** Summaries are strictly constrained to the text diff itself—the model only sees the old and new text of a control with zero external hallucination.
6. **Error Isolation:** A failure or network timeout on one framework source is cleanly recorded in `fetch_runs` and never disrupts subsequent sources.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│       GitHub Actions Scheduled Cron (0 2 * * * / Daily)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Python Pipeline Engine                   │
│                                                             │
│  ┌────────────────┐     ┌──────────────┐    ┌────────────┐  │
│  │ Fetch Upstream │ ──▶ │ Parse Stream │ ─▶ │ Normalise  │  │
│  └────────────────┘     └──────────────┘    └─────┬──────┘  │
│                                                   │         │
│  ┌────────────────┐     ┌──────────────┐    ┌─────▼──────┐  │
│  │ Diff Controls  │ ◀── │ Hash SHA-256 │ ◀─ │ Canonical  │  │
│  └───────┬────────┘     └──────────────┘    │ Sorting    │  │
│          │                                  └────────────┘  │
│          ▼                                                  │
│  ┌────────────────┐     ┌──────────────┐                    │
│  │ Grounded AI    │ ──▶ │ Bulk Insert  │                    │
│  │ Summaries      │     │ Changes      │                    │
│  └────────────────┘     └──────────────┘                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Service Role Key / Server)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Supabase PostgreSQL Database                │
│                                                             │
│  • frameworks          • framework_versions                 │
│  • controls            • changes (with LLM summaries)       │
│  • fetch_runs (audit)  • framework_overview (SQL View)      │
└──────────────────────────────┬──────────────────────────────┘
                               │ (Read-Only Anon Key via RLS)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             React 18 + Vite Interactive Dashboard           │
│                                                             │
│  • Overview Grid       • Control Catalog Explorer           │
│  • Version History     • Side-by-Side Diff Viewer (FR11)    │
│  • Pipeline Audit Log  • Deep Slate Theme (#0B1220)         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Tracked Frameworks Matrix

All 10 security frameworks are actively tracked and live in the database:

| Tier | Framework Name | Slug | Source Type | Parser Format | Live Controls | Status |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **1** | NIST SP 800-53 Rev 5 | `nist-sp-800-53-r5` | GitHub OSCAL | OSCAL JSON | **1,196** | `success` |
| **1** | NIST Cybersecurity Framework 2.0 | `nist-csf-2-0` | NIST CPRT API | CPRT JSON | **906** | `success` |
| **1** | NIST SP 800-171 Rev 3 | `nist-sp-800-171-r3` | NIST CPRT API | CPRT JSON | **1,573** | `success` |
| **1** | NIST AI Risk Management Framework | `nist-ai-rmf` | NIST CPRT API | CPRT JSON | **1,960** | `success` |
| **1** | NIST Privacy Framework 1.0 | `nist-privacy-framework` | NIST CPRT API | CPRT JSON | **249** | `success` |
| **1** | MITRE ATT&CK Enterprise | `mitre-attack` | GitHub CTI | STIX 2.1 JSON | **706** | `success` |
| **1** | MITRE ATLAS (AI Threats) | `mitre-atlas` | GitHub Data | YAML | **170** | `success` |
| **1** | OWASP ASVS 5.0 | `owasp-asvs-5` | GitHub Repo | CSV | **345** | `success` |
| **2** | CIS Controls v8.1 | `cis-controls-v8` | Web Scraper | HTML Parser | **18** | `success` |
| **2** | OWASP Top 10 for LLM Applications | `owasp-llm-top10` | Web Scraper | HTML Parser | **10** | `success` |

> **Total Controls Under Active Monitoring:** **7,133 controls**

---

## 🗄️ Database Schema & Security (Supabase)

All SQL definitions live in [`sql/schema.sql`](file:///c:/Users/chris/OneDrive/Desktop/Framework%20Update%20Tracker/sql/schema.sql) and [`sql/policies.sql`](file:///c:/Users/chris/OneDrive/Desktop/Framework%20Update%20Tracker/sql/policies.sql).

### Tables

1. **`frameworks`**: Master registry containing name, slug, tier (1, 2, 3), official URL, source type, and check configurations.
2. **`framework_versions`**: Immutable log of fetched framework snapshots. Stores `version_label`, canonical `content_hash`, and timestamp.
3. **`controls`**: Individual requirements/controls associated with a version (`version_id`, `control_id`, `title`, `body`, and structured `metadata`).
4. **`changes`**: Granular delta between consecutive versions (`from_version_id`, `to_version_id`, `control_id`, `change_type`, `before_text`, `after_text`, `field_changes`, `llm_summary`).
5. **`fetch_runs`**: Execution log of every scheduled or manual run (`status`, `error_message`, `duration_ms`, `metadata`).

### Views & Row-Level Security (RLS)

- **`framework_overview` View**: Aggregates total versions, total changes, recent 30-day activity, and latest run status into a single low-latency query.
- **RLS Enabled on All Tables**: Read-only public policies (`SELECT using (true)`) for the browser anon key. Mutations (`INSERT`, `UPDATE`, `DELETE`) are strictly forbidden for client tokens and are only performed by the backend pipeline via `service_role`.

---

## ⚙️ Pipeline Workflow & Engine

The pipeline runs as a standalone Python module:

```bash
# Run all enabled frameworks
python -m pipeline

# Run a specific framework
python -m pipeline --slug nist-sp-800-53-r5
```

### Execution Steps Per Framework:

1. **Pre-check / Fetch:**
   - GitHub sources query the commit API for the target file's latest SHA.
   - NIST CPRT sources dynamically aggregate element types with exponential retry.
   - Web sources scrape official HTML endpoints with browser User-Agent headers.
2. **Parse:**
   - Dispatches to specialized parsers: `oscal`, `cprt`, `stix`, `atlas`, `asvs`, or `web`.
3. **Canonical Normalization:**
   - Normalizes unicode (NFC), strips non-semantic whitespace, unifies linebreaks (`\r\n` -> `\n`), uppercases control IDs.
4. **Deterministic Hashing:**
   - Sorts controls lexicographically by `control_id`.
   - Computes SHA-256 fingerprint over title and body text.
5. **Hash Comparison:**
   - Queries `framework_versions` for the latest stored hash.
   - If identical: marks run as `no_change` and exits in <500ms.
6. **Diff & Change Generation:**
   - Compares previous version controls against the new catalog by `control_id`.
   - Identifies `added` (in new, not in old), `removed` (in old, not in new), and `modified` (in both, but normalized title or body differs).
7. **Storage:**
   - Inserts version row, bulk inserts controls (with PostgREST range pagination), and records changes.

---

## 🤖 Grounded LLM Summarizer

Located in [`pipeline/core/summarizer.py`](file:///c:/Users/chris/OneDrive/Desktop/Framework%20Update%20Tracker/pipeline/core/summarizer.py).

### Zero-Hallucination Prompt Design
```
You are an expert cybersecurity compliance auditor.
Your job is to summarize changes made to a security control in 1-2 concise, plain-English sentences.
CRITICAL RULE: You must ONLY state what changed based directly on the provided text.
Do NOT assume, extrapolate, or introduce outside information.
Keep the tone objective, factual, and professional.
```

- **When an LLM Key is Available (`OPENAI_API_KEY`):**
  Calls `gpt-4o-mini` with temperature `0.0`, feeding only `control_id`, old text, and new text.
- **Graceful Offline Heuristic Fallback:**
  When no API key is provided, the engine automatically generates deterministic, accurate summaries from the field diffs (e.g., *"Control SA-15.13 was newly added to the framework"* or *"Title changed from 'Access' to 'Access Enforcement'"*), ensuring 100% test pass rates and full offline capabilities.

---

## 💻 React + Vite Dashboard

Located in [`dashboard/`](file:///c:/Users/chris/OneDrive/Desktop/Framework%20Update%20Tracker/dashboard/). Built with React 18, Vite, TypeScript, and Lucide Icons.

### Design System (PRD Compliant)
- **Dark Mode by Default** (`#0B1220` deep slate, `#111A2E` surface, `#1F2A44` border) with instant light-mode toggle.
- **Semantic Change Colors**: Green for `added`, Amber for `modified`, Red for `removed`.
- **Typography**: Inter for interface elements, JetBrains Mono for control identifiers and diff payloads.

### Pages:
1. **Overview Page**: High-level KPI metrics (Tracked Frameworks, Ingested Controls, Detected Changes, Health), search/tier filters, and framework overview table with "Changed Recently" indicator.
2. **Framework Detail Page**: Metadata, source link, horizontal version history timeline, and a live controls catalog explorer with instant search and pagination.
3. **Change Log Page**: Comprehensive version-pair diff table with filters by change type (`added`, `modified`, `removed`), search by control ID, and expandable diff cards.
4. **Side-by-Side Diff Viewer (FR11)**: Displays grounded summary callout, title change arrows, and side-by-side columns comparing previous text vs. new text.
5. **Runs Page**: Live audit log of all automated pipeline runs with duration in milliseconds and highlighted failure states.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ (tested on Node v22)
- Supabase account & project

### 1. Clone & Set Up Backend

```bash
# Clone the repository
git clone https://github.com/your-org/framework-update-tracker.git
cd "framework-update-tracker"

# Create Python virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and supply your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
```

### 2. Initialize Database

Execute the SQL scripts in your Supabase SQL Editor in order:
1. `sql/schema.sql` (Creates all 5 tables and indexes)
2. `sql/views.sql` (Creates `framework_overview` view)
3. `sql/policies.sql` (Applies Row-Level Security)
4. `sql/seed.sql` (Registers all 10 tracked frameworks)

### 3. Run Pipeline Ingestion

```bash
# Test run against one framework
python -m pipeline --slug nist-csf-2-0

# Ingest all 10 frameworks
python -m pipeline

# Verify status in terminal
python -m pipeline.scripts.report_all
```

### 4. Run the React Dashboard

```bash
# Navigate to dashboard directory
cd dashboard

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Automated Testing & Idempotency

The test suite covers normalization, canonical JSON hashing, diff generation, error isolation, all 6 parser formats, and summarizers.

```bash
# Run unit tests
pytest pipeline/tests/ -v

# Run code linter
ruff check pipeline/

# Build React dashboard
cd dashboard && npm run build
```

**Results:**
- **81 / 81 Python unit tests passing (100%)**
- **0 Ruff warnings / errors**
- **Vite production build succeeds in ~1.0s**

### Automated Idempotency Verification
Re-running the pipeline against already ingested frameworks verifies:
- `content_hash` matches previous snapshot.
- Fetch status logged as `no_change` in under 400ms.
- **0 duplicate records** written to `framework_versions` or `controls`.

---

## ⏰ Scheduled Automation (GitHub Actions)

Configured in [`.github/workflows/scheduled-pipeline.yml`](file:///c:/Users/chris/OneDrive/Desktop/Framework%20Update%20Tracker/.github/workflows/scheduled-pipeline.yml):
- **Automated Cron**: Executes daily at `02:00 UTC` (`0 2 * * *`).
- **Manual Trigger**: Supports `workflow_dispatch` with an optional `slug` input to check all frameworks or trigger a single framework check on demand.
- Secure secrets: Injects `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `GITHUB_TOKEN`.

---

## 🔍 Live Historical Diff Demo

A real-world test was performed against the official NIST SP 800-53 OSCAL repository:

1. **Baseline Ingestion:** Ingested older Git commit `941c978d14` (Feb 2024: 1,193 controls).
2. **Current Ingestion:** Ingested current Git commit `78650f02ad` (1,196 controls).
3. **Detected Changes:** The diff engine detected and saved **8 real upstream modifications** directly in Supabase:
   - **3 Controls Added:** `SA-15.13`, `SA-24`, `SI-2.7`
   - **5 Controls Modified:** `SA-4`, `SA-5`, `SI-2`, `SI-2.5`, `SI-7.12`
4. **Summary & Inspection:** All 8 changes feature plain-English summaries and are viewable in the dashboard's side-by-side diff viewer.

---

## 📜 License

MIT License. See [LICENSE](LICENSE) for details.
