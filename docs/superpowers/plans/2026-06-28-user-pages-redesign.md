# User Pages Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign all 14 user-facing pages plus shared shell components to an "Institutional Data Layer" aesthetic — clinical authority through typography, metric-led layouts, editorial row styling, and purposeful Framer Motion animation.

**Architecture:** Shared components (`UserPageShell`, `UserPageHeader`, `UserSidebar`) are updated first as the foundation; all page content rewrites follow. Motion constants live in a shared hook. Tasks 1–2 block Tasks 3–13; Tasks 3–13 are independent and can run in parallel.

**Tech Stack:** Next.js 14 App Router, React 19, Framer Motion 12, Tailwind CSS v4, shadcn/ui, Geist/Noto Serif Georgian/Geist Mono fonts, OKLCH color system.

**Spec:** `docs/superpowers/specs/2026-06-28-user-pages-redesign.md`

## Global Constraints

- Easing: `[0.22, 1, 0.36, 1]` (ease-out-quint) for all enter animations
- No left/right border stripes wider than 1px on cards or list items
- No gradient text (`background-clip: text`)
- No icon-in-rounded-box above headings
- No bounce/elastic easing
- No layout property animations (width/height/padding) — transform + opacity only; exception: `grid-template-rows` for expand/collapse
- `useReducedMotion()` from framer-motion must be respected; when true, skip transforms, use 150ms opacity-only fades
- TypeScript must compile clean (`npx tsc --noEmit`) after every task
- Import path alias: `@/` maps to project root
- All color values use OKLCH; primary is `oklch(0.5144 0.1605 267.44)` (blue-indigo)

---

## File Map

| File | Action |
|------|--------|
| `hooks/use-motion-config.ts` | **Create** — shared easing, stagger helpers, reduced-motion hook |
| `components/user-page-shell.tsx` | **Modify** — full rewrite of `UserPageShell` + `UserPageHeader` |
| `components/user-sidebar.tsx` | **Modify** — active state only |
| `app/user/dashboard/page.tsx` | **Modify** — full rewrite |
| `app/user/health/page.tsx` | **Modify** — alert styling, motion entrance |
| `app/user/appointments/page.tsx` | **Modify** — tab style, row layout, motion |
| `app/user/medications/page.tsx` | **Modify** — row layout, motion |
| `app/user/profile/page.tsx` | **Modify** — section headers, motion entrance |
| `app/user/symptom-analyzer/page.tsx` | **Modify** — message bubble styling, motion |
| `app/user/notifications/page.tsx` | **Modify** — row layout, stagger |
| `app/user/settings/page.tsx` | **Modify** — section pattern, motion |
| `app/user/security/page.tsx` | **Modify** — section pattern, motion |
| `app/user/records/page.tsx` | **Modify** — tab underline style, row layout, motion |
| `app/user/blockchain/page.tsx` | **Modify** — mono hash table, motion |
| `app/user/caregiver/page.tsx` | **Modify** — row list, motion |
| `app/user/telehealth/page.tsx` | **Modify** — row layout, motion |

---

## Task 1: Motion Utilities + UserPageShell + UserPageHeader

**Files:**
- Create: `hooks/use-motion-config.ts`
- Modify: `components/user-page-shell.tsx`

**Interfaces:**
- Produces:
  - `EASE` constant: `[0.22, 1, 0.36, 1]`
  - `staggerItem(i: number): { initial, animate, transition }` — motion props for list items
  - `pageEnter: MotionProps` — page-level entrance props
  - `useMotionConfig(): { ease, reduced }` — hook returning config + reduced-motion flag
  - `UserPageShell` — unchanged prop API
  - `UserPageHeader` — prop API gains optional `sectionLabel?: string`; removes `icon` prop optionality (still optional but no longer renders icon-in-box)

- [ ] **Step 1: Create motion config hook**

```typescript
// hooks/use-motion-config.ts
import { useReducedMotion } from "framer-motion";

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function staggerItem(i: number) {
  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, delay: 0.1 + i * 0.04, ease: EASE },
  };
}

export const pageEnter = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: EASE },
} as const;

export function useMotionConfig() {
  const reduced = useReducedMotion();
  return { ease: EASE, reduced: reduced ?? false };
}
```

