"use client";

import type { TargetAndTransition } from "motion/react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import React from "react";

const initialProps: TargetAndTransition = {
    pathLength: 0,
    opacity: 0,
};

const animateProps: TargetAndTransition = {
    pathLength: 1,
    opacity: 1,
};

type Props = React.ComponentProps<typeof motion.svg> & {
    speed?: number;
    onAnimationComplete?: () => void;
};

function AppleHelloVietnameseEffect({
    className,
    speed = 1,
    onAnimationComplete,
    ...props
}: Props) {
    const calc = (x: number) => x * speed;

    return (
        <motion.svg
            className={cn("h-20", className)}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1009 200"
            fill="none"
            stroke="currentColor"
            strokeWidth="14.8883"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            {...props}
        >
            <title>xin chào</title>

            {/* x1 */}
            <motion.path
                d="M102.233 96.2277C75.6823 127.245 45.1612 158.759 11.4143 190.521"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(0.3),
                    ease: "easeInOut",
                    opacity: { duration: 0.15 },
                }}
            />

            {/* x2 */}
            <motion.path
                d="M7.69214 116.575C9.67725 105.16 16.8733 95.7311 28.5358 95.7311C40.4465 95.7311 46.8981 105.408 53.3497 124.019C56.7409 133.283 60.1322 142.547 63.5234 151.81C73.689 179.58 81.1988 191.513 100.855 191.513C128.722 191.513 154.043 159.148 161.595 118.502C162.929 111.321 164.774 103.736 166.043 96.2273"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(0.7),
                    ease: "easeInOut",
                    delay: calc(0.4),
                    opacity: { duration: 0.35, delay: calc(0.4) },
                }}
            />

            {/* i */}
            <motion.path
                d="M166.043 96.2273C163.191 113.101 160.565 126.997 158.92 139.404C157.989 147.592 157.544 154.54 157.596 161.488C157.729 179.354 164.764 191.513 182.695 191.513C209.39 191.513 236.181 159.123 243.73 118.5C245.064 111.321 247.012 103.759 248.139 96.2273"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(0.5),
                    ease: "easeOut",
                    delay: calc(1),
                    opacity: { duration: 0.25, delay: calc(1) },
                }}
            />

            {/* n1 */}
            <motion.path
                d="M248.139 96.2278C243.424 127.741 239.454 158.759 234.491 190.272"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(0.3),
                    ease: "easeOut",
                    delay: calc(1.5),
                    opacity: { duration: 0.15, delay: calc(1.5) },
                }}
            />

            {/* n2 */}
            <motion.path
                d="M237.873 167.951C244.704 121.32 265.508 94.2422 290.322 94.2422C307.692 94.2422 316.625 106.153 315.136 123.026C313.896 135.681 309.677 150.322 308.685 162.729C307.444 179.85 316.499 191.513 330.769 191.513C348.722 191.513 359.309 179.314 364.143 165.965"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(0.9),
                    ease: "easeOut",
                    delay: calc(1.8),
                    opacity: { duration: 0.45, delay: calc(1.8) },
                }}
            />

            {/* c, h1 */}
            <motion.path
                d="M535.91 109.876C531.265 100.446 520.943 93.4984 505.459 93.4984C476.516 93.4984 462.044 117.816 462.044 143.374C462.044 171.503 482.265 192.506 511.307 192.506C559.762 192.506 592.902 136.708 621.581 97.8807C640.764 71.9101 649.874 49.2359 650.372 31.1674C650.62 17.7684 644.168 7.60362 632.01 7.60362C618.61 7.60362 610.173 17.7684 604.963 41.1011C599.255 66.7441 595.037 96.1684 584.367 190.521"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(1.1),
                    ease: "easeInOut",
                    delay: calc(2.6),
                    opacity: { duration: 0.55, delay: calc(2.6) },
                }}
            />

            {/* h2 */}
            <motion.path
                d="M585.413 181.299C590.677 135.025 611.663 98.2125 638.213 98.2125C654.094 98.2125 664.187 110.868 661.321 128.982C659.708 139.652 656.794 152.059 655.128 164.217C653.102 179.602 658.89 191.513 676.813 191.513C702.178 191.513 717.375 164.077 725.613 135.196"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(1),
                    ease: "easeInOut",
                    delay: calc(3.6),
                    opacity: { duration: 0.5, delay: calc(3.6) },
                }}
            />

            {/* a1 */}
            <motion.path
                d="M803.871 112.995C799.007 101.8 788.666 94.2423 772.207 94.2423C744.912 94.2423 724.398 121.538 723.052 150.818C721.878 177.617 734.244 192.681 751.857 192.505C776.858 192.255 795.234 167.699 803.437 115.742C804.449 109.332 805.498 102.638 806.51 96.2274"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(0.8),
                    ease: "easeOut",
                    delay: calc(4.6),
                    opacity: { duration: 0.4, delay: calc(4.6) },
                }}
            />

            {/* a2, o */}
            <motion.path
                d="M806.51 96.2274C805.486 102.73 804.461 109.232 803.436 115.735C798.955 144.175 796.887 155.395 797.109 162.729C797.628 179.85 803.785 191.513 820.064 191.513C842.563 191.513 860.966 164.721 870.266 138.289C879.653 111.612 891.315 94.9867 915.633 94.9867C935.732 94.9867 951.613 109.875 951.613 137.915C951.613 168.932 931.489 192.257 906.059 192.505C883.681 192.753 868.983 174.639 870.471 147.344C872.208 117.071 890.571 94.9867 914.64 94.9867C928.536 94.9867 940.207 101.164 949.38 107.89C974.247 126.031 993.407 114.82 1000.74 96.8832"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(1.5),
                    ease: "easeOut",
                    delay: calc(5.4),
                    opacity: { duration: 0.75, delay: calc(5.4) },
                }}
            />

            {/* sign */}
            <motion.path
                className="stroke-yellow-400"
                d="M763.027 19.3039C768.734 34.6886 780.397 48.3362 792.059 55.5322"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(0.8),
                    ease: "easeInOut",
                    delay: calc(7),
                    opacity: { duration: 0.4, delay: calc(7) },
                }}
                onAnimationComplete={onAnimationComplete}
            />
        </motion.svg>
    );
}

