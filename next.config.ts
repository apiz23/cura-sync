import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    devIndicators: false,
    turbopack: {
        root: __dirname,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "img.clerk.com",
            },
            {
                protocol: "https",
                hostname: "images.clerk.dev",
            },
            {
                protocol: "https",
                hostname: "i.pinimg.com",
            },
        ],
    },

    async headers() {
        const allowedOrigin =
            process.env.NEXT_PUBLIC_APP_URL ??
            process.env.NEXT_PUBLIC_SITE_URL ??
            "https://cura-sync-app.vercel.app";
        return [
            {
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: allowedOrigin },
                    { key: "Vary", value: "Origin" },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET,DELETE,PATCH,POST,PUT,OPTIONS",
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