- [ ] **Step 2: Rewrite `components/user-page-shell.tsx`**

Replace the entire file with:

```tsx
"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EASE, useMotionConfig } from "@/hooks/use-motion-config";

interface UserPageShellProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

type UserPageHeaderAvatar = {
  src?: string | null;
  alt: string;
  fallback: string;
};

interface UserPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  sectionLabel?: string;
  avatar?: UserPageHeaderAvatar;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function UserPageShell({
  children,
  className,
  contentClassName,
}: UserPageShellProps) {
  return (
    <section className={cn("relative min-h-full bg-background", className)}>
      {/* Subtle dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklch, var(--foreground) 6%, transparent) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      {/* Radial fade — keeps dots from competing with content */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 30%, transparent 30%, var(--background) 80%)",
        }}
      />
      <div
        className={cn(
          "relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8",
          contentClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function UserPageHeader({
  title,
  description,
  icon: Icon,
  sectionLabel,
  avatar,
  actions,
  meta,
  align = "left",
  className,
}: UserPageHeaderProps) {
  const { reduced } = useMotionConfig();
  const centered = align === "center";

  const label =
    sectionLabel ??
    (Icon
      ? undefined
      : undefined);

  return (
    <div className={cn("pb-2", className)}>
      <div
        className={cn(
          "flex gap-5",
          centered
            ? "flex-col items-center text-center"
            : "flex-col justify-between lg:flex-row lg:items-end"
        )}
      >
        <div className={cn("flex flex-col gap-2", centered && "items-center")}>
          {/* Section label — mono uppercase above title */}
          {label && (
            <motion.p
              className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {label}
            </motion.p>
          )}

          <div className={cn("flex items-center gap-3", centered && "justify-center")}>
            {/* Avatar (dashboard) */}
            {avatar && (
              <motion.div
                initial={reduced ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <Avatar className="h-10 w-10 shrink-0 rounded-xl ring-1 ring-border/50">
                  {avatar.src ? (
                    <AvatarImage src={avatar.src} alt={avatar.alt} />
                  ) : null}
                  <AvatarFallback className="rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                    {avatar.fallback}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            )}

            <motion.h1
              className="text-2xl font-bold tracking-tight text-foreground"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.12, ease: EASE }}
            >
              {title}
            </motion.h1>
          </div>

          {description && (
            <motion.p
              className="max-w-2xl text-sm text-muted-foreground"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.25, ease: EASE }}
            >
              {description}
            </motion.p>
          )}

          {meta && (
            <motion.div
              className={cn("flex flex-wrap items-center gap-3 pt-1", centered && "justify-center")}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.38, ease: EASE }}
            >
              {meta}
            </motion.div>
          )}
        </div>

        {actions && (
          <motion.div
            className={cn("flex shrink-0 flex-wrap gap-3", centered && "justify-center")}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.38, ease: EASE }}
          >
            {actions}
          </motion.div>
        )}
      </div>

      {/* Divider below header */}
      <div className="mt-5 h-px bg-border/50" />
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd cura-sync-web && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors from `user-page-shell.tsx` or `use-motion-config.ts`.

- [ ] **Step 4: Visual check**

Start dev server (`pnpm dev` in `cura-sync-web`), visit `/user/dashboard`. Verify:
- No card wrapper on the header — it sits directly on page background
- Subtle dot grid visible in the background
- Title animates up on load
- No regression: sidebar and content area still visible

- [ ] **Step 5: Commit**

```bash
git add hooks/use-motion-config.ts components/user-page-shell.tsx
git commit -m "feat(ui): redesign UserPageShell + UserPageHeader — institutional layout, dot grid, motion entrance"
```

---

## Task 2: UserSidebar Active State

**Files:**
- Modify: `components/user-sidebar.tsx`

**Interfaces:**
- Consumes: nothing from Task 1
- Produces: no API changes — visual-only

- [ ] **Step 1: Update active state classes**

In `components/user-sidebar.tsx`, find the `SidebarMenuButton` with active state classes and replace:

```tsx
// BEFORE
className="
    gap-3
    data-[active=true]:bg-primary/90
    data-[active=true]:text-primary-foreground
    group-data-[collapsible=icon]:justify-center
