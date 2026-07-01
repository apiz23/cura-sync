# User Pages Redesign — Design Spec

**Date:** 2026-06-28
**Scope:** All 14 user-facing pages under `app/user/` plus shared shell components
**Approach:** Institutional Data Layer — clinical authority through typography, metric-led layouts, editorial row styling, and purposeful motion

---

## Design Context

From `.impeccable.md`: precise, institutional, trusted. CuraSync must feel like proper medical software — reliable and clear without coldness. Green/blue primary used sparingly as a trust signal. Typography leads hierarchy. Geist sans, Noto Serif Georgian serif, Geist Mono. Light interface with dark mode respected.

---

## 1. Shared Foundation

### UserPageShell (`components/user-page-shell.tsx`)

**Current:** `bg-linear-to-b from-background via-background to-primary/5` gradient wrapper.

**New:**
- Background: `bg-background` (clean, no gradient)
- Subtle 22px dotted grid texture via `radial-gradient` at 8% foreground opacity
- Radial fade mask at edges (same pattern as admin page) so texture doesn't compete with content
- Content wrapper: `max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8 flex flex-col gap-6`
- Gap reduced from `gap-8` to `gap-6` for tighter clinical feel

### UserPageHeader (`components/user-page-shell.tsx`)

**Current:** Rounded card (`rounded-2xl border bg-card/85 backdrop-blur`) with icon in `bg-primary/12 rounded-2xl` box, `text-4xl` title.

**New:**
- Remove card wrapper — header sits directly on page background, no border/bg
- Replace icon-in-box with a mono uppercase section label (e.g., `HEALTH TRACKING`, `YOUR APPOINTMENTS`) above the title
- Title: `text-2xl font-bold tracking-tight` — authority through precision, not size
- Description: `text-sm text-muted-foreground max-w-2xl`
- Avatar (dashboard only): kept, smaller `h-10 w-10 rounded-xl`
- Actions: right-aligned row, unchanged
- Meta badges: replaced with mono label + value pairs (e.g., `3 upcoming · 2 active`)
- Framer Motion entrance:
  - Label: `opacity 0→1`, delay 0ms, 300ms
  - Title: `y 8→0, opacity 0→1`, delay 120ms, 450ms ease-out-quint
  - Description: `opacity 0→1`, delay 250ms, 350ms
  - Actions/meta: `opacity 0→1`, delay 380ms, 300ms

### UserSidebar (`components/user-sidebar.tsx`)

**Current active state:** `bg-primary/90 text-primary-foreground` (heavy blue fill).

**New active state:** `bg-muted/60 text-foreground font-semibold` — visible but not dominant. The sidebar accent color serves as a trust signal, not wallpaper.

Hover state: CSS `hover:bg-muted/40` only — no motion overhead.

### UserHeader (top bar)

No structural changes. Add `backdrop-blur-sm` if not present. Ensure border-b is `border-border/50` (subtle).

---

## 2. Dashboard (`app/user/dashboard/page.tsx`)

Most complex page. Four zones:

### Zone 1 — Welcome Header
- Uses new `UserPageHeader` with avatar
- Motion entrance as above

### Zone 2 — Metric Strip
**Current:** 4 `SummaryCard` components with `CardHeader`, icon in rounded box, value, description.

**New:** 4 flat metric cells in `grid-cols-2 lg:grid-cols-4`. Each cell:
- No Card wrapper — just a `div` with `border-r border-border/40` divider (last child: no border)
- Mono label above: `font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground`
- Large value: `text-3xl font-bold tracking-tight text-foreground tabular-nums` — animated counter roll-up on mount
- Description below: `text-xs text-muted-foreground mt-1`
- Wrap all 4 in a single `border border-border/60 rounded-xl bg-card/60 grid` container
- Motion: each cell stagger `delay: 0.08 + index * 0.06`

### Zone 3 — Activity + Quick Actions (`grid gap-6 lg:grid-cols-[1.5fr_1fr]`)

