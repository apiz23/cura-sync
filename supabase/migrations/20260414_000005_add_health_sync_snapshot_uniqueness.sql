create unique index if not exists cura_health_sync_snapshots_profile_sync_unique_idx
    on public.cura_health_sync_snapshots (
        profile_id,
        synced_at,
        range_start,
        range_end,
        source_platform,
        source_vendor
    );
