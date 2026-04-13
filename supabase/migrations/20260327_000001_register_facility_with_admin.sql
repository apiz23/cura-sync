-- Atomic facility + admin creation (used by /api/facility/register)
-- Apply this in your Supabase project (SQL editor or migrations tooling).

create or replace function public.cura_register_facility_with_admin(
    p_facility_name text,
    p_facility_type text,
    p_facility_specialty text,
    p_facility_phone text,
    p_facility_address text,
    p_facility_latitude text,
    p_facility_longitude text,
    p_admin_name text,
    p_admin_email text,
    p_admin_password_hash text
)
returns table (facility_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_facility_id uuid;
begin
    if p_facility_name is null or length(trim(p_facility_name)) = 0 then
        raise exception 'facility_name is required';
    end if;

    if p_facility_address is null or length(trim(p_facility_address)) = 0 then
        raise exception 'facility_address is required';
    end if;

    if p_admin_name is null or length(trim(p_admin_name)) = 0 then
        raise exception 'admin_name is required';
    end if;

    if p_admin_email is null or length(trim(p_admin_email)) = 0 then
        raise exception 'admin_email is required';
    end if;

    if p_admin_password_hash is null or length(trim(p_admin_password_hash)) = 0 then
        raise exception 'admin_password_hash is required';
    end if;

    -- Prevent duplicate staff emails
    if exists (
        select 1
        from public.cura_staff_profiles
        where lower(email) = lower(p_admin_email)
    ) then
        raise exception 'admin_email already exists';
    end if;

    insert into public.cura_facilities (
        name,
        type,
        specialty,
        phone,
        address,
        latitude,
        longitude,
        is_active
    )
    values (
        trim(p_facility_name),
        nullif(trim(p_facility_type), ''),
        nullif(trim(p_facility_specialty), ''),
        nullif(trim(p_facility_phone), ''),
        trim(p_facility_address),
        nullif(trim(p_facility_latitude), ''),
        nullif(trim(p_facility_longitude), ''),
        false
    )
    returning id into v_facility_id;

    insert into public.cura_staff_profiles (
        full_name,
        email,
        password,
        role,
        specialization,
        facility_id
    )
    values (
        trim(p_admin_name),
        lower(trim(p_admin_email)),
        p_admin_password_hash,
        'admin',
        'Facility Manager',
        v_facility_id
    );

    facility_id := v_facility_id;
    return next;
end;
$$;

