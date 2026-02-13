"use client";

import { useState } from "react";
import { usePlannerStore } from "@/lib/planner-store";
import { getWeekDays } from "@/lib/week-utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CyberButton } from "@/components/ui/cyber-button";
import { Copy, CalendarDays, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

interface TaskCopyDialogProps {
    task: Task | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TaskCopyDialog({ task, open, onOpenChange }: TaskCopyDialogProps) {
    const currentDate = usePlannerStore((s) => s.currentDate);
    const duplicateTask = usePlannerStore((s) => s.duplicateTask);
    const weekDays = getWeekDays(currentDate);

    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const handleCopy = () => {
        if (!task || !selectedDate) return;
        duplicateTask(task.id, selectedDate);
        onOpenChange(false);
        setSelectedDate(null);
    };

    if (!task) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md border-slate-800 bg-slate-950/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Copy className="h-4 w-4 text-cyber-blue" />
                        <span>نسخ المهمة</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                        <p className="text-sm font-medium text-foreground">{task.title}</p>
                        {task.description && (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            <span>اختر اليوم للنسخ إليه</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {weekDays.map((day) => (
                                <button
                                    key={day.date}
                                    onClick={() => setSelectedDate(day.date)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-1 rounded-lg border p-2 transition-all",
                                        selectedDate === day.date
                                            ? "border-cyber-blue bg-cyber-blue/10 text-cyber-blue"
                                            : "border-slate-800 bg-slate-900/30 text-muted-foreground hover:border-slate-700 hover:bg-slate-800/50"
                                    )}
                                >
                                    <span className="text-xs font-semibold">{day.label}</span>
                                    <span className="text-[10px] opacity-70">
                                        {new Date(day.date).toLocaleDateString('en-US', { day: 'numeric', month: 'numeric' })}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
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
                        onClick={handleCopy}
                        disabled={!selectedDate}
                        className="gap-2"
                    >
                        <span>نسخ المهمة</span>
                        <ArrowLeft className="h-3 w-3" />
                    </CyberButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
