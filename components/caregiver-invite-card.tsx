"use client";

import { useState } from "react";
import { Users, RefreshCw, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type InviteState =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "ready"; code: string; expiresAt: string }
    | { status: "error"; message: string };

export function CaregiverInviteCard() {
    const [state, setState] = useState<InviteState>({ status: "idle" });
    const [copied, setCopied] = useState(false);

    async function generate() {
        setState({ status: "loading" });
        try {
            const res = await fetch("/api/patient/caregiver-invite", { method: "POST" });
            const rawText = await res.text();
            let json: { data?: { code: string; expiresAt: string }; error?: string } = {};
            try { json = JSON.parse(rawText); } catch { /* non-JSON */ }
            if (!res.ok) {
                setState({ status: "error", message: `HTTP ${res.status}: ${json?.error ?? rawText}` });
                return;
            }
            setState({ status: "ready", code: json.data!.code, expiresAt: json.data!.expiresAt });
        } catch (err) {
            setState({ status: "error", message: `Network error: ${err instanceof Error ? err.message : String(err)}` });
        }
    }

    async function copyCode(code: string) {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function formatExpiry(iso: string) {
        return new Date(iso).toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
    }

    return (
        <Card className="border-border">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Share with Caregiver</CardTitle>
                </div>
                <CardDescription>
                    Generate a code and share it with a family member or caregiver. They enter it in the CuraSync app to view your health data.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {state.status === "idle" && (
                    <Button onClick={generate} className="w-full sm:w-auto">
                        Generate Code
                    </Button>
                )}

                {state.status === "loading" && (
                    <Button disabled className="w-full sm:w-auto">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                    </Button>
                )}

                {state.status === "error" && (
                    <div className="space-y-3">
                        <p className="text-sm text-destructive">{state.message}</p>
                        <Button variant="outline" onClick={generate} className="w-full sm:w-auto">
                            Try Again
                        </Button>
                    </div>
                )}

                {state.status === "ready" && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl border-2 border-primary/30 bg-primary/5 px-6 py-3">
                                <span className="font-mono text-3xl font-bold tracking-[0.3em] text-primary">
                                    {state.code}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyCode(state.code)}
                                aria-label="Copy code"
                            >
                                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Share this 6-digit code with your caregiver. Expires at{" "}
                            <span className="font-medium text-foreground">{formatExpiry(state.expiresAt)}</span>{" "}
                            (15 minutes).
                        </p>
                        <Button variant="outline" size="sm" onClick={generate}>
                            <RefreshCw className="mr-2 h-3.5 w-3.5" />
                            Get New Code
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
