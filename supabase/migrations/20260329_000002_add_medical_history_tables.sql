-- Minimal medical history tables for CuraSync.
-- Scope kept intentionally small for the final year project:
-- conditions, allergies, procedures, encounters.
-- Existing medication tables remain the source of truth for medication tracking.

create table public.cura_conditions (
  id uuid not null default extensions.uuid_generate_v4 (),
  profile_id text not null,
  name text not null,
  status character varying(20) not null default 'ACTIVE'::character varying,
  severity character varying(20) null,
  onset_date date null,
  resolved_date date null,
  notes text null,
  created_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint cura_conditions_pkey primary key (id),
  constraint cura_conditions_profile_id_fkey foreign key (profile_id) references cura_profiles (id) on delete cascade,
  constraint cura_conditions_status_check check (
    (status)::text = any (
      (
        array[
          'ACTIVE'::character varying,
          'RESOLVED'::character varying,
          'CHRONIC'::character varying
        ]
      )::text[]
    )
  ),
  constraint cura_conditions_severity_check check (
    severity is null
    or (severity)::text = any (
      (
        array[
          'MILD'::character varying,
          'MODERATE'::character varying,
          'SEVERE'::character varying
        ]
      )::text[]
    )
  )
) TABLESPACE pg_default;

create index cura_conditions_profile_id_idx
  on public.cura_conditions using btree (profile_id) TABLESPACE pg_default;

create index cura_conditions_onset_date_idx
  on public.cura_conditions using btree (onset_date) TABLESPACE pg_default;


create table public.cura_allergies (
  id uuid not null default extensions.uuid_generate_v4 (),
  profile_id text not null,
  allergen text not null,
  reaction text null,
  severity character varying(20) null,
  status character varying(20) not null default 'ACTIVE'::character varying,
  notes text null,
  created_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint cura_allergies_pkey primary key (id),
  constraint cura_allergies_profile_id_fkey foreign key (profile_id) references cura_profiles (id) on delete cascade,
  constraint cura_allergies_status_check check (
    (status)::text = any (
      (
        array[
          'ACTIVE'::character varying,
          'RESOLVED'::character varying
        ]
      )::text[]
    )
  ),
  constraint cura_allergies_severity_check check (
    severity is null
    or (severity)::text = any (
      (
        array[
          'MILD'::character varying,
          'MODERATE'::character varying,
          'SEVERE'::character varying
        ]
      )::text[]
    )
  )
) TABLESPACE pg_default;

create index cura_allergies_profile_id_idx
  on public.cura_allergies using btree (profile_id) TABLESPACE pg_default;


create table public.cura_procedures (
  id uuid not null default extensions.uuid_generate_v4 (),
  profile_id text not null,
  name text not null,
  procedure_date date null,
  facility_name text null,
  outcome text null,
  notes text null,
  created_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint cura_procedures_pkey primary key (id),
  constraint cura_procedures_profile_id_fkey foreign key (profile_id) references cura_profiles (id) on delete cascade
) TABLESPACE pg_default;

create index cura_procedures_profile_id_idx
  on public.cura_procedures using btree (profile_id) TABLESPACE pg_default;

create index cura_procedures_procedure_date_idx
  on public.cura_procedures using btree (procedure_date) TABLESPACE pg_default;


create table public.cura_encounters (
  id uuid not null default extensions.uuid_generate_v4 (),
  profile_id text not null,
  encounter_type character varying(20) not null,
  encounter_date timestamp without time zone not null default CURRENT_TIMESTAMP,
  facility_name text null,
  provider_name text null,
  reason text null,
  diagnosis_summary text null,
  notes text null,
  created_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone not null default CURRENT_TIMESTAMP,
  constraint cura_encounters_pkey primary key (id),
  constraint cura_encounters_profile_id_fkey foreign key (profile_id) references cura_profiles (id) on delete cascade,
  constraint cura_encounters_type_check check (
    (encounter_type)::text = any (
      (
        array[
          'CLINIC'::character varying,
          'ER'::character varying,
          'HOSPITAL'::character varying,
          'TELEHEALTH'::character varying
        ]
      )::text[]
    )
  )
) TABLESPACE pg_default;

create index cura_encounters_profile_id_idx
  on public.cura_encounters using btree (profile_id) TABLESPACE pg_default;

create index cura_encounters_encounter_date_idx
  on public.cura_encounters using btree (encounter_date) TABLESPACE pg_default;
