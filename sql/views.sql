-- =============================================================
-- Framework Update Tracker — Views
-- =============================================================

-- framework_overview: Powers the dashboard Overview page.
-- One row per framework with latest version info and change counts.

CREATE OR REPLACE VIEW framework_overview AS
SELECT
    f.id                                        AS framework_id,
    f.slug,
    f.name,
    f.tier,
    f.source_url,
    f.enabled,
    f.last_checked_at,
    f.last_change_at,

    -- Latest version info
    lv.id                                       AS latest_version_id,
    lv.version_label                             AS latest_version_label,
    lv.content_hash                              AS latest_content_hash,
    lv.fetched_at                                AS latest_fetched_at,

    -- Total versions tracked
    (SELECT COUNT(*) FROM framework_versions v
        WHERE v.framework_id = f.id)             AS total_versions,

    -- Total changes detected (all time)
    (SELECT COUNT(*) FROM changes c
        WHERE c.framework_id = f.id)             AS total_changes,

    -- Changes in last 30 days
    (SELECT COUNT(*) FROM changes c
        WHERE c.framework_id = f.id
          AND c.detected_at >= now() - INTERVAL '30 days')
                                                AS changes_last_30d,

    -- Latest run status
    lr.status                                   AS last_run_status,
    lr.started_at                               AS last_run_at,
    lr.error_message                            AS last_run_error,
    lr.duration_ms                              AS last_run_duration_ms

FROM frameworks f

-- Latest version (most recent by fetched_at)
LEFT JOIN LATERAL (
    SELECT v.id, v.version_label, v.content_hash, v.fetched_at
    FROM framework_versions v
    WHERE v.framework_id = f.id
    ORDER BY v.fetched_at DESC
    LIMIT 1
) lv ON TRUE

-- Latest fetch run
LEFT JOIN LATERAL (
    SELECT r.status, r.started_at, r.error_message, r.duration_ms
    FROM fetch_runs r
    WHERE r.framework_id = f.id
    ORDER BY r.started_at DESC
    LIMIT 1
) lr ON TRUE;

-- Grant read access to anon for the view
GRANT SELECT ON framework_overview TO anon;
