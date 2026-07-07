import type { Metadata } from "next"
import { CheckCircle2, Cpu, Globe, Smartphone, Terminal } from "lucide-react"
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
import { cn } from "@/lib/utils"

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
      "Copy the example env file, then fill in Clerk, Supabase, JamAI (PAT, PROJECT_ID), CURA_STAFF_JWT_SECRET, and CURA_SYNC_AI_URL.",
    code: "cp .env.example .env.local\n# Windows: copy .env.example .env.local",
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
    <ol>
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        return (
          <li key={step.title} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-4 ring-background">
                {i + 1}
              </span>
              {!isLast && (
                <span
                  aria-hidden="true"
                  className="mt-1 w-px flex-1 bg-border"
                />
              )}
            </div>
            <div className={cn("flex-1 space-y-2 pt-0.5", !isLast && "pb-6")}>
              <p className="font-medium text-foreground">{step.title}</p>
              {step.description && (
                <p className="text-sm text-muted-foreground">{step.description}</p>
              )}
              {step.code && <CodeBlock code={step.code} />}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default function QuickstartPage() {
  return (
    <div className="public-grid-page public-line-page">
      <main className="public-page-content public-text-panel mx-auto my-16 max-w-4xl space-y-10 px-6 py-16">
        <div className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3.5 py-1.5 font-mono text-xs font-medium text-muted-foreground">
            <Terminal className="h-3 w-3 text-primary" aria-hidden="true" />
            Developer Quickstart
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Quickstart</h1>
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
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "Node.js 20+ and pnpm",
                "Python 3.11+",
                "A Supabase project (URL + anon/service keys)",
                "A Clerk project (publishable + secret keys)",
                "A JamAI Base personal access token (PAT) and project ID",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Tabs defaultValue="web">
          <TabsList>
            <TabsTrigger value="web" className="gap-1.5">
              <Globe className="h-4 w-4" aria-hidden="true" />
              Web
            </TabsTrigger>
            <TabsTrigger value="app" className="gap-1.5">
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              Mobile App
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-1.5">
              <Cpu className="h-4 w-4" aria-hidden="true" />
              AI Service
            </TabsTrigger>
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
