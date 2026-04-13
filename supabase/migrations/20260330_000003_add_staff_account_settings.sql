create table if not exists public.cura_staff_account_settings (
  staff_id uuid primary key,
  email_notifications boolean not null default true,
  sms_notifications boolean not null default false,
  schedule_notifications boolean not null default true,
  security_alerts boolean not null default true,
  marketing_emails boolean not null default false,
  session_version integer not null default 1,
  last_login_at timestamp without time zone null,
  last_seen_at timestamp without time zone null,
  password_changed_at timestamp without time zone null,
  created_at timestamp without time zone not null default current_timestamp,
  updated_at timestamp without time zone not null default current_timestamp,
  constraint cura_staff_account_settings_staff_id_fkey
    foreign key (staff_id)
    references public.cura_staff_profiles (id)
    on delete cascade
);
