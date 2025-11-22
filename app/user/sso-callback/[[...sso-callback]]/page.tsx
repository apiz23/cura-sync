"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";
import { Loader2, Stethoscope } from "lucide-react";

export default function SsoCallback() {
    const { isLoaded } = useSignIn();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded) {
            router.replace("/user/dashboard");
        }
    }, [isLoaded, router]);

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
            <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                {/* Logo/Brand Section */}
                <div className="relative">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-lg ring-1 ring-primary/20">
                        <Stethoscope className="size-8" />
                    </div>
                    {/* Pulsing ping effect behind logo */}
                    <span className="absolute -top-1 -right-1 flex size-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full size-3 bg-blue-500"></span>
                    </span>
                </div>

                {/* Text Section */}
                <div className="text-center space-y-2 max-w-xs">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">
                        Completing Sign In
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Please wait while we securely verify your credentials
                        and log you into CuraSync.
                    </p>
                </div>

                {/* Loading Spinner */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-full border border-border/40">
                    <Loader2 className="size-4 animate-spin text-primary" />
                    <span>Verifying security tokens...</span>
                </div>
            </div>
        </div>
    );
}
