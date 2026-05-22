"use client";

import { useEffect, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bot, MessageCircle } from "lucide-react";
import Chatbot from "./chatbot";

export default function ChatbotLauncher() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <>
            <Sheet>
                <SheetTrigger className="fixed bottom-6 right-6 z-50" asChild>
                    <Button
                        aria-label="Open Cura Sync Mate"
                        className="group size-12 rounded-full border border-primary/15 bg-primary text-primary-foreground shadow-md shadow-primary/10 hover:bg-primary/90 hover:shadow-lg sm:size-13"
                        size="icon"
                    >
                        <div className="relative">
                            <MessageCircle className="size-5 transition-transform duration-200 group-hover:-translate-y-0.5 sm:size-5.5" />
                            <span className="absolute -right-1 -top-1 size-2.5 rounded-full border-2 border-background bg-secondary" />
                        </div>
                    </Button>
                </SheetTrigger>
                <SheetContent className="h-full w-full gap-0 overflow-hidden border-l border-border bg-background p-0 shadow-xl sm:max-w-xl">
                    <div className="flex flex-col h-full">
                        <SheetHeader className="border-b border-border bg-background px-5 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-card text-primary shadow-xs">
                                        <Bot className="size-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <SheetTitle className="text-base font-semibold leading-tight text-foreground">
                                            Cura Sync Mate
                                        </SheetTitle>
                                        <SheetDescription className="mt-1 text-sm leading-none text-muted-foreground">
                                            How can I help you today?
                                        </SheetDescription>
                                    </div>
                                </div>
                            </div>
                        </SheetHeader>

                        <div className="flex-1 overflow-hidden">
                            <Chatbot />
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
