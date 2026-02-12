"use client";

import { useMemo } from "react";
import { usePlannerStore } from "@/lib/planner-store";
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
    weekId: string;
    challenge: string;
    taskCount: number;
    completedCount: number;
    hasReview: boolean;
}

function WeekCard({ week }: { week: WeekCardData }) {
    const percentage =
        week.taskCount > 0
            ? Math.round((week.completedCount / week.taskCount) * 100)
            : 0;

    // Parse weekId to display label (e.g., "2026-W07" → "الأسبوع 07 — 2026")
    const match = week.weekId.match(/(\d{4})-W(\d{2})/);
    const label = match
        ? `الأسبوع ${match[2]} — ${match[1]}`
        : week.weekId;

    return (
        <motion.div variants={fadeUp}>
            <Link href={`/planner?week=${week.weekId}`}>
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
                                    {week.taskCount} مهام
                                </p>
                            </div>
                        </div>

                        {/* Review badge */}
                        {week.hasReview && (
                            <div className="flex items-center gap-1 rounded-full bg-cyber-neon/10 px-2 py-0.5">
                                <ClipboardCheck className="h-3 w-3 text-cyber-neon" />
                                <span className="text-[10px] font-semibold text-cyber-neon">
                                    تمت المراجعة
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Challenge */}
                    {week.challenge && (
                        <div className="flex items-center gap-2 rounded-lg bg-amber-500/5 border border-amber-500/10 px-3 py-1.5">
                            <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            <span className="text-[11px] font-medium text-amber-400/80 truncate">
                                {week.challenge}
                            </span>
                        </div>
                    )}

                    {/* Progress bar */}
                    {week.taskCount > 0 && (
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
                    )}

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
    const tasks = usePlannerStore((s) => s.tasks);
    const reviews = usePlannerStore((s) => s.reviews);
    const weekMetas = usePlannerStore((s) => s.weekMetas);

    const visitedWeeks = useMemo(() => {
        const weekIds = new Set<string>();
        tasks.forEach((t) => { if (t.weekId) weekIds.add(t.weekId); });
        reviews.forEach((r) => weekIds.add(r.weekId));
        weekMetas.forEach((m) => weekIds.add(m.weekId));

        return Array.from(weekIds)
            .sort((a, b) => b.localeCompare(a))
            .map((wid) => {
                const weekTasks = tasks.filter((t) => t.weekId === wid);
                return {
                    weekId: wid,
                    challenge: weekMetas.find((m) => m.weekId === wid)?.weeklyChallenge ?? "",
                    taskCount: weekTasks.length,
                    completedCount: weekTasks.filter((t) => t.isCompleted).length,
                    hasReview: reviews.some((r) => r.weekId === wid),
                };
            });
    }, [tasks, reviews, weekMetas]);

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
                            جميع أسابيعك المخططة
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Weeks Grid */}
            {visitedWeeks.length === 0 ? (
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
                    {visitedWeeks.map((week) => (
                        <WeekCard key={week.weekId} week={week} />
                    ))}
                </div>
            )}
        </motion.div>
    );
}
