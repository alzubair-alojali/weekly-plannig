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

    const [selectedDates, setSelectedDates] = useState<string[]>([]);

    const toggleDate = (date: string) => {
        setSelectedDates((prev) =>
            prev.includes(date)
                ? prev.filter((d) => d !== date)
                : [...prev, date]
        );
    };

    const handleCopy = () => {
        if (!task || selectedDates.length === 0) return;

        // Copy to all selected dates
        selectedDates.forEach((date) => {
            duplicateTask(task.id, date);
        });

        onOpenChange(false);
        setSelectedDates([]);
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
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 container">
                                <CalendarDays className="h-3.5 w-3.5" />
                                <span>اختر الأيام للنسخ إليها</span>
                            </label>
                            {selectedDates.length > 0 && (
                                <span className="text-[10px] text-cyber-blue font-medium">
                                    تم تحديد {selectedDates.length}
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {weekDays.map((day) => {
                                const isSelected = selectedDates.includes(day.date);
                                return (
                                    <button
                                        key={day.date}
                                        onClick={() => toggleDate(day.date)}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-1 rounded-lg border p-2 transition-all cursor-pointer relative",
                                            isSelected
                                                ? "border-cyber-blue bg-cyber-blue/10 text-cyber-blue"
                                                : "border-slate-800 bg-slate-900/30 text-muted-foreground hover:border-slate-700 hover:bg-slate-800/50"
                                        )}
                                    >
                                        <span className="text-xs font-semibold">{day.label}</span>
                                        <span className="text-[10px] opacity-70">
                                            {new Date(day.date).toLocaleDateString('en-US', { day: 'numeric', month: 'numeric' })}
                                        </span>
                                        {isSelected && (
                                            <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-cyber-blue shadow-[0_0_5px_rgba(59,130,246,0.5)]" />
                                        )}
                                    </button>
                                );
                            })}
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
                        disabled={selectedDates.length === 0}
                        className="gap-2"
                    >
                        <span>نسخ ({selectedDates.length})</span>
                        <ArrowLeft className="h-3 w-3" />
                    </CyberButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
