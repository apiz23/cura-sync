# CuraSync Web

CuraSync Web is a healthcare platform built with Next.js. It includes:

- a public marketing and facility discovery site
- authentication flows
- a user dashboard for appointments, medications, profile, and symptom analysis
- an admin/staff area for facility management
- Supabase-backed APIs
- AI-powered chat and symptom analysis integrations

## Tech Stack

- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Clerk for authentication
- Supabase for data access
- Radix UI, Vaul, and custom UI components
- Sonner for toast notifications

## Project Structure

```text
app/
  (public)/   Public website pages
  auth/       Authentication pages
  user/       User dashboard pages
  admin/      Admin and staff pages
  api/        Server routes
components/   Shared UI and feature components
lib/          Helpers, auth utilities, Supabase client
supabase/
  migrations/ Database migrations
scripts/      Local development helpers
```

## Main Features

- public facility browsing
- facility registration
- appointment booking flow
- medication management
- user profile management
- admin facility management and scheduling
- AI chat assistant
- symptom analysis integration

## Requirements

- Node.js 20+
- pnpm or npm
- Supabase project
- Clerk project

## Environment Variables

Create `cura-sync-web/.env.local` and configure the values below.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
CLERK_SECRET_KEY=
CURA_STAFF_JWT_SECRET=
CURA_SYNC_AI_URL=http://127.0.0.1:8000
RESEND_API_KEY=
CONTACT_FROM_EMAIL=
CONTACT_TO_EMAIL=
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required by [`lib/supabase.ts`](c:/Users/SCSM11/Desktop/Developer/cura-sync/cura-sync-web/lib/supabase.ts).
- `CURA_STAFF_JWT_SECRET` is used for staff session handling, with `CLERK_SECRET_KEY` as fallback in [`lib/staff-session.ts`](c:/Users/SCSM11/Desktop/Developer/cura-sync/cura-sync-web/lib/staff-session.ts).
- `CURA_SYNC_AI_URL` is used by the server-side chat and symptom-analysis API routes. `NEXT_PUBLIC_CURA_SYNC_AI` is still accepted for local compatibility.
- `RESEND_API_KEY` is required for the contact API route.
- `CONTACT_FROM_EMAIL` defaults to `CuraSync <onboarding@resend.dev>` if unset.
- `CONTACT_TO_EMAIL` defaults to `piz230601@gmail.com` if unset.

## Installation

```bash
pnpm install
```

If you use npm instead:

```bash
npm install
```

## Development

Start the app:

```bash
pnpm dev
```

Useful scripts:

```bash
pnpm dev
pnpm dev:clean
pnpm dev:unlock
pnpm dev:webpack
pnpm build
pnpm start
pnpm lint
```

## Database

Supabase migrations live in [`supabase/migrations`](c:/Users/SCSM11/Desktop/Developer/cura-sync/cura-sync-web/supabase/migrations).

If you are using the Supabase CLI, a typical flow is:

```bash
supabase start
supabase db push
```

Adjust that flow to match your team setup if your database is already hosted remotely.

## App Areas

- Public: landing pages, pricing, contact, facilities, partner registration
- Auth: sign-in and access flows
- User: appointments, medications, profile, symptom analyzer
- Admin: facility data, schedules, and internal management workflows

## API Notes

Examples of server routes in [`app/api`](c:/Users/SCSM11/Desktop/Developer/cura-sync/cura-sync-web/app/api):

- facility data
- facility schedules
- appointments
- chat
- symptom analysis
- contact form handling

## Linting

```bash
pnpm lint
```

At the time of writing, the repo has existing warning-level ESLint output in [`scripts/clean-next-dev.mjs`](c:/Users/SCSM11/Desktop/Developer/cura-sync/cura-sync-web/scripts/clean-next-dev.mjs).

## Notes

- The app uses the App Router layout pattern extensively across public, auth, user, and admin sections.
- Some features depend on external services being available, especially Clerk, Supabase, and the local or remote AI backend.
