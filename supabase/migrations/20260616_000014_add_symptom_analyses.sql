-- cura_symptom_analyses
-- Stores a per-patient history of completed /analyze results — sensitive
-- medical data. RLS is enabled with NO permissive policies: this means the
-- public anon key (shipped to every browser/app client) is default-denied
-- for both read and write. Only the service-role key (which always bypasses
-- RLS in Supabase, used exclusively server-side via lib/supabase-admin.ts)
-- can touch this table. Auth (who owns which profile_id) is enforced in the
-- Next.js API routes via Clerk sessions, not via Supabase's own auth.uid()
-- (this app does not use Supabase Auth), which is why there are no
-- auth.uid()-based policies here — default-deny + service-role-only access
-- is the correct lockdown for a Clerk-authenticated app.

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

alter table public.cura_symptom_analyses enable row level security;