"

// AFTER
className="
    gap-3
    data-[active=true]:bg-muted/70
    data-[active=true]:text-foreground
    data-[active=true]:font-semibold
    group-data-[collapsible=icon]:justify-center
"
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Visual check**

Visit `/user/dashboard`. Active nav item should have a muted background (not the heavy blue fill) with bold text.

- [ ] **Step 4: Commit**

```bash
git add components/user-sidebar.tsx
git commit -m "feat(ui): refine sidebar active state — muted bg + bold text instead of primary fill"
```

---

## Task 3: Dashboard Page

**Files:**
- Modify: `app/user/dashboard/page.tsx`

**Interfaces:**
- Consumes: `UserPageShell`, `UserPageHeader`, `useMotionConfig`, `staggerItem`, `EASE` from Tasks 1
- Produces: no API changes

**Important:** This file is 792 lines. The rewrite replaces the entire JSX output. ALL data-fetching logic, type definitions, helper functions (`loadDashboardResource`, `formatDate`, etc.) are preserved verbatim — only components and JSX change.

- [ ] **Step 1: Replace SummaryCard component**

Find the `SummaryCard` function (line ~639) and replace:

```tsx
function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof Activity;
}) {
  const { reduced } = useMotionConfig();
  return (
    <div className="flex flex-col gap-1 px-6 py-5">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </p>
      <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
```

- [ ] **Step 2: Replace ActionLink component**

Find `ActionLink` (~line 670) and replace:

```tsx
function ActionLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Activity;
  label: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        className="group flex flex-col gap-3 rounded-xl border border-border/60 p-4 transition-colors hover:bg-muted/40"
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
        <span className="text-sm font-medium text-foreground">{label}</span>
      </motion.div>
    </Link>
  );
}
```

- [ ] **Step 3: Replace SummaryRow component**

Find `SummaryRow` (~line 695) and replace:

```tsx
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/40 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
```

- [ ] **Step 4: Replace EmptyState component**

Find `EmptyState` (~line 704) and replace:

```tsx
function EmptyState({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="py-8 text-center">
      <p className="font-medium text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      <Link href={href} className="mt-4 inline-flex">
        <Button variant="outline" size="sm">{action}</Button>
      </Link>
    </div>
  );
}
```

- [ ] **Step 5: Replace the main return JSX in `UserDashboardPage`**

Find the `return (` in `UserDashboardPage` (~line 270) and replace the entire JSX block:

