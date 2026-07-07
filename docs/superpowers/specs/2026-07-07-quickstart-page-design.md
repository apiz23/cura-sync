# Quickstart Page — Design Spec

Date: 2026-07-07

## Purpose

CuraSync has three parts of the same product — `cura-sync-web` (Next.js), `cura-sync-app`
(Expo/React Native), `cura-sync-ai` (FastAPI). There is no single page that shows how to get
all three running locally. This adds a `/quickstart` page in `cura-sync-web` that covers setup
for all three, styled like a modern docs quickstart (shadcn-style): clean, tabbed, copyable
code blocks. It doubles as dev onboarding and a public-facing "how this is built" page.

## Route & Layout

- New file: `app/(public)/quickstart/page.tsx`.
- Server component, static content (no data fetching). Renders inside existing
  `app/(public)/layout.tsx` (gets `Navbar`, `ChatbotLauncher`, `Footer` for free).
- Follows the container pattern used by `app/(public)/support/page.tsx`:
  `public-grid-page public-line-page` wrapper div, `public-page-content public-text-panel
  mx-auto max-w-3xl` (widened to `max-w-4xl` here since tabs+code blocks need more width)
  content column, `px-6 py-16` spacing.
- Metadata: title `"Quickstart – CuraSync"`, short description.

### Sections, top to bottom

1. **Hero** — `<h1>Quickstart</h1>`, one-line subtitle, row of small stack badges using
   existing `components/ui/badge.tsx` (`Next.js`, `Expo`, `FastAPI`).
2. **Prerequisites card** — one `components/ui/card.tsx` listing: Node.js 20+, pnpm, Python
   3.11+, a Supabase project, a Clerk project, a JamAI Base PAT. Static list, no logic.
3. **Tabs** — `components/ui/tabs.tsx` with three triggers: **Web**, **Mobile App**,
   **AI Service**. Each `TabsContent` renders an ordered list of steps (see Content below).

## New Component: Step Blocks

Steps are not the existing `components/ui/stepper.tsx` (that's built for interactive wizard
flows with state — wrong fit for static docs). Instead, a small local layout inside the
quickstart page: each step is a flex row — a numbered circle badge (`1`, `2`, `3`…) + a
title + description + optional code block.

## New Component: `components/quickstart/code-block.tsx`

- Client component (`"use client"`).
- Props: `code: string`, optional `lang?: string` (label only, no highlighting).
- Renders `<pre><code>` in a rounded, bordered, `bg-muted`/monospace block, with a small
  copy button (top-right corner, `lucide-react` `Copy` → `Check` icon swap on click,
  `navigator.clipboard.writeText`, 2s revert).
- No Shiki syntax highlighting. Shiki is a project dependency but wiring async
  highlighting for a single static docs page is unwarranted complexity — plain monospace
  text matches the "shadcn quickstart" copy-paste use case fine.

## Content Per Tab

Sourced from each project's actual README / env files so commands are real:

**Web tab**
1. Clone & enter directory — `git clone <repo> && cd cura-sync-web`
2. Install — `pnpm install`
3. Configure env — `cp .env.example .env.local` then fill in Clerk, Supabase, JamAI
   (`PAT`, `PROJECT_ID`), `CURA_STAFF_JWT_SECRET`, `NEXT_PUBLIC_CURA_SYNC_AI`
4. Run — `pnpm dev`
5. Open `http://localhost:3000`

**Mobile App tab**
1. Enter directory — `cd cura-sync-app`
2. Install — `pnpm install`
3. Configure `.env` (Clerk keys, Supabase, AI backend URL — mirrors web's env needs for
   the pieces the app talks to)
4. Run — `pnpm expo start` (or `npx expo start`)
5. Open in Expo Go, or press `a`/`i`/`w` for Android/iOS/web

**AI Service tab**
1. Enter directory — `cd cura-sync-ai`
2. Create venv — `python -m venv venv` then activate it
3. Install — `pip install -r requirements.txt`
4. Configure `.env` — `HF_TOKEN`, `HF_NER_MODEL`, `JAMAI_PAT`, `JAMAI_PROJECT_ID`,
   `JAMAI_SYMPTOM_TABLE_ID`, `JAMAI_KNOWLEDGE_TABLE_ID`, `ALLOWED_ORIGINS`
5. Run — `uvicorn main:app --reload --port 8000`
6. Open `http://127.0.0.1:8000/docs` (FastAPI auto docs)

## Nav Change

- `components/navbar.tsx`: add `{ name: "Quickstart", href: "/quickstart" }` to `navItems`.
- Risk: desktop nav (`hidden items-center gap-1 xl:flex`, no wrap) is currently sized for
  5 items; a 6th may crowd right at the `xl` (1280px) breakpoint. Add it, visually check
  at 1280px during build; if it crowds, shorten "Register Health Center" label rather than
  changing breakpoint logic.

## Error Handling / Data

None — fully static content, no forms, no fetches, no external state. Copy button is the
only interactive bit and clipboard failures can be silently ignored (non-critical UX, no
error state needed).

## Testing / Verification

No unit-testable logic. Verify via `pnpm dev`:
- Tabs switch correctly, each shows the right steps
- Copy button copies correct text and shows the check-icon revert
- Responsive at mobile/tablet/desktop widths
- Dark mode renders correctly (existing `next-themes` `ModeToggle`)
- Navbar item appears and doesn't break layout at `xl` breakpoint
