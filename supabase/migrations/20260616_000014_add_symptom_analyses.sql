-- cura_symptom_analyses
-- Stores a per-patient history of completed /analyze results. No RLS —
-- matches cura_health_sync_snapshots convention: only the server-side
-- service-role Supabase client (never the browser/app directly) touches
-- this table.

create table if not exists public.cura_symptom_analyses (
    id uuid primary key default gen_random_uuid(),
    profile_id text not null references public.cura_profiles(id) on delete cascade,
    symptoms_text text not null,
    possible_disease text,
    confidence_level text,
    urgency text not null,
    suggested_action text,
    source text,
    normalized_symptoms text[] not null default '{}',
    iot_flags text[] not null default '{}',
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists cura_symptom_analyses_profile_id_idx
    on public.cura_symptom_analyses (profile_id, created_at desc);
