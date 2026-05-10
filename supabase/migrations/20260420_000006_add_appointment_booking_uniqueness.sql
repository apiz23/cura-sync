-- Prevent double-booking the same slot at the DB level.
-- Applies to active bookings only (PENDING / CONFIRMED).
-- Note: this assumes `cura_appointments` exists in the Supabase project already.

create unique index if not exists cura_appointments_active_slot_unique_idx
    on public.cura_appointments (facility_id, appointment_date, start_time)
    where status in ('PENDING', 'CONFIRMED');

