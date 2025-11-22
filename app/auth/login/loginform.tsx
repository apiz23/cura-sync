"use client";

import { useState, useEffect } from "react";
import { useSignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const { isLoaded: isSignInLoaded, signIn } = useSignIn();
    const { isLoaded: isUserLoaded, isSignedIn } = useUser();
    const router = useRouter();

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isUserLoaded && isSignedIn) {
            router.replace("/user/dashboard");
        }
    }, [isUserLoaded, isSignedIn, router]);

    const handleGoogleSignIn = async () => {
        if (!isSignInLoaded) return;

        setIsLoading(true);
        setError("");

        try {
            await signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/user/sso-callback",
                redirectUrlComplete: "/user/dashboard",
            });
        } catch (err: unknown) {
            console.error("Google sign in error:", err);

            setIsLoading(false);

            if (typeof err === "object" && err !== null && "errors" in err) {
                const errObj = err as { errors?: { message?: string }[] };
                setError(
                    errObj.errors?.[0]?.message ||
                        "Failed to sign in with Google"
                );
            } else {
                setError("Failed to sign in with Google");
            }
        }
    };

    if (!isUserLoaded || isSignedIn) {
        return null;
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex size-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Stethoscope className="size-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">
                    Welcome to CuraSync
                </h1>
                <p className="text-sm text-muted-foreground">
                    Sign in or create an account automatically
                </p>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center font-medium">
                    {error}
                </div>
            )}

            <div className="grid gap-4">
                <Button
                    variant="outline"
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="h-12 border-border hover:bg-accent rounded-lg w-full flex items-center justify-center gap-3 text-base font-medium"
                >
                    {isLoading ? (
                        <span className="animate-pulse">Connecting...</span>
                    ) : (
                        <>
                            <FcGoogle className="size-5" />
                            Continue with Google
                        </>
                    )}
                </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground max-w-sm mx-auto px-4 leading-relaxed">
                By clicking continue, you agree to our{" "}
                <Link
                    href="/terms"
                    className="text-primary font-medium hover:underline underline-offset-4"
                >
                    Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                    href="/privacy"
                    className="text-primary font-medium hover:underline underline-offset-4"
                >
                    Privacy Policy
                </Link>
                .
            </p>
        </div>
    );
}