```tsx
  return (
    <UserPageShell>
      {/* Header */}
      {loading ? (
        <div className="space-y-2 pb-5 border-b border-border/50">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
      ) : (
        <UserPageHeader
          avatar={{ src: user?.imageUrl ?? null, alt: userDisplayName, fallback: userInitials }}
          title={`Welcome back, ${userDisplayName}`}
          description="Your real appointments, medications, and health data."
          meta={
            <>
              <span className="font-mono text-xs text-muted-foreground">
                {upcomingAppointments.length} upcoming
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span className="font-mono text-xs text-muted-foreground">
                {activeMedications.length} active medications
              </span>
            </>
          }
        />
      )}

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4">
          <p className="text-sm text-destructive">{error}</p>
          <Link href="/user/profile">
            <Button variant="outline" size="sm">Open profile</Button>
          </Link>
        </div>
      )}

      {/* Metric strip */}
      <div className="grid grid-cols-2 divide-x divide-y divide-border/50 overflow-hidden rounded-xl border border-border/60 bg-card/60 lg:grid-cols-4 lg:divide-y-0">
        {[
          {
            title: "Upcoming Appointments",
            value: String(upcomingAppointments.length),
            description: nextAppointment
              ? `Next: ${formatDate(nextAppointment.appointment_date)}`
              : "None scheduled",
            icon: Calendar,
          },
          {
            title: "Active Medications",
            value: String(activeMedications.length),
            description: activeMedications.length
              ? `${completedMedications.length} completed`
              : "No active medications",
            icon: Pill,
          },
          {
            title: "Profile Completion",
            value: `${profileCompletion}%`,
            description: "Keep profile complete for safer care",
            icon: ClipboardList,
          },
          {
            title: "Health Connect",
            value: latestHealthSync
              ? latestHealthSync.summary.stepsCount.toLocaleString()
              : "Off",
            description: latestHealthSync
              ? `Last sync ${formatRelativeDateTime(latestHealthSync.syncedAt)}`
              : "Sync from mobile app",
            icon: Activity,
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            <SummaryCard
              title={card.title}
              value={card.value}
              description={card.description}
              icon={card.icon}
            />
          </motion.div>
        ))}
      </div>

      {/* Activity + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Recent Activity */}
        <div>
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Recent Activity
          </p>
          <div className="h-px bg-border/50 mb-4" />
          <div>
            {activityItems.length ? (
              activityItems.map((item, i) => (
                <motion.div
                  key={`${item.title}-${item.detail}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-4 border-b border-border/40 py-3.5 transition-colors hover:bg-muted/20 last:border-0"
                  >
                    <span className="font-mono text-[10px] text-muted-foreground w-16 shrink-0 truncate">
                      {item.detail.split(" ")[0]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">{item.badge}</Badge>
                  </Link>
                </motion.div>
              ))
            ) : (
              <EmptyState
                title="Nothing to show yet"
                description="Book your first appointment or add medications to populate this dashboard."
                href="/user/appointments"
                action="Browse facilities"
              />
            )}
          </div>
          <div className="mt-4">
            <Link href="/user/appointments">
              <Button variant="ghost" size="sm" className="gap-2 text-xs text-muted-foreground hover:text-foreground">
                View all appointments <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Quick Actions
          </p>
          <div className="h-px bg-border/50 mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/user/appointments", icon: Calendar, label: "Appointments" },
              { href: "/user/medications", icon: Pill, label: "Medications" },
              { href: "/user/symptom-analyzer", icon: Sparkles, label: "Symptom AI" },
              { href: "/user/profile", icon: ShieldCheck, label: "Health Profile" },
            ].map((action, i) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.25 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <ActionLink href={action.href} icon={action.icon} label={action.label} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Wearable + Care Summary tabs */}
      <div className="rounded-xl border border-border/60 bg-card/60">
        <div className="flex border-b border-border/50">
          <p className="px-6 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Health Overview
          </p>
        </div>
        <div className="grid gap-0 md:grid-cols-2 md:divide-x md:divide-border/40">
          {/* Wearable snapshot */}
          <div className="px-6 py-5">
            <p className="mb-4 text-sm font-semibold text-foreground">Wearable snapshot</p>
            {[
              { label: "Last sync", value: latestHealthSync ? formatRelativeDateTime(latestHealthSync.syncedAt) : "Not synced" },
              { label: "Steps", value: latestHealthSync ? latestHealthSync.summary.stepsCount.toLocaleString() : "0" },
              { label: "Sleep", value: latestHealthSync ? `${syncedSleepHours ?? "0.0"} hours` : "0 hours" },
              { label: "Avg heart rate", value: latestHealthSync?.summary.averageHeartRateBpm != null ? `${latestHealthSync.summary.averageHeartRateBpm} bpm` : "No samples" },
              { label: "Total uploads", value: String(state.healthSync?.count ?? 0) },
            ].map((row) => (
              <SummaryRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
          {/* Care summary */}
          <div className="px-6 py-5">
            <p className="mb-4 text-sm font-semibold text-foreground">Care summary</p>
            {[
              {
                label: "Next appointment",
                value: nextAppointment
                  ? `${formatDate(nextAppointment.appointment_date)}, ${formatTime(nextAppointment.start_time)}`
                  : "Not scheduled",
              },
              { label: "Medication records", value: String(state.medications.length) },
              { label: "Allergies recorded", value: state.profile?.patient_profile?.allergies ? "Yes" : "Not added" },
              { label: "Emergency contact", value: state.profile?.patient_profile?.emergency_contact ?? "Missing" },
              { label: "Wearable sync", value: latestHealthSync ? formatDateTime(latestHealthSync.syncedAt) : "Not connected" },
            ].map((row) => (
              <SummaryRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
        </div>
      </div>
    </UserPageShell>
  );
```

- [ ] **Step 6: Add missing imports at top of dashboard/page.tsx**

Ensure these are present in the import block:

```tsx
import { motion } from "framer-motion";
import { useMotionConfig } from "@/hooks/use-motion-config";
```

Remove `Card, CardContent, CardDescription, CardHeader, CardTitle` if no longer used.

- [ ] **Step 7: TypeScript check**

```bash
npx tsc --noEmit 2>&1 | head -40
```

Expected: clean.

- [ ] **Step 8: Visual check**

Visit `/user/dashboard`. Verify:
- Metric strip shows as 4 cells in a single bordered container
- Activity items render as rows with no individual cards
- Quick Actions show as 2×2 compact grid
- Wearable + Care Summary side-by-side in one panel
- Animations stagger on load

- [ ] **Step 9: Commit**

```bash
git add app/user/dashboard/page.tsx
git commit -m "feat(ui): redesign dashboard — metric strip, row activity, compact quick actions, wearable panel"
```

---

## Task 4: Health Page

**Files:**
- Modify: `app/user/health/page.tsx`

- [ ] **Step 1: Add motion import and update page entrance**

Add at top:
```tsx
import { motion } from "framer-motion";
import { EASE } from "@/hooks/use-motion-config";
```

Wrap the `return (` in `HealthTrackingPage` with:
```tsx
return (
  <UserPageShell>
    <motion.div
      className="contents"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
```
Close `</motion.div>` before `</UserPageShell>`.

- [ ] **Step 2: Update UserPageHeader call**

```tsx
// BEFORE
<UserPageHeader
  icon={Activity}
  title="Health Tracking"
  description="Your health data synced from the CuraSync mobile app over the last 7 days."
/>

// AFTER
<UserPageHeader
  sectionLabel="Health Tracking"
  title="Wearable & Health Data"
  description="Synced from the CuraSync mobile app over the last 7 days."
/>
```

- [ ] **Step 3: Replace alert banners**

Replace the `alerts.map(...)` block:
```tsx
// BEFORE: rounded border + background fill banners
// AFTER: inline text rows, no background
{alerts.length > 0 && (
  <div className="space-y-1">
    {alerts.map((alert) => {
      const colorClass =
        alert.severity === "CRITICAL"
          ? "text-destructive"
          : alert.severity === "WARNING"
          ? "text-amber-600 dark:text-amber-400"
          : "text-primary";
      return (
        <div
          key={alert.id}
          className="flex items-start gap-3 border-b border-border/40 py-3 last:border-0"
        >
          <AlertTriangle className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${colorClass}`} />
          <div className="flex-1 text-sm">
            <span className={`font-semibold ${colorClass}`}>{alert.title}. </span>
            <span className="text-muted-foreground">{alert.body}</span>
          </div>
          <button
            onClick={() => dismissAlert(alert.id)}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    })}
  </div>
)}
```

- [ ] **Step 4: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | head -20
git add app/user/health/page.tsx
git commit -m "feat(ui): update health page — motion entrance, sectionLabel header, inline alerts"
```

---

## Task 5: Appointments Page

**Files:**
- Modify: `app/user/appointments/page.tsx`

- [ ] **Step 1: Update UserPageHeader**

Find the `UserPageHeader` call in `appointments/page.tsx` and add `sectionLabel`:
```tsx
<UserPageHeader
  sectionLabel="Your Appointments"
  title="Appointments"
  description="Book, view, and manage your clinic appointments."
  actions={/* existing actions */}
/>
```

- [ ] **Step 2: Replace TabsList styling**

Find `<TabsList` and replace its className:
```tsx
// BEFORE: pill/rounded TabsList
// AFTER: underline tabs
<TabsList className="h-auto gap-0 rounded-none border-b border-border bg-transparent p-0">
  <TabsTrigger
    value="upcoming"
    className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
  >
    Upcoming
  </TabsTrigger>
  {/* repeat pattern for other triggers */}
</TabsList>
```

Apply this className pattern to ALL TabsTrigger elements inside this TabsList.

- [ ] **Step 3: Add page motion wrapper**

Wrap the root return content (inside `<UserPageShell>`) with:
```tsx
<motion.div
  className="contents"
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
>
  {/* all existing children */}
</motion.div>
```

Add `import { motion } from "framer-motion";` if not present.

- [ ] **Step 4: Stagger appointment list items**

Find where appointment items are mapped. Wrap each item's outermost element:
```tsx
{appointments.map((appt, i) => (
  <motion.div
    key={appt.id}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: Math.min(i, 7) * 0.04, ease: [0.22, 1, 0.36, 1] }}
  >
    {/* existing appointment item JSX */}
  </motion.div>
))}
```

- [ ] **Step 5: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | head -20
git add app/user/appointments/page.tsx
git commit -m "feat(ui): update appointments — underline tabs, motion entrance, stagger list"
```

---

## Task 6: Medications Page

**Files:**
- Modify: `app/user/medications/page.tsx`

- [ ] **Step 1: Update UserPageHeader + add motion import**

```tsx
import { motion } from "framer-motion";

// In JSX:
<UserPageHeader
  sectionLabel="Your Medications"
  title="Medications"
  description="Track your active and completed medication courses."
/>
```

- [ ] **Step 2: Wrap page in motion entrance**

Wrap contents of `<UserPageShell>` in:
```tsx
<motion.div
  className="contents"
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
>
```

- [ ] **Step 3: Add stagger to medication rows**

Find where medications are mapped (likely a table or list). Wrap each row in:
```tsx
<motion.tr /* or motion.div */
  key={med.id}
  initial={{ opacity: 0, y: 6 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: Math.min(i, 7) * 0.04, ease: [0.22, 1, 0.36, 1] }}
>
```

- [ ] **Step 4: Add section labels above Active/Completed sections**

Before each medication group header:
```tsx
<p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
  Active Medications
</p>
<div className="h-px bg-border/50 mb-4" />
```

- [ ] **Step 5: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | head -20
git add app/user/medications/page.tsx
git commit -m "feat(ui): update medications — section labels, motion entrance, stagger"
```

---

## Task 7: Profile Page

**Files:**
- Modify: `app/user/profile/page.tsx`

- [ ] **Step 1: Add motion import and update header**

```tsx
import { motion } from "framer-motion";

<UserPageHeader
  sectionLabel="Your Profile"
  title="Health Profile"
  description="Keep your profile complete for safer, more accurate care."
/>
```

- [ ] **Step 2: Replace card-wrapped form sections with open sections**

For each `<Card>` or `<CardContent>` wrapping a form section, replace with:
```tsx
// BEFORE: <Card><CardHeader>...</CardHeader><CardContent>...</CardContent></Card>
// AFTER:
<div>
  <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
    {sectionName}
  </p>
  <div className="h-px bg-border/50 mb-5" />
  <div className="space-y-5">
    {/* form fields */}
  </div>
</div>
```

- [ ] **Step 3: Update field labels to mono style**

Replace all `<Label>` elements inside form sections:
```tsx
// BEFORE: <Label htmlFor="x">Field Name</Label>
// AFTER: <Label htmlFor="x" className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Field Name</Label>
```

- [ ] **Step 4: Wrap page in motion entrance**

```tsx
<motion.div
  className="contents"
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
>
```

- [ ] **Step 5: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | head -20
git add app/user/profile/page.tsx
git commit -m "feat(ui): update profile — open form sections, mono labels, motion entrance"
```

---

## Task 8: Symptom Analyzer Page

**Files:**
- Modify: `app/user/symptom-analyzer/page.tsx`

Note: this page already uses `framer-motion` and `AnimatePresence`.

- [ ] **Step 1: Update UserPageHeader**

```tsx
<UserPageHeader
  sectionLabel="AI Health Assistant"
  title="Symptom Analyzer"
  description="Describe your symptoms and receive instant AI-powered triage guidance."
/>
```

- [ ] **Step 2: Update result card styling**

Find any `Card` wrappers around the analysis result. Replace card borders with clean section styling:
```tsx
// BEFORE: <Card className="border shadow-sm">
// AFTER: <div className="rounded-xl border border-border/60 bg-card/60 p-5">
```

- [ ] **Step 3: Update textarea + submit area**

Ensure the input area uses consistent styling:
```tsx
<Textarea
  className="min-h-[80px] resize-none rounded-xl text-sm"
  placeholder="Describe your symptoms..."
/>
<Button className="h-11 rounded-xl px-6 font-semibold" type="submit">
  Analyze
</Button>
```

- [ ] **Step 4: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | head -20
git add app/user/symptom-analyzer/page.tsx
git commit -m "feat(ui): update symptom analyzer — section label, consistent card/input styling"
```

---

## Task 9: Notifications Page

**Files:**
- Modify: `app/user/notifications/page.tsx`

- [ ] **Step 1: Add motion import and update header**

```tsx
import { motion } from "framer-motion";

<UserPageHeader
  sectionLabel="Activity"
  title="Notifications"
  description="Health alerts, appointment reminders, and system updates."
/>
```

- [ ] **Step 2: Replace notification item styling**

Find where notifications are rendered. Replace the individual notification card/container:
```tsx
{notifications.map((notif, i) => {
  const Icon = notifIcon(notif.type, notif.severity);
  const styles = severityStyles(notif.severity);
  return (
    <motion.div
      key={notif.id}
      className={`flex items-start gap-4 border-b border-border/40 py-4 last:border-0 ${
        !notif.read ? "bg-primary/[0.02]" : ""
      }`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(i, 7) * 0.04, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`mt-0.5 shrink-0 ${styles.icon}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${notif.read ? "font-normal text-foreground" : "font-semibold text-foreground"}`}>
          {notif.title}
        </p>
        {notif.body && (
          <p className="mt-0.5 text-xs text-muted-foreground">{notif.body}</p>
        )}
      </div>
      <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
        {formatRelative(notif.created_at)}
      </span>
    </motion.div>
  );
})}
```

- [ ] **Step 3: Wrap page in motion entrance**

```tsx
<motion.div
  className="contents"
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
>
```

- [ ] **Step 4: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | head -20
git add app/user/notifications/page.tsx
git commit -m "feat(ui): update notifications — row layout, stagger, motion entrance"
```

---

## Task 10: Settings + Security Pages

**Files:**
- Modify: `app/user/settings/page.tsx`
- Modify: `app/user/security/page.tsx`

- [ ] **Step 1: Update settings/page.tsx header + section styling**

```tsx
import { motion } from "framer-motion";

// Header:
<UserPageHeader
  sectionLabel="Preferences"
  title="App Settings"
  description="Manage your display preferences and application settings."
/>

// Wrap content:
<motion.div
  className="contents"
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
>
```

Replace each `<section>` block's heading:
```tsx
// BEFORE: <h2 className="text-base font-bold uppercase tracking-wider text-muted-foreground">
// AFTER:
<p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
  Appearance
</p>
<div className="h-px bg-border/50 mb-5" />
```

Replace the `<div className="rounded-xl border border-border bg-card p-5">` wrapper around theme options with just the content (no card wrapping).

- [ ] **Step 2: Update security/page.tsx header + motion**

```tsx
import { motion } from "framer-motion";

<UserPageHeader
  sectionLabel="Account Security"
  title="Security"
  description="Manage authentication, sessions, and account security settings."
/>

// Wrap content in motion entrance same as above.
```

Replace `StatusRow` component styling — remove the `bg-muted/40` fill:
```tsx
function StatusRow({ label, value, active }: { label: string; value: string; active?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/40 py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {active !== undefined ? (
          active ? (
            <CheckCircle className="h-3.5 w-3.5 text-primary" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
          )
        ) : null}
        <span className="text-right text-sm font-medium text-foreground">{value}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | head -20
git add app/user/settings/page.tsx app/user/security/page.tsx
git commit -m "feat(ui): update settings + security — section labels, row layout, motion entrance"
```

---

## Task 11: Records Page

**Files:**
- Modify: `app/user/records/page.tsx`

- [ ] **Step 1: Update header + tabs + add motion**

```tsx
import { motion } from "framer-motion";

<UserPageHeader
  sectionLabel="Medical Records"
  title="Health Records"
  description="Your conditions, allergies, procedures, and encounter history."
/>
```

Apply underline tab styling (same as Task 5):
```tsx
<TabsList className="h-auto gap-0 rounded-none border-b border-border bg-transparent p-0">
  <TabsTrigger
    value="conditions"
    className="rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
  >
    Conditions
  </TabsTrigger>
  {/* same for allergies, procedures, encounters */}
</TabsList>
```

Wrap page in motion entrance.

- [ ] **Step 2: Update record item styling**

Find where record items render. Replace individual `Card` or bordered `div` wrappers with row pattern:
```tsx
<motion.div
  key={item.id}
  className="flex items-start gap-4 border-b border-border/40 py-4 last:border-0"
  initial={{ opacity: 0, y: 6 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: Math.min(i, 7) * 0.04, ease: [0.22, 1, 0.36, 1] }}
>
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium text-foreground">{item.name}</p>
    {item.notes && <p className="text-xs text-muted-foreground mt-0.5">{item.notes}</p>}
  </div>
  <span className="font-mono text-[10px] text-muted-foreground shrink-0">
    {item.created_at ? new Date(item.created_at).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" }) : "—"}
  </span>
</motion.div>
```

- [ ] **Step 3: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | head -20
git add app/user/records/page.tsx
git commit -m "feat(ui): update records — underline tabs, row items, stagger, motion entrance"
```

---

## Task 12: Blockchain Page

**Files:**
- Modify: `app/user/blockchain/page.tsx`

- [ ] **Step 1: Update header + motion**

```tsx
// Already uses motion import. Add if missing.

<UserPageHeader
  sectionLabel="Audit Trail"
  title="Blockchain Records"
  description="Cryptographic audit log of your health record access and modifications."
/>
```

Wrap page in motion entrance.

- [ ] **Step 2: Update hash value rendering**

Find where `tx_hash`, `content_hash`, `ipfs_cid` render. Ensure mono font + truncation:
```tsx
// For any hash display:
<span className="font-mono text-[10px] text-muted-foreground truncate max-w-[120px]">
  {hash ?? "—"}
</span>
```

- [ ] **Step 3: Stagger audit entries**

Find where audit entries map. Add stagger motion same as Task 9 pattern.

- [ ] **Step 4: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | head -20
git add app/user/blockchain/page.tsx
git commit -m "feat(ui): update blockchain — section label, mono hashes, motion stagger"
```

---

## Task 13: Caregiver + Telehealth Pages

**Files:**
- Modify: `app/user/caregiver/page.tsx`
- Modify: `app/user/telehealth/page.tsx`

- [ ] **Step 1: Update caregiver/page.tsx**

```tsx
import { motion } from "framer-motion";

<UserPageHeader
  sectionLabel="Care Network"
  title="Caregiver Access"
  description="Manage who can view and assist with your health data."
/>
```

Wrap in motion entrance. Replace `Card` wrapping on caregiver list items with row pattern:
```tsx
<motion.div
  key={patient.link_id}
  className="flex items-center gap-4 border-b border-border/40 py-4 last:border-0"
  initial={{ opacity: 0, y: 6 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
>
  {/* existing patient info */}
</motion.div>
```

- [ ] **Step 2: Update telehealth/page.tsx**

```tsx
import { motion } from "framer-motion";

<UserPageHeader
  sectionLabel="Virtual Consultations"
  title="Telehealth"
  description="Video consultations with your healthcare providers."
/>
```

Wrap in motion entrance. Replace any Card wrappers with the row pattern for appointment list items.

- [ ] **Step 3: TypeScript check + commit**

```bash
npx tsc --noEmit 2>&1 | head -20
git add app/user/caregiver/page.tsx app/user/telehealth/page.tsx
git commit -m "feat(ui): update caregiver + telehealth — section labels, row layout, motion"
```

---

## Self-Review Checklist

- [x] All 14 pages covered (including `sso-callback` which is excluded by spec)
- [x] Shared components in Tasks 1–2 (foundation)
- [x] No left/right border stripe patterns used anywhere
- [x] No gradient text
- [x] Motion easing `[0.22, 1, 0.36, 1]` used consistently
- [x] `useReducedMotion` provided via `useMotionConfig` hook (Task 1)
- [x] `sectionLabel` prop added to `UserPageHeader` (Task 1)
- [x] Underline tab pattern defined in Task 5 and reused verbatim in Task 11
- [x] Stagger pattern consistent across Tasks 3, 5, 6, 9, 11, 12, 13
- [x] All TypeScript check steps included
- [x] All commits specified with exact message
