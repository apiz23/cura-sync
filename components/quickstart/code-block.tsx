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
