# Quickstart Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/quickstart` page to `cura-sync-web` that shows how to get the web app, mobile app (`cura-sync-app`), and AI service (`cura-sync-ai`) running locally, in a tabbed shadcn-docs-style layout with copyable code blocks.

**Architecture:** One static server-rendered page (`app/(public)/quickstart/page.tsx`) inside the existing `(public)` route group (gets `Navbar`/`Footer` for free). A small client component (`components/quickstart/code-block.tsx`) handles copy-to-clipboard. Step content is plain data arrays defined in the page file — no CMS, no fetches. A nav link is added to the existing `Navbar`.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, existing shadcn `ui/card`, `ui/tabs`, `ui/badge` components, `lucide-react` icons.

## Global Constraints

- No test framework (Jest/Vitest/Playwright) exists in `cura-sync-web` — do not add one. Verify via `pnpm dev` + manual browser check, and `pnpm lint` / `pnpm build` for type/lint correctness, per the design spec's Testing section.
- Follow existing page pattern from `app/(public)/support/page.tsx`: `public-grid-page public-line-page` wrapper, `public-page-content public-text-panel mx-auto ... px-6 py-16` content column.
- No Shiki syntax highlighting in the code block — plain monospace text only (per spec).
- All commands shown must be the real commands from each project's actual README/env files (already verified during design).

---

### Task 1: `CodeBlock` component

**Files:**
- Create: `components/quickstart/code-block.tsx`

**Interfaces:**
- Produces: `CodeBlock({ code: string; lang?: string; className?: string }): JSX.Element` — a default-exported-free named export `CodeBlock`, used by Task 2's `StepList`.

- [ ] **Step 1: Create the component**

```tsx
"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  code: string
  lang?: string
  className?: string
}

export function CodeBlock({ code, lang = "bash", className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-muted/50", className)}>
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-1.5">
        <span className="text-xs font-medium text-muted-foreground">{lang}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-sm">
        <code className="font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm exec tsc --noEmit`
Expected: no errors referencing `components/quickstart/code-block.tsx`

- [ ] **Step 3: Commit**

```bash
git add components/quickstart/code-block.tsx
git commit -m "feat: add copyable code block component for quickstart docs"
```

---

### Task 2: Quickstart page

**Files:**
- Create: `app/(public)/quickstart/page.tsx`

**Interfaces:**
- Consumes: `CodeBlock` from `components/quickstart/code-block.tsx` (Task 1) — `<CodeBlock code={string} />`.
- Consumes: existing `Badge` (`components/ui/badge.tsx`), `Card`/`CardHeader`/`CardTitle`/`CardDescription`/`CardContent` (`components/ui/card.tsx`), `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` (`components/ui/tabs.tsx`).
- Produces: route `/quickstart`, consumed by Task 3's nav link.

- [ ] **Step 1: Create the page**

