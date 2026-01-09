"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    Message,
    MessageAvatar,
    MessageContent,
} from "@/components/ui/message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, AlertCircle } from "lucide-react";

interface ChatMessage {
    from: "user" | "assistant";
    name: string;
    avatar: string;
    content: string;
    timestamp: string;
}

const STORAGE_KEYS = {
    SESSION_ID: "curasync_session_id",
    CHAT_HISTORY: "curasync_chat_history",
    LAST_ACTIVE: "curasync_last_active",
};

const INITIAL_MESSAGE: ChatMessage = {
    from: "assistant",
    name: "AI Assistant",
    avatar: "/assistant-avatar.jpg",
    content:
        "Hello! I'm here to help you with any questions you might have. What would you like to know?",
    timestamp: new Date().toISOString(),
};

export default function Chatbot() {
    const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string>("");
    const [isInitialized, setIsInitialized] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const initializeChat = () => {
            try {
                let storedSession = localStorage.getItem(
                    STORAGE_KEYS.SESSION_ID
                );
                const lastActive = localStorage.getItem(
                    STORAGE_KEYS.LAST_ACTIVE
                );

                // Check if session is still valid (within 24 hours)
                const isSessionValid =
                    lastActive &&
                    Date.now() - parseInt(lastActive) < 24 * 60 * 60 * 1000;

                if (!storedSession || !isSessionValid) {
                    // Create new session
                    storedSession = `session-${Date.now()}-${Math.random()
                        .toString(36)
                        .substring(7)}`;
                    localStorage.setItem(
                        STORAGE_KEYS.SESSION_ID,
                        storedSession
                    );
                    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
                }

                setSessionId(storedSession);

                // Load chat history
                const storedMessages = localStorage.getItem(
                    STORAGE_KEYS.CHAT_HISTORY
                );
                if (storedMessages && isSessionValid) {
                    try {
                        const parsed: ChatMessage[] =
                            JSON.parse(storedMessages);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setMessages(parsed);
                        }
                    } catch (parseError) {
                        console.error(
                            "Failed to parse chat history:",
                            parseError
                        );
                        localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
                    }
                }

                // Update last active timestamp
                localStorage.setItem(
                    STORAGE_KEYS.LAST_ACTIVE,
                    Date.now().toString()
                );
                setIsInitialized(true);
            } catch (error) {
                console.error("Failed to initialize chat:", error);
                // Fallback to in-memory only
                setSessionId(`session-${Date.now()}`);
                setIsInitialized(true);
            }
        };

        initializeChat();
    }, []);

    useEffect(() => {
        if (isInitialized && messages.length > 0) {
            try {
                localStorage.setItem(
                    STORAGE_KEYS.CHAT_HISTORY,
                    JSON.stringify(messages)
                );
                localStorage.setItem(
                    STORAGE_KEYS.LAST_ACTIVE,
                    Date.now().toString()
                );
            } catch (error) {
                console.error("Failed to save chat history:", error);
            }
        }
    }, [messages, isInitialized]);

    // Auto-scroll
    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const sendMessage = async () => {
        if (!input.trim() || loading || !sessionId) return;

        const userMessage: ChatMessage = {
            from: "user",
            name: "You",
            avatar: "/user-avatar.jpg",
            content: input.trim(),
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        const currentInput = input;
        setInput("");
        setLoading(true);
        setError(null);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: sessionId,
                    message: currentInput,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(
                    errorData.reply ||
                        errorData.error ||
                        "Failed to get response"
                );
            }

            const data = await res.json();

            if (!data.reply) {
                throw new Error("Invalid response format from server");
            }

            const aiMessage: ChatMessage = {
                from: "assistant",
                name: "AI Assistant",
                avatar: "/assistant-avatar.jpg",
                content: data.reply,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (err: unknown) {
            console.error("Chat error:", err);

            const errorMessageText =
                err instanceof Error
                    ? err.message
                    : "An unexpected error occurred.";

            setError(errorMessageText);

            const errorMessage: ChatMessage = {
                from: "assistant",
                name: "AI Assistant",
                avatar: "/assistant-avatar.jpg",
                content:
                    "I apologize, but I'm having trouble responding right now. Please try again later.",
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timestamp: string) => {
        try {
            return new Date(timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "";
        }
    };

    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-linear-to-br from-background via-background to-muted/20">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className="animate-in fade-in duration-300"
                    >
                        <Message from={msg.from}>
                            <MessageAvatar
                                src={msg.avatar}
                                name={msg.name}
                                className={
                                    msg.from === "assistant"
                                        ? "bg-linear-to-br from-primary to-primary/80 shadow-lg"
                                        : "bg-linear-to-br from-accent to-accent/80 shadow-lg"
                                }
                            />
                            <MessageContent
                                variant="contained"
                                className={
                                    msg.from === "assistant"
                                        ? "bg-card/80 backdrop-blur-sm text-foreground border border-border/50 shadow-lg rounded-2xl"
                                        : "bg-linear-to-br from-primary to-primary/80 dark:text-black text-primary-foreground shadow-lg rounded-2xl"
                                }
                            >
                                <div className="space-y-2">
                                    <p className="whitespace-pre-wrap leading-relaxed text-[15px]">
                                        {msg.content}
                                    </p>
                                    <div className="flex items-center justify-between pt-2 border-t border-border/20">
                                        <span className="text-xs font-medium opacity-70">
                                            {msg.name}
                                        </span>
                                        <span className="text-xs opacity-60">
                                            {formatTime(msg.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            </MessageContent>
                        </Message>
                    </div>
                ))}

                {loading && (
                    <Message from="assistant">
                        <MessageAvatar
                            src="/assistant-avatar.jpg"
                            name="AI Assistant"
                            className="bg-linear-to-br from-primary to-primary/80 shadow-lg"
                        />
                        <MessageContent
                            variant="contained"
                            className="bg-card/80 backdrop-blur-sm text-foreground border border-border/50 shadow-lg rounded-2xl"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-foreground">
                                        Processing your request
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        This may take a few seconds...
                                    </p>
                                </div>
                            </div>
                        </MessageContent>
                    </Message>
                )}

                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mx-6 mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-2xl backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-destructive/20 rounded-full shrink-0">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-destructive">
                                Connection Issue
                            </p>
                            <p className="text-xs text-destructive/80 mt-1 truncate">
                                {error}
                            </p>
                        </div>
                        <Button
                            onClick={() => setError(null)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 shrink-0"
                        >
                            ×
                        </Button>
                    </div>
                </div>
            )}

            <div className="p-6 border-t border-border/50 bg-card/80 backdrop-blur-xl">
                <div className="space-y-4">
                    <div className="flex items-end gap-3">
                        <div className="flex-1 relative">
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Ask me anything..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                    className="rounded-2xl px-6 py-4 bg-background/90 backdrop-blur-sm text-foreground placeholder:text-muted-foreground/70 border-2 border-border/40 focus:border-primary/60 focus:bg-background focus:ring-4 focus:ring-primary/10 transition-all duration-300 text-[15px] leading-relaxed pr-16 min-h-[40px] resize-none"
                                    disabled={loading}
                                />
                                {/* Character count indicator */}
                                {input.length > 0 && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-lg border border-border/30">
                                            <span className="text-xs text-muted-foreground font-medium">
                                                {input.length}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button
                            onClick={sendMessage}
                            disabled={!input.trim() || loading}
                            size="icon"
                            className="rounded-2xl h-14 w-14 bg-linear-to-br from-primary to-primary/90 hover:from-primary hover:to-primary/80 text-primary-foreground shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-lg disabled:scale-100 disabled:hover:scale-100 shrink-0 border-2 border-primary/20"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
