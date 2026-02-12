"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { usePlannerStore } from "@/lib/planner-store";
import { getWeekDays } from "@/lib/week-utils";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CyberButton } from "@/components/ui/cyber-button";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Lightbulb, Sparkles, Clock } from "lucide-react";
import type { Priority, DayOfWeek } from "@/types";
import { dayLabels } from "@/lib/week-utils";
import { AnimatePresence, motion } from "framer-motion";

const priorities: Priority[] = ["high", "medium", "low"];

interface QuickAddModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function QuickAddModal({ open, onOpenChange }: QuickAddModalProps) {
    const addTask = usePlannerStore((s) => s.addTask);
    const currentDate = usePlannerStore((s) => s.currentDate);

    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState<Priority>("medium");
    const [targetDate, setTargetDate] = useState<string | null>(null); // null = brain dump
    const [isMeeting, setIsMeeting] = useState(false);
    const [startTime, setStartTime] = useState("");

    const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

    const handleSubmit = () => {
        if (!title.trim()) return;
        addTask({
            title: title.trim(),
            date: targetDate,
            priority: isMeeting ? "meeting" : priority,
            isBrainDump: targetDate === null,
            startTime: isMeeting && startTime ? startTime + ":00" : null,
        });
        // Reset
        setTitle("");
        setPriority("medium");
        setTargetDate(null);
        setIsMeeting(false);
        setStartTime("");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "border-slate-800 bg-slate-950/95 backdrop-blur-xl",
                    "shadow-[0_0_60px_rgba(59,130,246,0.08)]",
                    "sm:max-w-sm",
                )}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-foreground">
                        <Sparkles className="h-4 w-4 text-cyber-blue" />
                        <span>إضافة سريعة</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Title */}
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                        placeholder="عنوان المهمة..."
                        className={cn(
                            "w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2.5",
                            "text-sm text-foreground placeholder:text-muted-foreground",
                            "outline-none transition-colors",
                            "focus:border-cyber-blue/40 focus:ring-1 focus:ring-cyber-blue/20",
                        )}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSubmit();
                        }}
                    />

                    {/* Priority */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground">
                            الأولوية
                        </label>
                        {!isMeeting && (
                            <div className="flex gap-2">
                                {priorities.map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={cn(
                                            "rounded-lg border px-3 py-1.5 transition-all duration-200 cursor-pointer",
                                            priority === p
                                                ? "border-cyber-blue/30 bg-cyber-blue/10 scale-105"
                                                : "border-slate-800 bg-slate-900/40 hover:border-slate-700",
                                        )}
                                    >
                                        <PriorityBadge
                                            priority={p}
                                            className="border-0 bg-transparent px-0 py-0"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                        {isMeeting && (
                            <div className="flex gap-2">
                                <div className="rounded-lg border border-priority-meeting/30 bg-priority-meeting/10 px-3 py-1.5">
                                    <PriorityBadge priority="meeting" className="border-0 bg-transparent px-0 py-0" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Meeting Toggle */}
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <div
                            className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-md border transition-all",
                                isMeeting
                                    ? "border-priority-meeting bg-priority-meeting/20"
                                    : "border-slate-700 hover:border-slate-600",
                            )}
                            onClick={() => setIsMeeting(!isMeeting)}
                        >
                            {isMeeting && <Clock className="h-3 w-3 text-priority-meeting" />}
                        </div>
                        <span className="text-xs text-muted-foreground">اجتماع / موعد</span>
                    </label>

                    {/* Time picker (visible only when meeting) */}
                    <AnimatePresence>
                        {isMeeting && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                                    وقت الاجتماع
                                </label>
                                <input
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className={cn(
                                        "w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2",
                                        "text-sm text-foreground outline-none transition-colors",
                                        "focus:border-priority-meeting/40 focus:ring-1 focus:ring-priority-meeting/20",
                                        "[color-scheme:dark]",
                                    )}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Day Picker */}
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-muted-foreground">
                            اليوم
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                            {/* Brain Dump option */}
                            <button
                                onClick={() => setTargetDate(null)}
                                className={cn(
                                    "rounded-md border px-2 py-1.5 text-[11px] font-medium transition-all cursor-pointer",
                                    targetDate === null
                                        ? "border-cyber-cyan/30 bg-cyber-cyan/10 text-cyber-cyan"
                                        : "border-slate-800 text-muted-foreground hover:border-slate-700",
                                )}
                            >
                                <Lightbulb className="h-3 w-3 mx-auto mb-0.5" />
                                أفكار
                            </button>
                            {weekDays.map((day) => (
                                <button
                                    key={day.id}
                                    onClick={() => setTargetDate(day.date)}
                                    className={cn(
                                        "rounded-md border px-2 py-1.5 text-[11px] font-medium transition-all cursor-pointer",
                                        targetDate === day.date
                                            ? "border-cyber-blue/30 bg-cyber-blue/10 text-cyber-blue"
                                            : "border-slate-800 text-muted-foreground hover:border-slate-700",
                                    )}
                                >
                                    {dayLabels[day.id as DayOfWeek]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <CyberButton
                        variant="glow"
                        size="md"
                        className="w-full"
                        onClick={handleSubmit}
                        disabled={!title.trim()}
                    >
                        إضافة المهمة
                    </CyberButton>
                </div>
            </DialogContent>
        </Dialog>
    );
}
