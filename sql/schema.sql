-- =============================================================
-- Framework Update Tracker — Core Schema
-- Supabase / PostgreSQL 15+
-- =============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------
-- 1. frameworks  –  registry of tracked sources
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS frameworks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            TEXT NOT NULL UNIQUE,                       -- e.g. 'nist-sp-800-53-r5'
    name            TEXT NOT NULL,                              -- human-readable name
    tier            SMALLINT NOT NULL DEFAULT 1 CHECK (tier BETWEEN 1 AND 3),
    source_url      TEXT NOT NULL,                              -- canonical upstream URL
    source_type     TEXT NOT NULL CHECK (source_type IN (
                        'github_repo', 'cprt_api', 'web_page', 'announcement'
                    )),
    parser_key      TEXT NOT NULL,                              -- maps to parser module
    check_config    JSONB NOT NULL DEFAULT '{}',                -- repo path, branch, tag pattern, etc.
    enabled         BOOLEAN NOT NULL DEFAULT TRUE,
    last_checked_at TIMESTAMPTZ,
    last_change_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_frameworks_slug ON frameworks (slug);

-- -----------------------------------------------------------
-- 2. framework_versions  –  append-only version snapshots
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS framework_versions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id    UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
    version_label   TEXT NOT NULL,                              -- tag, commit SHA prefix, date stamp
    content_hash    TEXT NOT NULL,                              -- SHA-256 of normalised canonical content
    raw_metadata    JSONB NOT NULL DEFAULT '{}',                -- commit info, release notes URL, etc.
    fetched_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Idempotency guard: same framework + same content = same version
    CONSTRAINT uq_version_content UNIQUE (framework_id, content_hash)
);

CREATE INDEX idx_versions_framework ON framework_versions (framework_id, fetched_at DESC);

-- -----------------------------------------------------------
-- 3. controls  –  individual controls / techniques per version
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS controls (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id      UUID NOT NULL REFERENCES framework_versions(id) ON DELETE CASCADE,
    control_id      TEXT NOT NULL,                              -- e.g. 'AC-2', 'T1059.001'
    title           TEXT,
    body            TEXT,                                        -- full description / requirement text
    metadata        JSONB NOT NULL DEFAULT '{}',                -- family, impact, priority, etc.

    CONSTRAINT uq_control_per_version UNIQUE (version_id, control_id)
);

CREATE INDEX idx_controls_version ON controls (version_id);
CREATE INDEX idx_controls_control_id ON controls (control_id);

-- -----------------------------------------------------------
-- 4. changes  –  control-level diffs between consecutive versions
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS changes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id    UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
    from_version_id UUID NOT NULL REFERENCES framework_versions(id) ON DELETE CASCADE,
    to_version_id   UUID NOT NULL REFERENCES framework_versions(id) ON DELETE CASCADE,
    control_id      TEXT NOT NULL,
    change_type     TEXT NOT NULL CHECK (change_type IN ('added', 'removed', 'modified')),
    before_text     TEXT,                                        -- NULL for 'added'
    after_text      TEXT,                                        -- NULL for 'removed'
    field_changes   JSONB NOT NULL DEFAULT '{}',                 -- structured field-level diffs
    llm_summary     TEXT,                                        -- grounded LLM summary (nullable, async backfill)
    detected_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_change_per_diff UNIQUE (from_version_id, to_version_id, control_id)
);

CREATE INDEX idx_changes_framework ON changes (framework_id, detected_at DESC);
CREATE INDEX idx_changes_versions  ON changes (from_version_id, to_version_id);
CREATE INDEX idx_changes_type      ON changes (change_type);

-- -----------------------------------------------------------
-- 5. fetch_runs  –  execution log for every pipeline invocation
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS fetch_runs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id    UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
    status          TEXT NOT NULL CHECK (status IN (
                        'running', 'success', 'no_change', 'failed'
                    )),
    version_id      UUID REFERENCES framework_versions(id),      -- set on success
    error_message   TEXT,
    duration_ms     INTEGER,
    metadata        JSONB NOT NULL DEFAULT '{}',                  -- commit checked, HTTP status, etc.
    started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at     TIMESTAMPTZ
);

CREATE INDEX idx_runs_framework ON fetch_runs (framework_id, started_at DESC);
CREATE INDEX idx_runs_status    ON fetch_runs (status);
