-- cura_pilot_feedback
-- Stores usability feedback responses from the CuraSync clinic pilot testing session.
-- All 18 questions from the SUS + participant info form are captured here.

create table if not exists cura_pilot_feedback (
    id                      uuid        primary key default gen_random_uuid(),
    email                   text        not null,

    -- Section 1: Participant information
    role                    text        not null,
    used_during_session     boolean     not null,
    tested_parts            text[]      not null default '{}',

    -- Section 2: System Usability Scale (SUS) — Q4–Q13, each 1–5
    sus_q4                  smallint    not null check (sus_q4  between 1 and 5),
    sus_q5                  smallint    not null check (sus_q5  between 1 and 5),
    sus_q6                  smallint    not null check (sus_q6  between 1 and 5),
    sus_q7                  smallint    not null check (sus_q7  between 1 and 5),
    sus_q8                  smallint    not null check (sus_q8  between 1 and 5),
    sus_q9                  smallint    not null check (sus_q9  between 1 and 5),
    sus_q10                 smallint    not null check (sus_q10 between 1 and 5),
    sus_q11                 smallint    not null check (sus_q11 between 1 and 5),
    sus_q12                 smallint    not null check (sus_q12 between 1 and 5),
    sus_q13                 smallint    not null check (sus_q13 between 1 and 5),

    -- Section 3: Additional feedback (all optional free-text)
    liked_most              text,
    confusing_parts         text,
    errors_faced            text,
    suggested_improvements  text,
    suitable_for_clinic     text        not null,

    submitted_at            timestamptz not null default now(),
    created_at              timestamptz not null default now()
);

-- Row-level security
alter table cura_pilot_feedback enable row level security;

-- Anyone (anon) can submit a response — this is a public form.
create policy "pilot_feedback_public_insert"
    on cura_pilot_feedback
    for insert
    to anon
    with check (true);

-- Only service role (server-side admin) can read/update/delete.
create policy "pilot_feedback_service_role_all"
    on cura_pilot_feedback
    for all
    to service_role
    using (true);
