"use client";

import { useEffect, useRef, useState } from "react";
import {
    Message,
    MessageAvatar,
    MessageContent,
} from "@/components/prompt-kit/message";
import {
    PromptInput,
    PromptInputAction,
    PromptInputActions,
    PromptInputTextarea,
} from "@/components/prompt-kit/prompt-input";
import { Button } from "@/components/ui/button";
import {
    ArrowUp,
    Square,
    Loader2,
    AlertCircle,
    Sparkles,
    User,
    Bot,
} from "lucide-react";
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
        } catch (err) {
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
        <div className="flex flex-col h-full bg-linear-to-b from-background via-background to-muted/5">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Initial Welcome Message */}
                    {messages[0] && messages.length === 1 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in duration-500">
                            <div className="relative mb-6">
                                <div className="h-20 w-20 rounded-full bg-linear-to-br from-primary/20 via-primary/10 to-transparent border-2 border-primary/30 flex items-center justify-center">
                                    <div className="h-16 w-16 rounded-full bg-linear-to-br from-primary/30 to-primary/20 flex items-center justify-center">
                                        <Bot className="h-8 w-8 text-primary" />
                                    </div>
                                </div>
                                <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-accent border-2 border-background flex items-center justify-center">
                                    <Sparkles className="h-3 w-3 text-accent-foreground" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-semibold tracking-tight bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
                                Welcome to Cura AI
                            </h2>
                            <p className="text-sm text-muted-foreground max-w-md">
                                I'm here to help you with anything you need. Ask
                                me questions, brainstorm ideas, or just chat!
                            </p>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={cn(
                                "animate-in fade-in duration-300",
                                msg.from === "user"
                                    ? "flex justify-end"
                                    : "flex justify-start"
                            )}
                        >
                            <div className="relative group max-w-[85%] md:max-w-[75%]">
                                <Message
                                    className={cn(
                                        "transition-all duration-300 items-start",
                                        msg.from === "user"
                                            ? "flex-row-reverse"
                                            : ""
                                    )}
                                >
                                    <MessageAvatar
                                        src={
                                            msg.from === "user"
                                                ? "/avatars/user.png"
                                                : "/avatars/ai.png"
                                        }
                                        alt={
                                            msg.from === "user" ? "User" : "AI"
                                        }
                                        fallback={
                                            msg.from === "user" ? "U" : "AI"
                                        }
                                        className={cn(
                                            "h-9 w-9 border-2 transition-transform duration-300 group-hover:scale-105 mt-1",
                                            msg.from === "user"
                                                ? "border-primary/30 bg-linear-to-br from-primary/20 to-primary/10 shadow-sm"
                                                : "border-secondary/30 bg-linear-to-br from-secondary/20 to-secondary/10 shadow-sm"
                                        )}
                                    />

                                    <div className="flex-1 space-y-3">
                                        <div
                                            className={cn(
                                                "rounded-2xl p-4 backdrop-blur-sm shadow-sm transition-all duration-300",
                                                msg.from === "user"
                                                    ? "bg-linear-to-bl from-primary/10 via-card/50 to-card/50 border border-primary/20"
                                                    : "bg-linear-to-br from-card/50 via-card/50 to-secondary/5 border border-secondary/20"
                                            )}
                                        >
                                            <MessageContent
                                                markdown={
                                                    msg.from === "assistant"
                                                }
                                                className={cn(
                                                    "text-sm md:text-base leading-relaxed p-4",
                                                    msg.from === "assistant"
                                                        ? "text-foreground prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-1"
                                                        : "text-foreground"
                                                )}
                                            >
                                                {msg.content}
                                            </MessageContent>
                                        </div>

                                        <div className="flex items-center justify-between px-1">
                                            <span
                                                className={cn(
                                                    "text-xs font-medium px-2 py-1 rounded-full",
                                                    msg.from === "user"
                                                        ? "bg-primary/10 text-primary"
                                                        : "bg-secondary/10 text-secondary-foreground"
                                                )}
                                            >
                                                {msg.from === "user"
                                                    ? "You"
                                                    : "Cura AI"}
                                            </span>
                                            {msg.timestamp && (
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <span className="h-1 w-1 rounded-full bg-current opacity-50" />
                                                    {formatTime(msg.timestamp)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Message>

                                {/* Decorative glow effect for user messages */}
                                {msg.from === "user" && (
                                    <div className="absolute -inset-0.5 bg-linear-to-r from-primary/20 to-transparent rounded-2xl blur-sm -z-10 opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                                )}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start animate-in fade-in duration-300">
                            <div className="relative max-w-[75%]">
                                <Message className="items-start">
                                    <MessageAvatar
                                        src="/avatars/ai.png"
                                        alt="AI"
                                        fallback="AI"
                                        className="h-9 w-9 border-2 border-secondary/30 bg-linear-to-br from-secondary/20 to-secondary/10 mt-1"
                                    />
                                    <div className="flex-1 space-y-3">
                                        <div className="rounded-2xl p-4 backdrop-blur-sm bg-linear-to-br from-card/50 via-card/50 to-secondary/5 border border-secondary/20">
                                            <div className="space-y-2">
                                                <div className="h-3 w-48 rounded-full bg-linear-to-r from-secondary/20 via-secondary/30 to-secondary/20 animate-pulse" />
                                                <div className="h-3 w-40 rounded-full bg-linear-to-r from-secondary/20 via-secondary/30 to-secondary/20 animate-pulse" />
                                            </div>
                                            <div className="flex gap-2 mt-4">
                                                {[...Array(3)].map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className="h-2 w-2 rounded-full bg-primary/60 animate-pulse"
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
                                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary/10 text-secondary-foreground">
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

            {/* Error Banner */}
            {error && (
                <div className="mx-4 md:mx-6 mb-3 animate-in slide-in-from-bottom duration-300">
                    <div className="max-w-3xl mx-auto rounded-xl bg-linear-to-r from-destructive/10 via-destructive/5 to-destructive/10 border border-destructive/20 p-4 backdrop-blur-sm shadow-xs">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                <div className="h-8 w-8 rounded-full bg-linear-to-br from-destructive/20 to-destructive/10 flex items-center justify-center border border-destructive/30">
                                    <AlertCircle className="h-4 w-4 text-destructive" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-destructive">
                                    Connection Issue
                                </p>
                                <p className="text-xs text-destructive/80 mt-1">
                                    {error}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => setError(null)}
                            >
                                ×
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="border-t border-border/40 bg-background/90 backdrop-blur-xl p-4 md:p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="relative">
                        {/* linear top border */}
                        <div className="absolute -top-3 left-4 right-4 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />

                        {/* Decorative glow */}
                        <div className="absolute inset-0 rounded-2xl bg-linear-to-r from-primary/5 via-transparent to-primary/5 blur-xl -z-10" />

                        <PromptInput
                            value={input}
                            onValueChange={setInput}
                            onSubmit={sendMessage}
                            isLoading={isLoading}
                            className="w-full bg-card/50 backdrop-blur-sm border-2 border-border/60 hover:border-primary/40 focus-within:border-primary/60 shadow-lg shadow-primary/5 rounded-2xl transition-all duration-300 hover:shadow-xl"
                        >
                            <PromptInputTextarea
                                placeholder="Ask me anything..."
                                className="min-h-[56px] max-h-[120px] py-4 px-5 text-sm md:text-base placeholder:text-muted-foreground/70"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                            />

                            {/* Character count with linear */}
                            {input.length > 0 && (
                                <div className="absolute right-20 top-1/2 -translate-y-1/2">
                                    <div className="px-2.5 py-1 bg-linear-to-br from-muted/60 to-muted/40 rounded-lg border border-border/40 shadow-xs backdrop-blur-sm">
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
                                            "h-12 w-12 rounded-full transition-all duration-300 group",
                                            isLoading
                                                ? "bg-linear-to-br from-destructive to-destructive/90 hover:from-destructive hover:to-destructive text-destructive-foreground shadow-lg"
                                                : "bg-linear-to-br from-primary via-primary to-primary/90 hover:from-primary hover:via-primary hover:to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl hover:shadow-primary/20 hover:scale-105"
                                        )}
                                        disabled={!input.trim() && !isLoading}
                                        onClick={sendMessage}
                                    >
                                        {isLoading ? (
                                            <div className="relative">
                                                <Square className="size-5 fill-current animate-pulse" />
                                                <div className="absolute inset-0 rounded-full border-2 border-current/30 animate-ping" />
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <ArrowUp className="size-5 group-hover:translate-y-[-1px] transition-transform" />
                                                <Sparkles className="absolute -top-1 -right-1 size-2.5 text-accent-foreground animate-pulse" />
                                            </div>
                                        )}
                                    </Button>
                                </PromptInputAction>
                            </PromptInputActions>
                        </PromptInput>

                        {/* Helper text with better styling */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-3">
                            <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                                <p className="text-xs text-muted-foreground/80">
                                    Press{" "}
                                    <kbd className="px-2 py-1 bg-accent/50 rounded-md text-[11px] font-semibold text-accent-foreground border border-border/50 shadow-xs">
                                        Enter
                                    </kbd>{" "}
                                    to send
                                </p>
                            </div>
                            <div className="h-3 w-px bg-border/50 hidden sm:block" />
                            <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-secondary/50" />
                                <p className="text-xs text-muted-foreground/80">
                                    Press{" "}
                                    <kbd className="px-2 py-1 bg-accent/50 rounded-md text-[11px] font-semibold text-accent-foreground border border-border/50 shadow-xs">
                                        Shift
                                    </kbd>{" "}
                                    +{" "}
                                    <kbd className="px-2 py-1 bg-accent/50 rounded-md text-[11px] font-semibold text-accent-foreground border border-border/50 shadow-xs">
                                        Enter
                                    </kbd>{" "}
                                    for new line
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
