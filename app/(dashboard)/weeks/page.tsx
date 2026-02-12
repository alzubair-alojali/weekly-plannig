"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Archive,
    CalendarDays,
    CheckCircle2,
    Trophy,
    ClipboardCheck,
    ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchAllWeeks } from "@/lib/supabase-weeks";
import { fetchTaskCountsByWeek } from "@/lib/supabase-tasks";
import { waitForAuth } from "@/lib/supabase";
import type { WeekRow } from "@/types";

const stagger = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.06 },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.35, ease: "easeOut" as const },
    },
};

interface WeekCardData {
    weekRow: WeekRow;
    taskCount: number;
    completedCount: number;
}

// ── Skeleton Card ──
function WeekCardSkeleton() {
    return (
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 space-y-3">
            {/* Header skeleton */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-slate-800 animate-pulse" />
                    <div className="space-y-1.5">
                        <div className="h-4 w-32 rounded bg-slate-800 animate-pulse" />
                        <div className="h-3 w-44 rounded bg-slate-800/60 animate-pulse" />
                    </div>
                </div>
                <div className="h-5 w-20 rounded-full bg-slate-800/40 animate-pulse" />
            </div>
            {/* Challenge skeleton */}
            <div className="h-8 w-full rounded-lg bg-slate-800/30 animate-pulse" />
            {/* Progress bar skeleton */}
            <div className="space-y-1.5">
                <div className="flex justify-between">
                    <div className="h-3 w-12 rounded bg-slate-800/50 animate-pulse" />
                    <div className="h-3 w-20 rounded bg-slate-800/50 animate-pulse" />
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 animate-pulse" />
            </div>
        </div>
    );
}

function WeeksGridSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-slate-800 animate-pulse" />
                <div className="space-y-1.5">
                    <div className="h-6 w-28 rounded bg-slate-800 animate-pulse" />
                    <div className="h-4 w-40 rounded bg-slate-800/60 animate-pulse" />
                </div>
            </div>
            {/* Cards skeleton grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <WeekCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

function WeekCard({ week }: { week: WeekCardData }) {
    const percentage =
        week.taskCount > 0
            ? Math.round((week.completedCount / week.taskCount) * 100)
            : 0;

    const label = `الأسبوع ${week.weekRow.week_number} — ${week.weekRow.year}`;
    const dateRange = `${week.weekRow.start_date} → ${week.weekRow.end_date}`;
    const hasReview = !!(week.weekRow.review_good || week.weekRow.review_bad || week.weekRow.review_learned);

    return (
        <motion.div variants={fadeUp}>
            <Link href="/planner">
                <GlassCard interactive className="space-y-3 cursor-pointer">
                    {/* Header row */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyber-blue/10">
                                <CalendarDays className="h-4.5 w-4.5 text-cyber-blue" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">{label}</p>
                                <p className="text-[11px] text-muted-foreground">
                                    {dateRange}
                                </p>
                            </div>
                        </div>

                        {/* Review badge */}
                        {hasReview && (
                            <div className="flex items-center gap-1 rounded-full bg-cyber-neon/10 px-2 py-0.5">
                                <ClipboardCheck className="h-3 w-3 text-cyber-neon" />
                                <span className="text-[10px] font-semibold text-cyber-neon">
                                    تمت المراجعة
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Challenge */}
                    {week.weekRow.weekly_challenge && (
                        <div className="flex items-center gap-2 rounded-lg bg-amber-500/5 border border-amber-500/10 px-3 py-1.5">
                            <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            <span className="text-[11px] font-medium text-amber-400/80 truncate">
                                {week.weekRow.weekly_challenge}
                            </span>
                        </div>
                    )}

                    {/* Progress bar */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">الإنجاز</span>
                            <span className="font-semibold text-cyber-blue">
                                {week.completedCount}/{week.taskCount} ({percentage}%)
                            </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                                className={cn(
                                    "h-full rounded-full",
                                    percentage === 100
                                        ? "bg-cyber-neon"
                                        : "bg-linear-to-l from-cyber-blue to-cyber-cyan",
                                )}
                            />
                        </div>
                    </div>

                    {/* Completed indicator */}
                    {percentage === 100 && week.taskCount > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-cyber-neon">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span className="font-medium">أسبوع مكتمل!</span>
                        </div>
                    )}
                </GlassCard>
            </Link>
        </motion.div>
    );
}

export default function WeeksPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [weeks, setWeeks] = useState<WeekCardData[]>([]);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const userId = await waitForAuth();
            if (cancelled) return;
            if (!userId) {
                setIsLoading(false);
                return;
            }

            const [allWeeks, taskCounts] = await Promise.all([
                fetchAllWeeks(),
                fetchTaskCountsByWeek(),
            ]);

            if (cancelled) return;

            // Filter: only keep weeks that have at least 1 task,
            // a weekly challenge, or a review filled in.
            const weekCards: WeekCardData[] = allWeeks
                .map((w) => {
                    const counts = taskCounts.get(w.id) ?? { total: 0, completed: 0 };
                    return {
                        weekRow: w,
                        taskCount: counts.total,
                        completedCount: counts.completed,
                    };
                })
                .filter((w) => {
                    const hasWork = w.taskCount > 0;
                    const hasChallenge = !!w.weekRow.weekly_challenge;
                    const hasReview = !!(
                        w.weekRow.review_good ||
                        w.weekRow.review_bad ||
                        w.weekRow.review_learned
                    );
                    return hasWork || hasChallenge || hasReview;
                });

            setWeeks(weekCards);
            setIsLoading(false);
        }

        load();
        return () => { cancelled = true; };
    }, []);

    // ── Skeleton loading state ──
    if (isLoading) {
        return <WeeksGridSkeleton />;
    }

    return (
        <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            {/* Page Header */}
            <motion.div variants={fadeUp} className="space-y-1">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyber-blue/10">
                        <Archive className="h-5 w-5 text-cyber-blue" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">الأسابيع</h2>
                        <p className="text-sm text-muted-foreground">
                            الأسابيع التي عملت عليها ({weeks.length} أسبوع)
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Weeks Grid */}
            {weeks.length === 0 ? (
                <motion.div variants={fadeUp}>
                    <GlassCard className="flex flex-col items-center gap-4 py-14">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/50">
                            <CalendarDays className="h-7 w-7 text-slate-600" />
                        </div>
                        <div className="text-center">
                            <p className="text-base font-semibold text-foreground">
                                لا توجد أسابيع بعد
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                ابدأ بإضافة مهام في المخطط لتظهر أسابيعك هنا
                            </p>
                        </div>
                        <Link
                            href="/planner"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-transparent px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-slate-800/50 hover:border-slate-600"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            الذهاب للمخطط
                        </Link>
                    </GlassCard>
                </motion.div>
            ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {weeks.map((week) => (
                        <WeekCard key={week.weekRow.id} week={week} />
                    ))}
                </div>
            )}
        </motion.div>
    );
}
