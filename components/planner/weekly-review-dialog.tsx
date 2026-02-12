"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { usePlannerStore } from "@/lib/planner-store";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { CyberButton } from "@/components/ui/cyber-button";
import { motion } from "framer-motion";
import {
    ClipboardCheck,
    ThumbsUp,
    ThumbsDown,
    GraduationCap,
    Sparkles,
} from "lucide-react";

interface WeeklyReviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const textareaClass = cn(
    "w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2.5",
    "text-sm text-foreground placeholder:text-muted-foreground",
    "outline-none transition-colors resize-none",
    "focus:border-cyber-blue/40 focus:ring-1 focus:ring-cyber-blue/20",
    "min-h-24",
);

function ReviewFormContent({
    onOpenChange,
}: {
    onOpenChange: (open: boolean) => void;
}) {
    const weekId = usePlannerStore((s) => s.weekId);
    const saveReview = usePlannerStore((s) => s.saveReview);
    const reviews = usePlannerStore((s) => s.reviews);
    const existingReview = useMemo(() => reviews.find((r) => r.weekId === weekId), [reviews, weekId]);
    const tasks = usePlannerStore((s) => s.tasks);

    const [good, setGood] = useState(existingReview?.good ?? "");
    const [bad, setBad] = useState(existingReview?.bad ?? "");
    const [learned, setLearned] = useState(existingReview?.learned ?? "");
    const [saved, setSaved] = useState(false);

    const completedCount = tasks.filter((t) => t.isCompleted).length;
    const totalCount = tasks.length;
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const handleSave = () => {
        saveReview({ good, bad, learned });
        setSaved(true);
        setTimeout(() => onOpenChange(false), 1200);
    };

    const canSave = good.trim() || bad.trim() || learned.trim();

    if (saved) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-10"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1, duration: 0.5 }}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-cyber-blue/10"
                >
                    <Sparkles className="h-8 w-8 text-cyber-blue" />
                </motion.div>
                <div className="text-center">
                    <p className="text-lg font-bold text-foreground">تم حفظ المراجعة!</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        أحسنت! استمر في التقدم
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-foreground">
                    <ClipboardCheck className="h-5 w-5 text-cyber-blue" />
                    <span>مراجعة الأسبوع</span>
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                    راجع أسبوعك وسجّل ملاحظاتك للتحسين المستمر
                </DialogDescription>
            </DialogHeader>

            {/* Stats summary */}
            <div className="flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                <div className="flex-1">
                    <p className="text-xs text-muted-foreground">المهام المكتملة</p>
                    <p className="text-lg font-bold text-cyber-blue">
                        {completedCount}
                        <span className="text-sm text-muted-foreground">/{totalCount}</span>
                    </p>
                </div>
                <div className="h-10 w-px bg-slate-800" />
                <div className="flex-1">
                    <p className="text-xs text-muted-foreground">نسبة الإنجاز</p>
                    <p className="text-lg font-bold text-cyber-cyan">{percentage}%</p>
                </div>
                <div className="h-10 w-px bg-slate-800" />
                <div className="flex-1">
                    <p className="text-xs text-muted-foreground">الأسبوع</p>
                    <p className="text-sm font-bold text-foreground">{weekId}</p>
                </div>
            </div>

            {/* Form textareas */}
            <div className="space-y-4">
                {/* What went well */}
                <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-cyber-neon">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span>ما الذي سار بشكل جيد؟</span>
                    </label>
                    <textarea
                        value={good}
                        onChange={(e) => setGood(e.target.value)}
                        placeholder="الإنجازات، النجاحات، اللحظات الإيجابية..."
                        className={textareaClass}
                    />
                </div>

                {/* What didn't go well */}
                <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-priority-high">
                        <ThumbsDown className="h-3.5 w-3.5" />
                        <span>ما الذي لم يسر بشكل جيد؟</span>
                    </label>
                    <textarea
                        value={bad}
                        onChange={(e) => setBad(e.target.value)}
                        placeholder="التحديات، العقبات، الأشياء التي يمكن تحسينها..."
                        className={textareaClass}
                    />
                </div>

                {/* Lessons learned */}
                <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-cyber-blue">
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span>الدروس المستفادة</span>
                    </label>
                    <textarea
                        value={learned}
                        onChange={(e) => setLearned(e.target.value)}
                        placeholder="ما تعلمته هذا الأسبوع وما سأطبقه لاحقاً..."
                        className={textareaClass}
                    />
                </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-2">
                <CyberButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onOpenChange(false)}
                >
                    إلغاء
                </CyberButton>
                <CyberButton
                    variant="glow"
                    size="sm"
                    onClick={handleSave}
                    disabled={!canSave}
                    className="gap-1.5"
                >
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    <span>حفظ المراجعة</span>
                </CyberButton>
            </DialogFooter>
        </>
    );
}

export function WeeklyReviewDialog({
    open,
    onOpenChange,
}: WeeklyReviewDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "border-slate-800 bg-slate-950/95 backdrop-blur-xl",
                    "shadow-[0_0_60px_rgba(59,130,246,0.08)]",
                    "sm:max-w-lg max-h-[90vh] overflow-y-auto",
                )}
            >
                <ReviewFormContent onOpenChange={onOpenChange} />
            </DialogContent>
        </Dialog>
    );
}
