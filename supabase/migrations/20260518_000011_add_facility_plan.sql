-- cura-sync-web/supabase/migrations/20260518_000011_add_facility_plan.sql
alter table public.cura_facilities
  add column if not exists plan text not null default 'clinic'
  constraint cura_facilities_plan_check check (plan in ('basic', 'clinic', 'enterprise'));

comment on column public.cura_facilities.plan is
  'SaaS subscription tier: basic | clinic | enterprise';
