from pipeline.db import _get_client
client = _get_client()

# 1. Frameworks & controls count
fw_res = client.table('frameworks').select('id, slug, name, source_url, tier').execute()
print(f"=== REAL FRAMEWORKS IN SUPABASE ({len(fw_res.data)}) ===")
for f in fw_res.data:
    v_res = client.table('framework_versions').select('id, version_label, content_hash').eq('framework_id', f['id']).execute()
    total_ctrls = 0
    if v_res.data:
        c_res = client.table('controls').select('id', count='exact').eq('version_id', v_res.data[0]['id']).execute()
        total_ctrls = c_res.count or len(c_res.data)
    print(f"• {f['slug']} ({f['name']}): Tier {f['tier']} | Controls: {total_ctrls} | Source: {f['source_url']}")

# 2. Total controls count
total_c = client.table('controls').select('id', count='exact').execute()
print(f"\nTOTAL CONTROLS IN SUPABASE: {total_c.count}")

# 3. Real Changes detected
chg_res = client.table('changes').select('control_id, change_type, llm_summary, detected_at').execute()
print(f"\n=== REAL CHANGES DETECTED & STORED ({len(chg_res.data)}) ===")
for c in chg_res.data:
    print(f"• [{c['control_id']} | {c['change_type']}] -> {c['llm_summary']}")

# 4. Fetch Runs
runs = client.table('fetch_runs').select('status, started_at, duration_ms, error_message').order('started_at', desc=True).limit(5).execute()
print(f"\n=== LATEST AUDIT RUNS IN SUPABASE ({len(runs.data)}) ===")
for r in runs.data:
    print(f"• {r['started_at']} | Status: {r['status']} | Duration: {r['duration_ms']}ms | Error: {r['error_message']}")
