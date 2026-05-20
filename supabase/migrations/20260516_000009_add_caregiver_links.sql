-- Caregiver-patient relationship table.
-- A caregiver account (role='caregiver') is linked to one or more patient
-- profiles by the clinic. Patients or staff can revoke access at any time.

create table public.cura_caregiver_links (
  id uuid not null default extensions.uuid_generate_v4(),
  caregiver_profile_id text not null,
  patient_profile_id text not null,
  relationship text null,
  status varchar(20) not null default 'ACTIVE',
  created_at timestamp without time zone not null default current_timestamp,
  updated_at timestamp without time zone not null default current_timestamp,
  constraint cura_caregiver_links_pkey primary key (id),
  constraint cura_caregiver_links_caregiver_fkey
    foreign key (caregiver_profile_id) references cura_profiles (id) on delete cascade,
  constraint cura_caregiver_links_patient_fkey
    foreign key (patient_profile_id) references cura_profiles (id) on delete cascade,
  constraint cura_caregiver_links_unique
    unique (caregiver_profile_id, patient_profile_id),
  constraint cura_caregiver_links_status_check
    check (status in ('ACTIVE', 'PENDING', 'REVOKED'))
) tablespace pg_default;

create index cura_caregiver_links_caregiver_idx
  on public.cura_caregiver_links using btree (caregiver_profile_id) tablespace pg_default;

create index cura_caregiver_links_patient_idx
  on public.cura_caregiver_links using btree (patient_profile_id) tablespace pg_default;