function AppleHelloEnglishEffect({
    className,
    speed = 1,
    onAnimationComplete,
    ...props
}: Props) {
    const calc = (x: number) => x * speed;

    return (
        <motion.svg
            className={cn("h-20", className)}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 638 200"
            fill="none"
            stroke="currentColor"
            strokeWidth="14.8883"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            {...props}
        >
            <title>hello</title>

            {/* h1 */}
            <motion.path
                d="M8.69214 166.553C36.2393 151.239 61.3409 131.548 89.8191 98.0295C109.203 75.1488 119.625 49.0228 120.122 31.0026C120.37 17.6036 113.836 7.43883 101.759 7.43883C88.3598 7.43883 79.9231 17.6036 74.7122 40.9363C69.005 66.5793 64.7866 96.0036 54.1166 190.356"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(0.8),
                    ease: "easeInOut",
                    opacity: { duration: 0.4 },
                }}
            />

            {/* h2, ello */}
            <motion.path
                d="M55.1624 181.135C60.6251 133.114 81.4118 98.0479 107.963 98.0479C123.844 98.0479 133.937 110.703 131.071 128.817C129.457 139.487 127.587 150.405 125.408 163.06C122.869 178.941 130.128 191.348 152.122 191.348C184.197 191.348 219.189 173.523 237.097 145.915C243.198 136.509 245.68 128.073 245.928 119.884C246.176 104.996 237.739 93.8296 222.851 93.8296C203.992 93.8296 189.6 115.17 189.6 142.465C189.6 171.745 205.481 192.341 239.208 192.341C285.066 192.341 335.86 137.292 359.199 75.8585C365.788 58.513 368.26 42.4065 368.26 31.1512C368.26 17.8057 364.042 7.55823 352.131 7.55823C340.469 7.55823 332.777 16.6141 325.829 30.9129C317.688 47.4967 311.667 71.4162 309.203 98.4549C303 166.301 316.896 191.348 349.936 191.348C390 191.348 434.542 135.534 457.286 75.6686C463.803 58.513 466.275 42.4065 466.275 31.1512C466.275 17.8057 462.057 7.55823 450.146 7.55823C438.484 7.55823 430.792 16.6141 423.844 30.9129C415.703 47.4967 409.682 71.4162 407.218 98.4549C401.015 166.301 414.911 191.348 444.416 191.348C473.874 191.348 489.877 165.67 499.471 138.402C508.955 111.447 520.618 94.8221 544.935 94.8221C565.035 94.8221 580.916 109.71 580.916 137.75C580.916 168.768 560.792 192.093 535.362 192.341C512.984 192.589 498.285 174.475 499.774 147.179C501.511 116.907 519.873 94.8221 543.943 94.8221C557.839 94.8221 569.51 100.999 578.682 107.725C603.549 125.866 622.709 114.656 630.047 96.7186"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(2.8),
                    ease: "easeInOut",
                    delay: calc(0.7),
                    opacity: { duration: 0.7, delay: calc(0.7) },
                }}
                onAnimationComplete={onAnimationComplete}
            />
        </motion.svg>
    );
}