```tsx
import type { Metadata } from "next"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/quickstart/code-block"

export const metadata: Metadata = {
  title: "Quickstart – CuraSync",
  description:
    "Get the CuraSync web app, mobile app, and AI service running locally.",
}

type Step = {
  title: string
  description?: string
  code?: string
}

const webSteps: Step[] = [
  {
    title: "Clone the repo",
    code: "git clone <repo-url>\ncd cura-sync-web",
  },
  {
    title: "Install dependencies",
    code: "pnpm install",
  },
  {
    title: "Configure environment variables",
    description:
      "Copy the example env file, then fill in Clerk, Supabase, and JamAI credentials.",
    code: "cp .env.example .env.local",
  },
  {
    title: "Start the dev server",
    code: "pnpm dev",
  },
  {
    title: "Open the app",
    description: "Visit http://localhost:3000 in your browser.",
  },
]

const appSteps: Step[] = [
  {
    title: "Enter the project directory",
    code: "cd cura-sync-app",
  },
  {
    title: "Install dependencies",
    code: "pnpm install",
  },
  {
    title: "Configure environment variables",
    description:
      "Create a .env with Clerk keys, Supabase credentials, and the AI service URL (mirrors the web app's env needs for the pieces the mobile app talks to).",
  },
  {
    title: "Start Expo",
    code: "pnpm expo start",
  },
  {
    title: "Open the app",
    description:
      "Scan the QR code with Expo Go, or press a / i / w in the terminal for Android, iOS, or web.",
  },
]

const aiSteps: Step[] = [
  {
    title: "Enter the project directory",
    code: "cd cura-sync-ai",
  },
  {
    title: "Create a virtual environment",
    code:
      "python -m venv venv\n# macOS/Linux\nsource venv/bin/activate\n# Windows\nvenv\\Scripts\\activate",
  },
  {
    title: "Install dependencies",
    code: "pip install -r requirements.txt",
  },
  {
    title: "Configure environment variables",
    description:
      "Create a .env with HF_TOKEN, HF_NER_MODEL, JAMAI_PAT, JAMAI_PROJECT_ID, JAMAI_SYMPTOM_TABLE_ID, JAMAI_KNOWLEDGE_TABLE_ID, and ALLOWED_ORIGINS.",
  },
  {
    title: "Start the server",
    code: "uvicorn main:app --reload --port 8000",
  },
  {
    title: "Open the API docs",
    description: "Visit http://127.0.0.1:8000/docs for the FastAPI Swagger UI.",
  },
]

function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="space-y-6">
      {steps.map((step, i) => (
        <li key={step.title} className="flex gap-4">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {i + 1}
          </span>
          <div className="flex-1 space-y-2 pt-0.5">
            <p className="font-medium text-foreground">{step.title}</p>
            {step.description && (
              <p className="text-sm text-muted-foreground">{step.description}</p>
            )}
            {step.code && <CodeBlock code={step.code} />}
          </div>
        </li>
      ))}
    </ol>
  )
}

export default function QuickstartPage() {
  return (
    <div className="public-grid-page public-line-page">
      <main className="public-page-content public-text-panel mx-auto my-16 max-w-4xl space-y-10 px-6 py-16">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Quickstart</h1>
          <p className="text-muted-foreground">
            Run the CuraSync web app, mobile app, and AI service locally.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Next.js</Badge>
            <Badge variant="secondary">Expo</Badge>
            <Badge variant="secondary">FastAPI</Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prerequisites</CardTitle>
            <CardDescription>Have these ready before you start.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-muted-foreground">
              <li>Node.js 20+ and pnpm</li>
              <li>Python 3.11+</li>
              <li>A Supabase project (URL + anon/service keys)</li>
              <li>A Clerk project (publishable + secret keys)</li>
              <li>A JamAI Base personal access token (PAT) and project ID</li>
            </ul>
          </CardContent>
        </Card>

        <Tabs defaultValue="web">
          <TabsList>
            <TabsTrigger value="web">Web</TabsTrigger>
            <TabsTrigger value="app">Mobile App</TabsTrigger>
            <TabsTrigger value="ai">AI Service</TabsTrigger>
          </TabsList>
          <TabsContent value="web" className="pt-6">
            <StepList steps={webSteps} />
          </TabsContent>
          <TabsContent value="app" className="pt-6">
            <StepList steps={appSteps} />
          </TabsContent>
          <TabsContent value="ai" className="pt-6">
            <StepList steps={aiSteps} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Run the dev server and check the page**

Run: `pnpm dev`
Visit: `http://localhost:3000/quickstart`
Expected:
- Page renders with hero, badges, Prerequisites card, and 3 tabs (Web / Mobile App / AI Service)
- Switching tabs shows the correct steps for each
- Clicking the copy icon on a code block copies its text and briefly shows a check icon
- Page looks correct in both light and dark mode (toggle via the existing `ModeToggle` in the navbar)
- Page is usable at mobile width (~375px) and desktop width

- [ ] **Step 3: Lint and typecheck**

Run: `pnpm lint`
Expected: no new errors from `app/(public)/quickstart/page.tsx`

- [ ] **Step 4: Commit**

```bash
git add "app/(public)/quickstart/page.tsx"
git commit -m "feat: add quickstart page covering web, mobile app, and AI service setup"
```

---

### Task 3: Nav link

**Files:**
- Modify: `components/navbar.tsx:14-20`

**Interfaces:**
- Consumes: route `/quickstart` from Task 2.

- [ ] **Step 1: Add the nav item**

In `components/navbar.tsx`, change:

```tsx
const navItems = [
    { name: "Home", href: "/home" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
    { name: "Facilities", href: "/facilities" },
    { name: "Register Health Center", href: "/partner/register" },
]
```

to:

```tsx
const navItems = [
    { name: "Home", href: "/home" },
    { name: "Quickstart", href: "/quickstart" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
    { name: "Facilities", href: "/facilities" },
    { name: "Register Health Center", href: "/partner/register" },
]
```

- [ ] **Step 2: Check desktop nav at the `xl` breakpoint**

Run: `pnpm dev` (if not already running)
Visit: `http://localhost:3000/home`, resize the browser to ~1280px wide (the `xl` breakpoint)
Expected: all 6 nav items fit on one line without wrapping or overflowing, and the active-item indicator still highlights correctly per route.

If items crowd or wrap: shorten `"Register Health Center"` to `"Register"` in the same array (do not change breakpoint/layout logic — that's out of scope for this task).

- [ ] **Step 3: Check the mobile drawer**

Visit at a narrow width (e.g. 500px), open the hamburger menu.
Expected: "Quickstart" appears in the drawer nav list between Home and Pricing, navigates to `/quickstart` on click, and closes the drawer.

- [ ] **Step 4: Commit**

```bash
git add components/navbar.tsx
git commit -m "feat: add quickstart link to navbar"
```
