-- Include CHECKED_IN in the "active slot" uniqueness constraint.
-- Without this, a checked-in appointment could allow a new booking in the same slot.

drop index if exists public.cura_appointments_active_slot_unique_idx;

create unique index if not exists cura_appointments_active_slot_unique_idx
    on public.cura_appointments (facility_id, appointment_date, start_time)
    where status in ('PENDING', 'CONFIRMED', 'CHECKED_IN');

