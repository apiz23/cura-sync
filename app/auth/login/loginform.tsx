"use client";

import { useState, useEffect } from "react";
import { useSignUp, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Stethoscope, Shield, Activity, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const { isLoaded: isSignUpLoaded, signUp } = useSignUp();
    const { isLoaded: userLoaded, isSignedIn } = useUser();
    const router = useRouter();

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        if (userLoaded && isSignedIn) {
            toast.success("Signed in successfully 🎉", {
                description: "Redirecting to your dashboard...",
            });

            setTimeout(() => {
                router.replace("/user/dashboard");
            }, 800);
        }
    }, [userLoaded, isSignedIn, router]);

    const handleGoogleAuth = async () => {
        if (!isSignUpLoaded) return;

        setError("");
        setIsLoading(true);

        toast.loading("Connecting to Google...", {
            id: "google-auth",
        });

        try {
            await signUp.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/user/sso-callback",
                redirectUrlComplete: "/user/dashboard",
            });
        } catch (err: unknown) {
            console.error("Google Auth Error:", err);

            let message = "Failed to connect with Google";

            if (
                typeof err === "object" &&
                err !== null &&
                "errors" in err &&
                Array.isArray(
                    (err as { errors?: { message?: string }[] }).errors
                )
            ) {
                message =
                    (err as { errors: { message?: string }[] }).errors[0]
                        ?.message || message;
            } else if (err instanceof Error) {
                message = err.message;
            }

            setError(message);

            toast.error(message, {
                id: "google-auth",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!userLoaded || isSignedIn) return null;

    return (
        <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0">
                <div
                    className={cn("flex flex-col gap-8", className)}
                    {...props}
                >
                    {/* Header Section */}
                    <div className="flex flex-col items-center gap-6 text-center">
                        <div className="relative">
                            <div className="relative size-20 flex items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-green-600 text-white shadow-lg">
                                <Stethoscope className="size-10" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight">
                                Welcome to CuraSync
                            </h1>
                            <p className="text-muted-foreground">
                                Sign in or create an account automatically
                            </p>
                        </div>
                    </div>

                    {/* Features Highlight */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            {
                                icon: Shield,
                                label: "Secure",
                                color: "text-blue-500",
                                bg: "bg-blue-50 dark:bg-blue-950/20",
                            },
                            {
                                icon: Activity,
                                label: "Efficient",
                                color: "text-emerald-500",
                                bg: "bg-emerald-50 dark:bg-emerald-950/20",
                            },
                            {
                                icon: Stethoscope,
                                label: "Medical",
                                color: "text-indigo-500",
                                bg: "bg-indigo-50 dark:bg-indigo-950/20",
                            },
                        ].map((feature) => (
                            <div
                                key={feature.label}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105 hover:shadow-sm",
                                    feature.bg
                                )}
                            >
                                <feature.icon
                                    className={cn("size-5", feature.color)}
                                />
                                <span className="text-sm font-medium">
                                    {feature.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="animate-in slide-in-from-top duration-300">
                            <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-xl text-center font-medium flex items-center justify-center gap-2">
                                <div className="size-2 bg-destructive rounded-full animate-pulse" />
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Main Auth Section */}
                    <div className="space-y-6 flex">
                        <Button
                            variant="outline"
                            type="button"
                            disabled={isLoading}
                            onClick={handleGoogleAuth}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                            className={cn(
                                "h-12 w-fit mx-auto rounded-xl border-2 transition-all duration-300",
                                "hover:border-primary hover:bg-accent/50 hover:shadow-md",
                                "active:scale-[0.98]",
                                isLoading && "opacity-70 cursor-not-allowed"
                            )}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <Loader2 className="size-5 animate-spin" />
                                    <span className="font-semibold">
                                        Connecting to Google...
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="relative">
                                        <FcGoogle className="size-6" />
                                        {isHovering && (
                                            <div className="absolute -inset-2 bg-white/20 rounded-full animate-ping" />
                                        )}
                                    </div>
                                    <span className="font-semibold">
                                        Continue with Google
                                    </span>
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
