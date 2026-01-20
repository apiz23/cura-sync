"use client";

import { CuraSyncEffect } from "@/components/ncdai/apple-hello-effect";

export default function IntroPage() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background">
            <CuraSyncEffect
                className="h-52 text-white"
                speed={5}
                onAnimationComplete={() => {
                    console.log("Animation done!");
                }}
            />
        </div>
    );
}
