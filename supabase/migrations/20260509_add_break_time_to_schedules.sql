alter table public.cura_facility_schedules
    add column if not exists break_start time,
    add column if not exists break_end time;
