-- cura-sync-web/supabase/migrations/20260518_000012_add_push_tokens.sql
alter table public.cura_profiles
  add column if not exists expo_push_token text null;

comment on column public.cura_profiles.expo_push_token is
  'Expo push notification token for mobile app; null if not registered';
