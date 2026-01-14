"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, MessageCircle } from "lucide-react";
import Chatbot from "./chatbot";

export default function ChatbotLauncher() {
    return (
        <>
            <Dialog>
                <DialogTrigger className="fixed bottom-6 right-6 z-50" asChild>
                    <Button
                        className="rounded-full h-14 w-14 bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                        size="icon"
                    >
                        <div className="relative">
                            <MessageCircle className="h-6 w-6 transition-transform group-hover:scale-110" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-background animate-pulse" />
                        </div>
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[70vh] p-0 overflow-y-auto w-full sm:max-w-xl border-l border-border">
                    <div className="flex flex-col h-full">
                        <DialogHeader className="px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-xl">
                                        <Bot className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-lg font-semibold text-foreground">
                                            Cura Sync Mate
                                        </DialogTitle>
                                        <p className="text-sm text-muted-foreground">
                                            How can I help you today?
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 overflow-hidden">
                            <Chatbot />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
