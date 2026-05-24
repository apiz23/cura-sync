"use client";

import { useEffect, useRef, useState } from "react";
import {
    Message,
    MessageAvatar,
    MessageContent,
} from "@/components/prompt-kit/message";
import AgentAvatar from "@/components/smoothui/agent-avatar";
import {
    PromptInput,
    PromptInputAction,
    PromptInputActions,
    PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
    from: "user" | "assistant";
    content: string;
    timestamp: string | null;
}

const INITIAL_MESSAGE: ChatMessage = {
    from: "assistant",
    content: "Hello! How can I help you today?",
    timestamp: null,
};

function CuraAiAvatar({ size = 36 }: { size?: number }) {
    return (
        <AgentAvatar
            seed="Harper"
            size={size}
            className="border border-border bg-card shadow-xs"
        />
    );
}

export default function Chatbot() {
    const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const sessionIdRef = useRef<string>("");

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const storedSessionId = window.localStorage.getItem("cura-chat-session");
        if (storedSessionId) {
            sessionIdRef.current = storedSessionId;
            return;
        }

        const newSessionId = `chat-${crypto.randomUUID()}`;
        sessionIdRef.current = newSessionId;
        window.localStorage.setItem("cura-chat-session", newSessionId);
    }, []);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            from: "user",
            content: input,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: sessionIdRef.current,
                    message: userMessage.content,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.reply) {
                throw new Error(data.error || "Failed to get response");
            }

            setMessages((prev) => [
                ...prev,
                {
                    from: "assistant",
                    content: data.reply,
                    timestamp: new Date().toISOString(),
                },
            ]);
        } catch {
            setError("Something went wrong. Please try again.");
            setMessages((prev) => [
                ...prev,
                {
                    from: "assistant",
                    content:
                        "Sorry, I'm having trouble responding right now. Please try again later.",
                    timestamp: new Date().toISOString(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="flex h-full flex-col bg-background text-foreground">
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="mx-auto max-w-3xl space-y-6">
                    {messages.length === 1 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in duration-300">
                            <div className="relative mb-6">
                                <div className="flex size-20 items-center justify-center rounded-full border border-border bg-card shadow-sm">
                                    <CuraAiAvatar size={64} />
                                </div>
                                <div className="absolute -right-1 -top-1 size-4 rounded-full border-2 border-background bg-secondary" />
                            </div>
                            <h2 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
                                Welcome to Cura AI
                            </h2>
                            <p className="max-w-md text-sm text-muted-foreground">
                                I can help answer questions and keep the
                                conversation organized.
                            </p>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={cn(
                                "animate-in fade-in duration-200",
                                msg.from === "user"
                                    ? "flex justify-end"
                                    : "flex justify-start"
                            )}
                        >
                            <div className="group relative max-w-[85%] md:max-w-[75%]">
                                <Message
                                    className={cn(
                                        "items-start transition-colors duration-200",
                                        msg.from === "user" &&
                                            "flex-row-reverse"
                                    )}
                                >
                                    {msg.from === "assistant" ? (
                                        <div className="mt-1 transition-transform duration-200 group-hover:scale-105">
                                            <CuraAiAvatar />
                                        </div>
                                    ) : (
                                        <MessageAvatar
                                            src="/avatars/user.png"
                                            alt="User"
                                            fallback="U"
                                            className="mt-1 size-9 border border-primary/20 bg-primary/10 text-primary shadow-xs transition-transform duration-200 group-hover:scale-105"
                                        />
                                    )}

                                    <div className="flex-1 space-y-3">
                                        <div
                                            className={cn(
                                                "rounded-xl border p-3 shadow-sm transition-colors duration-200",
                                                msg.from === "user"
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-border bg-card text-card-foreground"
                                            )}
                                        >
                                            <MessageContent
                                                markdown={
                                                    msg.from === "assistant"
                                                }
                                                className={cn(
                                                    "bg-transparent p-0 text-sm leading-relaxed text-current md:text-base",
                                                    msg.from === "assistant" &&
                                                        "prose-p:my-2 prose-p:text-current prose-headings:my-3 prose-headings:text-current prose-strong:text-current prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-li:text-current"
                                                )}
                                            >
                                                {msg.content}
                                            </MessageContent>
                                        </div>

                                        <div className="flex items-center justify-between gap-3 px-1">
                                            <span
                                                className={cn(
                                                    "rounded-full px-2 py-1 text-xs font-medium",
                                                    msg.from === "user"
                                                        ? "bg-primary/10 text-primary"
                                                        : "bg-muted text-muted-foreground"
                                                )}
                                            >
                                                {msg.from === "user"
                                                    ? "You"
                                                    : "Cura AI"}
                                            </span>
                                            {msg.timestamp && (
                                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <span className="size-1 rounded-full bg-current opacity-50" />
                                                    {formatTime(msg.timestamp)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Message>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start animate-in fade-in duration-200">
                            <div className="relative max-w-[75%]">
                                <Message className="items-start">
                                    <div className="mt-1">
                                        <CuraAiAvatar />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                                            <div className="space-y-2">
                                                <div className="h-3 w-48 animate-pulse rounded-full bg-muted" />
                                                <div className="h-3 w-40 animate-pulse rounded-full bg-muted" />
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                {[...Array(3)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="size-2 animate-pulse rounded-full bg-primary/60"
                                                        style={{
                                                            animationDelay: `${
                                                                i * 150
                                                            }ms`,
                                                            animationDuration:
                                                                "1.5s",
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between px-1">
                                            <span className="rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                                                Cura AI
                                            </span>
                                        </div>
                                    </div>
                                </Message>
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} className="h-4" />
                </div>
            </div>

            {error && (
                <div className="mx-4 mb-3 animate-in slide-in-from-bottom duration-200 md:mx-6">
                    <div className="mx-auto max-w-3xl rounded-xl border border-destructive/25 bg-destructive/10 p-4 shadow-xs">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 shrink-0">
                                <div className="flex size-8 items-center justify-center rounded-full border border-destructive/25 bg-background">
                                    <AlertCircle className="size-4 text-destructive" />
                                </div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-destructive">
                                    Connection Issue
                                </p>
                                <p className="mt-1 text-xs text-destructive">
                                    {error}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                aria-label="Dismiss connection issue"
                                className="size-7 rounded-full p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setError(null)}
                            >
                                x
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="border-t border-border bg-background p-4 md:p-6">
                <div className="mx-auto max-w-3xl">
                    <PromptInput
                        value={input}
                        onValueChange={setInput}
                        onSubmit={sendMessage}
                        isLoading={isLoading}
                        className="w-full rounded-xl border border-input bg-background shadow-sm transition-colors duration-200 hover:border-ring/60 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/20"
                    >
                        <PromptInputTextarea
                            placeholder="Ask me anything..."
                            className="max-h-[120px] min-h-[56px] px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground md:text-base"
                        />

                        {input.length > 0 && (
                            <div className="absolute right-20 top-1/2 -translate-y-1/2">
                                <div className="rounded-md border border-border bg-muted px-2 py-1 shadow-xs">
                                    <span
                                        className={cn(
                                            "text-xs font-medium",
                                            input.length > 200
                                                ? "text-destructive"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {input.length}
                                    </span>
                                </div>
                            </div>
                        )}

                        <PromptInputActions className="justify-end p-3">
                            <PromptInputAction
                                tooltip={
                                    isLoading
                                        ? "Stop generation"
                                        : "Send message (Enter)"
                                }
                            >
                                <Button
                                    size="icon"
                                    className={cn(
                                        "group size-11 rounded-full transition-colors duration-200",
                                        isLoading
                                            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            : "bg-primary text-primary-foreground hover:bg-primary/90"
                                    )}
                                    disabled={!input.trim() && !isLoading}
                                    onClick={sendMessage}
                                >
                                    {isLoading ? (
                                        <Square className="size-5 fill-current" />
                                    ) : (
                                        <ArrowUp className="size-5 transition-transform group-hover:-translate-y-0.5" />
                                    )}
                                </Button>
                            </PromptInputAction>
                        </PromptInputActions>
                    </PromptInput>

                    <div className="mt-3 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <div className="flex items-center gap-1.5">
                            <div className="size-1.5 rounded-full bg-primary/50" />
                            <p className="text-xs text-muted-foreground">
                                Press{" "}
                                <kbd className="rounded-md border border-border bg-muted px-2 py-1 text-[11px] font-semibold text-foreground shadow-xs">
                                    Enter
                                </kbd>{" "}
                                to send
                            </p>
                        </div>
                        <div className="hidden h-3 w-px bg-border sm:block" />
                        <div className="flex items-center gap-1.5">
                            <div className="size-1.5 rounded-full bg-secondary/50" />
                            <p className="text-xs text-muted-foreground">
                                Press{" "}
                                <kbd className="rounded-md border border-border bg-muted px-2 py-1 text-[11px] font-semibold text-foreground shadow-xs">
                                    Shift
                                </kbd>{" "}
                                +{" "}
                                <kbd className="rounded-md border border-border bg-muted px-2 py-1 text-[11px] font-semibold text-foreground shadow-xs">
                                    Enter
                                </kbd>{" "}
                                for new line
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
