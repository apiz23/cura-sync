-- Add patient-controlled blockchain protection toggle
alter table public.cura_profiles
  add column if not exists blockchain_protection_enabled boolean not null default false;

comment on column public.cura_profiles.blockchain_protection_enabled is
  'Patient opt-in: when true and facility plan allows, health records are anchored on Polygon Amoy';
