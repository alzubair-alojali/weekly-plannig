"use client";

import { usePlannerStore } from "@/lib/planner-store";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    Archive,
    ClipboardCheck,
    ThumbsUp,
    ThumbsDown,
    GraduationCap,
    CalendarDays,
    ChevronDown,
    ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import type { WeeklyReview } from "@/types";

const stagger = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.06 },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

function ReviewCard({ review }: { review: WeeklyReview }) {
    const [expanded, setExpanded] = useState(false);
    const date = new Date(review.completedAt);
    const formattedDate = date.toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <motion.div variants={fadeUp}>
            <GlassCard className="overflow-hidden p-0">
                {/* Header — clickable */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className={cn(
                        "flex w-full items-center justify-between px-4 py-3.5 cursor-pointer",
                        "transition-colors hover:bg-slate-800/30",
                        expanded && "border-b border-slate-800/60",
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyber-blue/10">
                            <ClipboardCheck className="h-4.5 w-4.5 text-cyber-blue" />
                        </div>
                        <div className="text-start">
                            <p className="text-sm font-bold text-foreground">{review.weekId}</p>
                            <p className="text-[11px] text-muted-foreground">{formattedDate}</p>
                        </div>
                    </div>
                    <motion.div
                        animate={{ rotate: expanded ? 0 : -90 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                </button>

                {/* Expandable content */}
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                        className="space-y-3 p-4"
                    >
                        {review.good && (
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-cyber-neon">
                                    <ThumbsUp className="h-3 w-3" />
                                    <span>ما سار بشكل جيد</span>
                                </div>
                                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                    {review.good}
                                </p>
                            </div>
                        )}

                        {review.bad && (
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-priority-high">
                                    <ThumbsDown className="h-3 w-3" />
                                    <span>ما لم يسر بشكل جيد</span>
                                </div>
                                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                    {review.bad}
                                </p>
                            </div>
                        )}

                        {review.learned && (
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-cyber-blue">
                                    <GraduationCap className="h-3 w-3" />
                                    <span>الدروس المستفادة</span>
                                </div>
                                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                    {review.learned}
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </GlassCard>
        </motion.div>
    );
}

export default function ArchivePage() {
    const reviews = usePlannerStore((s) => s.reviews);

    // Sort newest first
    const sortedReviews = useMemo(
        () => [...reviews].sort(
            (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime(),
        ),
        [reviews],
    );

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
                        <h2 className="text-2xl font-bold text-foreground">الأرشيف</h2>
                        <p className="text-sm text-muted-foreground">
                            مراجعاتك الأسبوعية السابقة
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Reviews list */}
            {sortedReviews.length === 0 ? (
                <motion.div variants={fadeUp}>
                    <GlassCard className="flex flex-col items-center gap-4 py-14">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800/50">
                            <CalendarDays className="h-7 w-7 text-slate-600" />
                        </div>
                        <div className="text-center">
                            <p className="text-base font-semibold text-foreground">
                                لا توجد مراجعات بعد
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                أكمل مراجعة أسبوعية من صفحة المخطط لتظهر هنا
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
                <div className="space-y-3">
                    {sortedReviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                    ))}
                </div>
            )}
        </motion.div>
    );
}
