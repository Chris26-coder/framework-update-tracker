# 🛡️ Framework Update Tracker

Automated, tamper-proof monitoring system for cybersecurity and compliance frameworks.

Track changes to **NIST SP 800-53**, **NIST CSF 2.0**, **MITRE ATT&CK**, **OWASP ASVS**, and more — with control-level diffing and grounded AI summaries.

## Status

🚧 **Under Development** — Phase 1 (Foundations) complete.

## Architecture

- **Pipeline**: Python 3.11+ — fetches, parses, hashes, diffs, and logs framework updates
- **Database**: Supabase (PostgreSQL) with Row-Level Security
- **Dashboard**: React 18 + Vite + Tailwind CSS *(coming in Phase 6)*
- **CI/CD**: GitHub Actions for lint, test, and scheduled runs

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd "Framework Update Tracker"
pip install -r requirements.txt

# 2. Configure
cp .env.example .env
# Edit .env with your Supabase and GitHub credentials

# 3. Set up database
# Run sql/schema.sql, policies.sql, views.sql, seed.sql in Supabase SQL editor

# 4. Run the pipeline
python -m pipeline.run_job
```

## Tracked Frameworks

| Tier | Framework | Source Format |
|------|-----------|---------------|
| 1 | NIST SP 800-53 Rev 5 | OSCAL JSON |
| 1 | NIST CSF 2.0 | CPRT JSON |
| 1 | NIST SP 800-171 Rev 3 | CPRT JSON |
| 1 | NIST AI RMF | CPRT JSON |
| 1 | NIST Privacy Framework | CPRT JSON |
| 1 | MITRE ATT&CK | STIX JSON |
| 1 | MITRE ATLAS | YAML |
| 1 | OWASP ASVS 5.0 | CSV |
| 2 | OWASP Top 10 for LLMs | HTML |
| 2 | CIS Controls v8.1 | HTML |

## Project Structure

```
pipeline/           Python pipeline (fetchers, parsers, core logic, DB layer)
sql/                Database schema, RLS policies, views, seed data
dashboard/          React dashboard (Phase 6)
docs/               Architecture docs and dev log
.github/workflows/  CI and scheduled job definitions
```

## License

MIT
