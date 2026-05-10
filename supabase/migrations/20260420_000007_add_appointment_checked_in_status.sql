-- Adds a check-in step to the appointment lifecycle.
-- This migration is written to be safe even if the existing CHECK constraint name differs.

do $$
declare
    conname text;
begin
    select c.conname into conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'cura_appointments'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%status%'
      and pg_get_constraintdef(c.oid) ilike '%PENDING%'
    limit 1;

    if conname is not null then
        execute format('alter table public.cura_appointments drop constraint %I', conname);
    end if;
end $$;

alter table public.cura_appointments
    add constraint cura_appointments_status_check
    check (status::text = any (array[
        'PENDING'::text,
        'CONFIRMED'::text,
        'CHECKED_IN'::text,
        'CANCELLED'::text,
        'COMPLETED'::text
    ])) not valid;

alter table public.cura_appointments
    validate constraint cura_appointments_status_check;