function CuraSyncEffect({
    className,
    speed = 1,
    onAnimationComplete,
    ...props
}: Props) {
    const calc = (x: number) => x * speed;

    return (
        <motion.svg
            className={cn("h-20", className)}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 920 280"
            fill="none"
            stroke="currentColor"
            strokeWidth="14.8883"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            {...props}
        >
            <title>CuraSync</title>

            {/* C */}
            <motion.path
                d="M98.5 115.2C94.2 103.8 83.5 95.5 67.3 95.5C37.8 95.5 22.5 121.4 22.5 148.6C22.5 178.2 43.6 192.8 73.5 192.8C98.2 192.8 118.4 177.5 128.6 158.2"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(0.25),
                    ease: "easeInOut",
                    opacity: { duration: 0.1 },
                }}
            />

            {/* u */}
            <motion.path
                d="M138.2 96.5C134.8 118.2 131.5 139.8 128.2 161.5C127.1 168.4 126.8 174.2 126.9 179.8C127.2 188.5 132.5 192.8 142.8 192.8C158.5 192.8 173.2 181.5 184.5 166.2C195.8 150.9 204.8 132.5 209.5 115.8"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(0.25),
                    ease: "easeOut",
                    delay: calc(0.15),
                    opacity: { duration: 0.1, delay: calc(0.15) },
                }}
            />

            {/* r */}
            <motion.path
                d="M209.5 96.5C206.2 118.5 203.8 135.8 201.5 158.2C200.4 167.5 199.8 175.2 199.9 182.5C200.1 189.8 203.2 192.8 209.8 192.8"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(0.2),
                    ease: "easeOut",
                    delay: calc(0.3),
                    opacity: { duration: 0.1, delay: calc(0.3) },
                }}
            />
            <motion.path
                d="M202.5 125.8C208.5 112.5 220.8 95.5 239.2 95.5C252.5 95.5 261.8 103.2 266.2 115.5"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(0.2),
                    ease: "easeOut",
                    delay: calc(0.4),
                    opacity: { duration: 0.1, delay: calc(0.4) },
                }}
            />

            {/* a */}
            <motion.path
                d="M333.8 114.5C329.2 102.8 318.5 95.5 302.8 95.5C274.5 95.5 253.2 123.8 251.8 153.2C250.6 179.5 262.5 192.8 279.5 192.8C303.8 192.8 321.5 169.2 329.5 118.2C330.5 111.8 331.5 105.2 332.5 98.5"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(0.25),
                    ease: "easeOut",
                    delay: calc(0.5),
                    opacity: { duration: 0.1, delay: calc(0.5) },
                }}
            />
            <motion.path
                d="M332.5 98.5C331.5 105.2 330.5 111.8 329.5 118.2C325.2 145.8 323.2 156.5 323.4 163.5C323.9 179.8 329.8 192.8 345.5 192.8C367.2 192.8 384.8 167.2 393.8 141.5"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(0.25),
                    ease: "easeOut",
                    delay: calc(0.65),
                    opacity: { duration: 0.1, delay: calc(0.65) },
                }}
            />

            {/* S */}
            <motion.path
                d="M485.2 118.5C478.5 102.8 463.2 95.5 445.8 95.5C423.5 95.5 408.5 109.2 408.5 126.8C408.5 141.2 418.2 151.5 435.8 157.2C449.5 161.5 458.2 165.8 458.2 175.2C458.2 184.5 450.5 192.8 437.5 192.8C424.2 192.8 414.8 185.2 409.5 172.5"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(0.3),
                    ease: "easeInOut",
                    delay: calc(0.8),
                    opacity: { duration: 0.12, delay: calc(0.8) },
                }}
            />

            {/* y1 */}
            <motion.path
                d="M495.8 96.5C492.5 118.2 489.2 139.8 485.9 161.5C484.8 168.4 484.5 174.2 484.6 179.8C484.9 188.5 490.2 192.8 500.5 192.8C516.2 192.8 530.9 181.5 542.2 166.2C553.5 150.9 562.5 132.5 567.2 115.8"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(0.25),
                    ease: "easeOut",
                    delay: calc(1),
                    opacity: { duration: 0.1, delay: calc(1) },
                }}
            />

            {/* y2 */}
            <motion.path
                d="M567.2 96.5C563.2 122.5 559.5 148.2 555.8 173.8C554.2 185.2 550.5 203.5 542.8 223.2C537.2 237.5 529.8 248.5 519.5 248.5C512.2 248.5 507.8 243.2 507.8 235.8C507.8 228.2 511.5 218.5 517.2 207.5"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(0.3),
                    ease: "easeInOut",
                    delay: calc(1.15),
                    opacity: { duration: 0.12, delay: calc(1.15) },
                }}
            />

            {/* n1 */}
            <motion.path
                d="M577.5 96.5C574.2 118.5 571.8 135.8 569.5 158.2C568.4 167.5 567.8 175.2 567.9 182.5C568.1 189.8 571.2 192.8 577.8 192.8"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(0.2),
                    ease: "easeOut",
                    delay: calc(1.35),
                    opacity: { duration: 0.1, delay: calc(1.35) },
                }}
            />

            {/* n2 */}
            <motion.path
                d="M570.5 168.5C577.2 122.8 597.5 95.5 621.8 95.5C638.5 95.5 647.2 107.2 645.8 123.8C644.5 136.2 640.5 150.5 639.5 162.5C638.2 179.2 647.2 192.8 661.2 192.8C678.8 192.8 689.2 181.2 693.8 168.2"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(0.25),
                    ease: "easeOut",
                    delay: calc(1.45),
                    opacity: { duration: 0.1, delay: calc(1.45) },
                }}
            />

            {/* c */}
            <motion.path
                d="M785.2 115.2C780.9 103.8 770.2 95.5 754.0 95.5C724.5 95.5 709.2 121.4 709.2 148.6C709.2 178.2 730.3 192.8 760.2 192.8C784.9 192.8 805.1 177.5 815.3 158.2"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(0.25),
                    ease: "easeInOut",
                    delay: calc(1.6),
                    opacity: { duration: 0.1, delay: calc(1.6) },
                }}
            />

            {/* accent mark */}
            <motion.path
                className="stroke-cyan-400"
                d="M425.2 22.5C430.8 37.5 442.2 50.8 453.5 57.8"
                style={{ strokeLinecap: "round" }}
                initial={initialProps}
                animate={animateProps}
                transition={{
                    duration: calc(0.2),
                    ease: "easeInOut",
                    delay: calc(1.75),
                    opacity: { duration: 0.1, delay: calc(1.75) },
                }}
                onAnimationComplete={onAnimationComplete}
            />
        </motion.svg>
    );
}

// Demo component
export default function Demo() {
    const [key, setKey] = React.useState(0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
            <div className="max-w-4xl w-full space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Animated Text Effects
                    </h1>
                    <p className="text-slate-300">
                        Beautiful handwritten-style animations
                    </p>
                </div>

                <div className="space-y-16">
                    {/* CuraSync */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <div className="flex items-center justify-center">
                            <CuraSyncEffect
                                key={`curasync-${key}`}
                                className="h-24 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                                speed={1}
                            />
                        </div>
                    </div>

                    {/* Vietnamese */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <div className="flex items-center justify-center">
                            <AppleHelloVietnameseEffect
                                key={`vietnamese-${key}`}
                                className="h-20 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]"
                                speed={1}
                            />
                        </div>
                    </div>

                    {/* English */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                        <div className="flex items-center justify-center">
                            <AppleHelloEnglishEffect
                                key={`english-${key}`}
                                className="h-20 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]"
                                speed={1}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={() => setKey((k) => k + 1)}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105"
                    >
                        Replay Animations
                    </button>
                </div>
            </div>
        </div>
    );
}

export { AppleHelloEnglishEffect, AppleHelloVietnameseEffect, CuraSyncEffect };
