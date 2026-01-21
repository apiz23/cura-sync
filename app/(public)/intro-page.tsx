"use client";

import { CuraSyncEffect } from "@/components/ncdai/apple-hello-effect";

export default function IntroPage() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background px-4">
            <CuraSyncEffect
                className="
          h-28
          sm:h-36
          md:h-44
          lg:h-52
          scale-75
          sm:scale-90
          md:scale-100
          text-white
        "
                speed={5}
                onAnimationComplete={() => {
                    console.log("Animation done!");
                }}
            />
        </div>
    );
}
