create table if not exists public.cura_health_sync_snapshots (
    id uuid primary key default gen_random_uuid(),
    profile_id text not null references public.cura_profiles(id) on delete cascade,
    synced_at timestamptz not null,
    range_start timestamptz not null,
    range_end timestamptz not null,
    source_platform text not null,
    source_vendor text not null,
    source_attribution text not null,
    sleep_sessions_count integer not null default 0,
    total_sleep_minutes integer not null default 0,
    average_heart_rate_bpm integer null,
    steps_count bigint not null default 0,
    payload jsonb not null,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists cura_health_sync_snapshots_profile_id_idx
    on public.cura_health_sync_snapshots (profile_id, synced_at desc);
