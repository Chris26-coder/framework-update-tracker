-- =============================================================
-- Framework Update Tracker — Seed Data
-- Initial registry entries for all tracked frameworks
-- =============================================================

INSERT INTO frameworks (slug, name, tier, source_url, source_type, parser_key, check_config)
VALUES

-- ── Tier 1: Machine-readable, structured sources ──

('nist-sp-800-53-r5',
 'NIST SP 800-53 Rev 5',
 1,
 'https://github.com/usnistgov/oscal-content',
 'github_repo',
 'oscal',
 '{"repo": "usnistgov/oscal-content", "branch": "main", "path": "nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_catalog.json"}'::jsonb
),

('nist-csf-2-0',
 'NIST Cybersecurity Framework 2.0',
 1,
 'https://csrc.nist.gov/projects/cprt',
 'cprt_api',
 'cprt',
 '{"cprt_id": "csf_2_0", "endpoint": "https://csrc.nist.gov/CPRT/catalog/framework/version"}'::jsonb
),

('nist-sp-800-171-r3',
 'NIST SP 800-171 Rev 3',
 1,
 'https://csrc.nist.gov/projects/cprt',
 'cprt_api',
 'cprt',
 '{"cprt_id": "sp_800_171_3_0_0", "endpoint": "https://csrc.nist.gov/CPRT/catalog/framework/version"}'::jsonb
),

('nist-ai-rmf',
 'NIST AI Risk Management Framework',
 1,
 'https://csrc.nist.gov/projects/cprt',
 'cprt_api',
 'cprt',
 '{"cprt_id": "ai_rmf_1_0", "endpoint": "https://csrc.nist.gov/CPRT/catalog/framework/version"}'::jsonb
),

('nist-privacy-framework',
 'NIST Privacy Framework 1.0',
 1,
 'https://csrc.nist.gov/projects/cprt',
 'cprt_api',
 'cprt',
 '{"cprt_id": "privacy_1_0", "endpoint": "https://csrc.nist.gov/CPRT/catalog/framework/version"}'::jsonb
),

('mitre-attack',
 'MITRE ATT&CK',
 1,
 'https://github.com/mitre/cti',
 'github_repo',
 'stix',
 '{"repo": "mitre/cti", "branch": "master", "path": "enterprise-attack/enterprise-attack.json", "tag_pattern": "ATT&CK-v*"}'::jsonb
),

('mitre-atlas',
 'MITRE ATLAS',
 1,
 'https://github.com/mitre-atlas/atlas-data',
 'github_repo',
 'atlas',
 '{"repo": "mitre-atlas/atlas-data", "branch": "main", "path": "dist/ATLAS.yaml"}'::jsonb
),

('owasp-asvs-5',
 'OWASP ASVS 5.0',
 1,
 'https://github.com/OWASP/ASVS',
 'github_repo',
 'asvs',
 '{"repo": "OWASP/ASVS", "branch": "master", "path": "5.0/docs_en/OWASP_Application_Security_Verification_Standard_5.0.0_en.csv", "tag_pattern": "v5.*"}'::jsonb
),

-- ── Tier 2: Semi-structured / web-scraped sources ──

('owasp-llm-top10',
 'OWASP Top 10 for LLM Applications',
 2,
 'https://genai.owasp.org/llm-top-10/',
 'web_page',
 'owasp_llm',
 '{"url": "https://genai.owasp.org/llm-top-10/"}'::jsonb
),

('cis-controls-v8',
 'CIS Controls v8.1',
 2,
 'https://www.cisecurity.org/controls/cis-controls-list/',
 'web_page',
 'cis_controls',
 '{"url": "https://www.cisecurity.org/controls/cis-controls-list/"}'::jsonb
)

ON CONFLICT (slug) DO NOTHING;
