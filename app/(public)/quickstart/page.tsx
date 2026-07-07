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