**Recent Activity (left):**
- Section header: mono label `RECENT ACTIVITY` + `<hr>` rule
- List rows (not cards): each item is a `div` with `border-b border-border/40 py-3 flex items-center gap-4`
- Leading element: date in mono fixed-width left column
- Middle: title bold, detail muted small
- Trailing: status dot (colored `w-2 h-2 rounded-full`) + text
- No per-item card wrappers, no rounded boxes
- Stagger animation: items 0–7 stagger, beyond that instant
- Empty state: centered paragraph, plain `<p>`, single CTA link (no dashed border box)

**Quick Actions (right):**
- Section header: mono label `QUICK ACTIONS` + `<hr>` rule
- `grid-cols-2 gap-3` of compact action cells
- Each: `border border-border/60 rounded-xl p-4 hover:bg-muted/40 transition-colors`
- Icon (no rounded box) + label below, arrow at top-right corner
- `whileTap={{ scale: 0.97 }}`

### Zone 4 — Wearable + Care Summary (single tabbed card)
- `Card` with `Tabs` inside (two tabs: "Wearable" and "Care Summary")
- `AnimatePresence mode="wait"` for tab content switch
- Content: clean `SummaryRow` rows — `justify-between` with mono label left, value right
- Upload history: compact rows, `font-mono text-xs` for timestamps

---

## 3. Health Tracking (`app/user/health/page.tsx`)

- Alert banners: remove `border border-X/40 bg-X/10` approach. Replace with inline `flex gap-2` rows with colored dot prefix + dismiss button. No background fill, no border — just text with severity color.
- Loading skeleton: unchanged (3-col then 2-col grid)
- `PatientHealthView` component: section headers use mono label + rule pattern
- Metric cards in health view: same flat metric strip as dashboard if possible, otherwise keep card but remove icon-in-box (icon inline before label text)

---

## 4. Appointments (`app/user/appointments/page.tsx`)

- Search + filter bar: `flex gap-3 items-center` row at top — input with icon prefix, select filters inline, download button right-aligned
- Tabs (Upcoming / All / History): `TabsList` styled as underline tabs, not pill/rounded tabs. Implementation: `TabsList` with `bg-transparent border-b border-border rounded-none h-auto p-0 gap-0`, each `TabsTrigger` with `rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground font-medium`
- Appointment rows: table-style, not cards
  - Date column (mono, fixed `w-28` left): `dd MMM`
  - Facility avatar + name + specialty
  - Status: `●` dot (colored by status) + text
  - Time: mono right-aligned
  - Action button: `ghost` variant, small
- Facility cards (booking view): keep card layout but remove icon boxes above headings. Location and specialty as plain text below name.
- Stagger animation on appointment list rows

---

## 5. Medications (`app/user/medications/page.tsx`)

- Two sections: Active and Completed, each with mono label header + rule
- Medication rows: inline list, not cards
  - Name bold left, dosage + frequency mono right
  - Status dot: green (active) / muted (completed)
  - Action (edit/delete) on hover reveal
- Add medication: inline form that expands below the list via `grid-template-rows: 0fr → 1fr` CSS transition (not animating `height` directly — avoids layout jank). `AnimatePresence` toggles the container.
- No modal

---

## 6. Profile (`app/user/profile/page.tsx`)

- Form sections grouped with mono label headers + `<hr>` rules
- No card wrappers around form sections — fields sit on clean background
- Field labels: `font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground`
- Input height: `h-10` (compact)
- Save button: rendered at the bottom of each form section (not `position: fixed`, just last item in the section block)
- Profile completion shown as a plain fraction ("3 of 5 fields complete") not a progress bar

---

## 7. Symptom Analyzer (`app/user/symptom-analyzer/page.tsx`)

- Chat layout: conversation history top (scrollable), sticky input bottom
- User messages: right-aligned, `bg-primary/10 rounded-xl px-4 py-3 max-w-[75%]`
- AI messages: left-aligned, `bg-muted/60 rounded-xl px-4 py-3 max-w-[85%]`
- Input: `h-12 rounded-xl` + send button right. Textarea that expands to max 3 lines.
- Loading: AI "thinking" state shows 3-dot pulse animation (CSS `animate-pulse` on staggered dots)
- History sidebar or toggle to view past sessions (if implemented)
- `AnimatePresence` for new messages sliding in from bottom

