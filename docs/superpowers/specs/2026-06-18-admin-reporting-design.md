# Admin Reporting — Design Spec

**Date:** 2026-06-18
**Scope:** cura-sync-web — admin panel only
**Features:** Reports page (B) + CSV export on Appointments (C)

---

## 1. Reports Page (`/admin/reports`)

### Route & Access
- File: `app/admin/reports/page.tsx`
- Admin-only: guarded by role check (same pattern as existing admin-only pages). Staff and doctor roles do not see this route.
- Sidebar entry added to "System & Security" group in `lib/admin-menu.ts`, icon `BarChart3`, `roles: ["admin"]`.

### Date Range Controls
- Two `<Input type="date">` fields: **From** and **To**.
- Default on mount: From = first day of 6 months ago, To = today.
- "Apply" button triggers data fetch. No auto-fetch on every keystroke.
- Validation: From must be ≤ To. Show inline error if violated; block fetch.

### Charts
Install shadcn chart component (`npx shadcn@latest add chart`) which wraps Recharts.

| Chart | Type | Data |
|---|---|---|
| Appointments per month | Bar chart | `appointmentsByMonth[]` from API |
| Status breakdown | Donut chart | Aggregated status counts from API |

- Bar chart X-axis: month labels (e.g. "Jan 2026"). Y-axis: count.
- Donut chart segments: PENDING (amber), CONFIRMED (emerald), CHECKED_IN (sky), COMPLETED (violet), CANCELLED (destructive).
- Both charts show a loading skeleton while fetching.

### Stat Cards
Three cards in a row (reuse `MetricCard` pattern from dashboard):
- **Total Appointments** — sum of all appointments in range
- **Unique Patients** — distinct patient count in range
- **Completion Rate** — `COMPLETED / (COMPLETED + CANCELLED)` as a percentage (shown as "—" if denominator is 0)

### API Extension — `/api/admin/analytics`
Accept optional query params `?from=YYYY-MM-DD&to=YYYY-MM-DD`.

- If both present: filter `cura_appointments` with `appointment_date >= from AND appointment_date <= to`. Group by month within that range.
- If absent: existing 6-month logic unchanged (backwards compatible).
- Add `totalAppointmentsInRange` and `uniquePatientsInRange` to response body alongside existing fields.
- Unique patients count: distinct `profile_id` values within the date range.

### Error Handling
- API error → show error card with Retry button (same pattern as dashboard).
- Empty range (no data) → show empty state inside each chart area, not a full-page error.

---

## 2. CSV Export on `/admin/appointments`

### Trigger
- "Export CSV" button added next to "Refresh" button in the appointments page header.
- Visible to `admin` and `staff` roles only (doctor role does not see it).

### Behaviour
- Pure client-side: reads `filteredAppointments` state (already computed, respects active search/status/date filters).
- No API call required.
- Triggers browser file download immediately on click.

### Output
- Filename: `appointments-YYYY-MM-DD.csv` where the date is today.
- Encoding: UTF-8 with BOM (ensures Excel opens correctly on Windows).
- Columns in order:

| Column | Source field |
|---|---|
| No | Row index (1-based) |
| Patient Name | `patient_name` |
| Date | `appointment_date` (YYYY-MM-DD) |
| Time | `start_time` (HH:MM) |
| Reason | `reason_for_visit` or empty string |
| Status | `status` |

- Values containing commas or quotes are wrapped in double-quotes and internal quotes are escaped (`""`).

### Role Guard
Check `user.role` before rendering the button. `doctor` role: button not rendered.

---

## 3. Component & File Summary

| File | Change |
|---|---|
| `lib/admin-menu.ts` | Add Reports entry under System & Security, `roles: ["admin"]` |
| `app/admin/reports/page.tsx` | New page — date range picker, stat cards, two charts |
| `app/api/admin/analytics/route.ts` | Accept `from`/`to` query params, extend response |
| `app/admin/appointments/page.tsx` | Add Export CSV button (client-side only) |

No new shared components needed. Charts are self-contained in the reports page file.

---

## 4. Dependencies

- `shadcn chart` component: `npx shadcn@latest add chart` (installs Recharts as peer dep)
- No other new packages.
