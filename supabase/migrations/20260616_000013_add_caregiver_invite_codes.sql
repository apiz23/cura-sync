-- Caregiver invite codes table.
-- A patient generates a short-lived 6-digit code that a caregiver can redeem
-- via the mobile app to create a caregiver-patient link.

create table public.cura_caregiver_invite_codes (
  id uuid not null default extensions.uuid_generate_v4(),
  patient_id text not null,
  code varchar(6) not null,
  expires_at timestamp without time zone not null,
  used_at timestamp without time zone null,
  used_by text null,
  created_at timestamp without time zone not null default current_timestamp,
  constraint cura_caregiver_invite_codes_pkey primary key (id),
  constraint cura_caregiver_invite_codes_patient_fkey
    foreign key (patient_id) references cura_profiles (id) on delete cascade,
  constraint cura_caregiver_invite_codes_used_by_fkey
    foreign key (used_by) references cura_profiles (id) on delete set null
) tablespace pg_default;

create index cura_caregiver_invite_codes_patient_idx
  on public.cura_caregiver_invite_codes using btree (patient_id) tablespace pg_default;

create index cura_caregiver_invite_codes_code_idx
  on public.cura_caregiver_invite_codes using btree (code) tablespace pg_default;
