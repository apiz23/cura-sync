import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    devIndicators: false,

    // If you were using Turbopack and needed to fix the root warning from before,
    // you would add the path import and the turbopack setting here:
    /*
    // import path from 'path'; // Need to install @types/node if not present
    // turbopack: {
    //     root: path.join(__dirname, './'), 
    // },
    */
};

export default nextConfig;
