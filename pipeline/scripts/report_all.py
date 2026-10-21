"""Full report script for all frameworks in Supabase."""
from pipeline.db import _get_client

client = _get_client()
frameworks = client.table("frameworks").select("id, slug, name, tier, source_type").order("tier").order("slug").execute().data

print(f"{'Framework Slug':<25} | {'Tier':<4} | {'Version':<14} | {'Controls':<8} | {'Changes':<7}")
print("-" * 69)

for f in frameworks:
    versions = (
        client.table("framework_versions")
        .select("id, version_label")
        .eq("framework_id", f["id"])
        .order("fetched_at", desc=True)
        .limit(1)
        .execute()
        .data
    )
    if versions:
        v_id = versions[0]["id"]
        v_label = versions[0]["version_label"]
        ctrl_count = (
            client.table("controls")
            .select("id", count="exact")
            .eq("version_id", v_id)
            .execute()
            .count
        )
        chg_count = (
            client.table("changes")
            .select("id", count="exact")
            .eq("framework_id", f["id"])
            .execute()
            .count
        )
    else:
        v_label = "None"
        ctrl_count = 0
        chg_count = 0

    print(f"{f['slug']:<25} | {f['tier']:<4} | {v_label:<14} | {ctrl_count:<8} | {chg_count:<7}")
