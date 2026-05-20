-- Health alert notifications generated when a health sync detects abnormal vitals.

create table public.cura_notifications (
  id uuid not null default extensions.uuid_generate_v4(),
  profile_id text not null,
  type text not null,
  title text not null,
  body text not null,
  severity varchar(10) not null default 'WARNING',
  read boolean not null default false,
  metadata jsonb null,
  created_at timestamp without time zone not null default current_timestamp,
  constraint cura_notifications_pkey primary key (id),
  constraint cura_notifications_profile_fkey
    foreign key (profile_id) references cura_profiles (id) on delete cascade,
  constraint cura_notifications_severity_check
    check (severity in ('INFO', 'WARNING', 'CRITICAL'))
) tablespace pg_default;

create index cura_notifications_profile_read_idx
  on public.cura_notifications using btree (profile_id, read, created_at desc) tablespace pg_default;
