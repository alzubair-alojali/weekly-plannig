"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, Trophy, Target, ArrowRight } from "lucide-react";
import { usePlannerStore } from "@/lib/planner-store";

interface WeeklyReviewCardProps {
    onClick: () => void;
}

export function WeeklyReviewCard({ onClick }: WeeklyReviewCardProps) {
    const weekId = usePlannerStore((s) => s.weekId);
    const review = usePlannerStore((s) => s.getReviewForWeek(weekId));

    const isReviewed = !!review;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-full min-h-125 w-full flex-col"
        >
            {/* Header */}
            <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="flex items-center gap-2 font-bold text-cyber-blue">
                    <Sparkles className="h-4 w-4" />
                    <span>المراجعة الأسبوعية</span>
                </h3>
            </div>

            {/* Card Content */}
            <div
                onClick={onClick}
                className={cn(
                    "group relative flex-1 cursor-pointer overflow-hidden rounded-xl border p-6 transition-all duration-300",
                    "hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:border-cyber-blue/40",
                    isReviewed
                        ? "border-cyber-blue/20 bg-slate-900/40"
                        : "border-slate-800 bg-slate-900/20 border-dashed"
                )}
            >
                <div className="flex h-full flex-col justify-between">
                    <div className="space-y-6">
                        <div className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300",
                            isReviewed
                                ? "bg-cyber-blue/10 text-cyber-blue"
                                : "bg-slate-800 text-slate-500 group-hover:scale-110 group-hover:bg-cyber-blue/10 group-hover:text-cyber-blue"
                        )}>
                            <Trophy className="h-6 w-6" />
                        </div>

                        <div className="space-y-2">
                            <h4 className={cn(
                                "text-lg font-bold transition-colors",
                                isReviewed ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                            )}>
                                {isReviewed ? "تمت المراجعة!" : "مراجعة الأسبوع"}
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {isReviewed
                                    ? "عظيم! لقد قمت بتقييم أداءك لهذا الأسبوع. اضغط للتعديل أو المراجعة."
                                    : "خذ لحظة للتأمل في أسبوعك. ما الذي سار بشكل جيد؟ وما الذي يمكن تحسينه؟"}
                            </p>
                        </div>

                        {isReviewed && (
                            <div className="space-y-4 pt-2">
                                {/* Good */}
                                {review.good && (
                                    <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                                        <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-green-400">
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                                            <span>أشياء جيدة</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {review.good}
                                        </p>
                                    </div>
                                )}

                                {/* Bad */}
                                {review.bad && (
                                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                                        <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-red-400">
                                            <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                                            <span>تحديات</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {review.bad}
                                        </p>
                                    </div>
                                )}

                                {/* Learned */}
                                {review.learned && (
                                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                                        <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-amber-400">
                                            <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                            <span>تعلمت</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {review.learned}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-sm font-medium text-cyber-blue opacity-0 transition-all duration-300 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0">
                        <span>{isReviewed ? "تعديل المراجعة" : "ابدأ المراجعة"}</span>
                        <ArrowRight className="h-4 w-4" />
                    </div>
                </div>

                {/* Background Decoration */}
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyber-blue/5 blur-[80px]" />
                <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-purple-500/5 blur-[80px]" />
            </div>
        </motion.div>
    );
}