---

## 8. Notifications (`app/user/notifications/page.tsx`)

- Notification rows: full-width, `border-b border-border/40`
- Unread: `bg-primary/[0.03]` subtle tint, bold title
- Read: plain background, regular weight
- Timestamp: mono, right-aligned
- Mark-all-read: button top-right of section
- Dismiss on row: `×` button appears on hover
- Stagger list animation

---

## 9. Settings + Security (`app/user/settings/page.tsx`, `/security/page.tsx`)

- Section groups: mono label + `<hr>` rule separators
- Settings rows: `flex justify-between items-center py-4 border-b border-border/40`
- Toggle switches: standard Switch component
- Danger zone section: `border border-destructive/30 rounded-xl p-6` (full border, not left-stripe)
- No card wrappers

---

## 10. Records (`app/user/records/page.tsx`)

- Document list: table-style rows
  - Document name bold left
  - Type label mono
  - Date mono right
  - Download action on hover
- No card-per-document

---

## 11. Blockchain (`app/user/blockchain/page.tsx`)

- Hash values: `font-mono text-xs truncate` with copy button
- Table rows: tight, clean, alternating `bg-muted/20` on even rows
- Section header: mono label

---

## 12. Caregiver (`app/user/caregiver/page.tsx`)

- Caregiver list: avatar + name + relationship + status dot
- Add caregiver: inline expandable form (same pattern as medications)
- Caregiver detail page: same row-layout for patient data

---

## 13. Telehealth (`app/user/telehealth/page.tsx`)

- If stub/placeholder: clean empty state with mono label "TELEHEALTH" and description
- If functional: appointment-style layout for video session entries

---

## 14. SSO Callback (`app/user/sso-callback/`)

- No redesign needed — loading screen only

---

## Motion System

```
Easing: ease-out-quint [0.22, 1, 0.36, 1]

Page entrance:      opacity 0→1, y 12→0, 400ms, delay 0
Section header:     opacity 0→1, delay 0, 300ms
Title:              opacity 0→1, y 8→0, delay 120ms, 450ms
Description:        opacity 0→1, delay 250ms, 350ms
List items:         opacity 0→1, y 8→0, delay (0.1 + i*0.04)s, 350ms — max 8 items
Metric counter:     0 → value, 600ms, rAF loop, ease-out-quart
Tab switch:         exit: x 0→-10, opacity→0, 180ms | enter: x 10→0, opacity 0→1, 280ms
Button tap:         scale 0.97, spring stiffness 500 damping 30
Error/notice:       height 0→auto, opacity 0→1, 220ms

Reduced motion:     All transform animations disabled. Opacity-only fades at 150ms max.
                    useReducedMotion() from framer-motion applied globally.
```

---

## File Change Summary

| File | Change type |
|------|-------------|
| `components/user-page-shell.tsx` | Full rewrite (both components) |
| `components/user-sidebar.tsx` | Active state + motion |
| `app/user/dashboard/page.tsx` | Full rewrite |
| `app/user/health/page.tsx` | Alert styling + motion |
| `app/user/appointments/page.tsx` | Row layout + tab style + motion |
| `app/user/medications/page.tsx` | Row layout + inline add form |
| `app/user/profile/page.tsx` | Form section headers + field style |
| `app/user/symptom-analyzer/page.tsx` | Chat layout |
| `app/user/notifications/page.tsx` | Row layout + stagger |
| `app/user/settings/page.tsx` | Section pattern |
| `app/user/security/page.tsx` | Section pattern |
| `app/user/records/page.tsx` | Table row layout |
| `app/user/blockchain/page.tsx` | Mono hash table |
| `app/user/caregiver/page.tsx` | Row list + inline form |
| `app/user/telehealth/page.tsx` | Pattern or empty state |

---

## Anti-pattern Checklist

- No left/right border stripes on cards or list items
- No gradient text
- No glassmorphism (backdrop-blur used only on header bar, not content cards)
- No icon-in-rounded-box above headings
- No bounce/elastic easing
- No layout property animations
- No sparklines as decoration
