-- =============================================================
-- Framework Update Tracker — Row-Level Security Policies
-- =============================================================
-- Principle:
--   • anon  role  → SELECT only  (dashboard reads)
--   • service_role → full access  (pipeline writes, bypasses RLS)
-- =============================================================

-- Enable RLS on every table
ALTER TABLE frameworks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_versions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls            ENABLE ROW LEVEL SECURITY;
ALTER TABLE changes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE fetch_runs          ENABLE ROW LEVEL SECURITY;

-- ---- Public (anon) read-only policies ----

CREATE POLICY "anon_read_frameworks"
    ON frameworks FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "anon_read_versions"
    ON framework_versions FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "anon_read_controls"
    ON controls FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "anon_read_changes"
    ON changes FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "anon_read_runs"
    ON fetch_runs FOR SELECT
    TO anon
    USING (true);

-- ---- Service-role full-access policies ----
-- Note: service_role bypasses RLS by default in Supabase,
-- but we define explicit policies for documentation and
-- defence-in-depth if the bypass setting is ever toggled.

CREATE POLICY "service_all_frameworks"
    ON frameworks FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_all_versions"
    ON framework_versions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_all_controls"
    ON controls FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_all_changes"
    ON changes FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "service_all_runs"
    ON fetch_runs FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
