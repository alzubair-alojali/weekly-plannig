"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// ── Shimmer pulse animation ──
function Shimmer({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-slate-800/60",
                className,
            )}
        />
    );
}

// ── Single Day Column Skeleton ──
function DayColumnSkeleton() {
    return (
        <div className="flex flex-col rounded-xl border border-slate-800/40 bg-slate-900/20 min-h-[30vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800/40">
                <div className="flex items-center gap-2">
                    <Shimmer className="h-4 w-12" />
                </div>
                <Shimmer className="h-3.5 w-16" />
            </div>

            {/* Fake tasks */}
            <div className="flex-1 space-y-2 p-2">
                <Shimmer className="h-14 w-full rounded-lg" />
                <Shimmer className="h-11 w-full rounded-lg" />
                <Shimmer className="h-14 w-3/4 rounded-lg" />
            </div>

            {/* Add task area */}
            <div className="border-t border-slate-800/40 p-2">
                <Shimmer className="h-9 w-full rounded-lg" />
            </div>
        </div>
    );
}

// ── Full Planner Grid Skeleton ──
const stagger = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.06 },
    },
};

const fadeIn = {
    hidden: { opacity: 0, scale: 0.97 },
    show: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3, ease: "easeOut" as const },
    },
};

export function PlannerGridSkeleton() {
    return (
        <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
            {Array.from({ length: 7 }).map((_, i) => (
                <motion.div key={i} variants={fadeIn}>
                    <DayColumnSkeleton />
                </motion.div>
            ))}
        </motion.div>
    );
}

// ── Brain Dump Skeleton ──
export function BrainDumpSkeleton() {
    return (
        <div className="rounded-xl border border-slate-800/40 bg-slate-900/20 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/40">
                <div className="flex items-center gap-2.5">
                    <Shimmer className="h-7 w-7 rounded-lg" />
                    <Shimmer className="h-4 w-20" />
                </div>
                <Shimmer className="h-4 w-4" />
            </div>
            {/* Items */}
            <div className="space-y-2 p-3">
                <Shimmer className="h-10 w-full rounded-lg" />
                <Shimmer className="h-10 w-4/5 rounded-lg" />
            </div>
        </div>
    );
}

// ── Weekly Challenge Skeleton ──
export function ChallengeSkeleton() {
    return <Shimmer className="h-10 w-full rounded-xl" />;
}
