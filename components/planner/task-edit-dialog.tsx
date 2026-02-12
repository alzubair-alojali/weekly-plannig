"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { usePlannerStore } from "@/lib/planner-store";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { CyberButton } from "@/components/ui/cyber-button";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { AlignRight, Sparkles, Clock } from "lucide-react";
import type { Task, Priority } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

interface TaskEditDialogProps {
    task: Task | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const priorities: Priority[] = ["high", "medium", "low"];

function TaskEditForm({
    task,
    onOpenChange,
}: {
    task: Task;
    onOpenChange: (open: boolean) => void;
}) {
    const updateTask = usePlannerStore((s) => s.updateTask);

    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description ?? "");
    const [priority, setPriority] = useState<Priority>(task.priority);
    const [isMeeting, setIsMeeting] = useState(task.priority === "meeting");
    const [startTime, setStartTime] = useState(
        task.startTime ? task.startTime.slice(0, 5) : "", // "14:30:00" → "14:30"
    );

    const handleSave = () => {
        if (!title.trim()) return;
        updateTask(task.id, {
            title: title.trim(),
            description: description.trim() || undefined,
            priority: isMeeting ? "meeting" : priority,
            startTime: isMeeting && startTime ? startTime + ":00" : null,
        });
        onOpenChange(false);
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-foreground">
                    <Sparkles className="h-4 w-4 text-cyber-blue" />
                    <span>تعديل المهمة</span>
                </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
                {/* Title */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">
                        عنوان المهمة
                    </label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="عنوان المهمة..."
                        className={cn(
                            "w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2.5",
                            "text-sm text-foreground placeholder:text-muted-foreground",
                            "outline-none transition-colors",
                            "focus:border-cyber-blue/40 focus:ring-1 focus:ring-cyber-blue/20",
                        )}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave();
                        }}
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <AlignRight className="h-3 w-3" />
                        <span>الوصف</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="أضف وصفاً للمهمة..."
                        rows={3}
                        className={cn(
                            "w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2.5",
                            "text-sm text-foreground placeholder:text-muted-foreground",
                            "outline-none transition-colors resize-none",
                            "focus:border-cyber-blue/40 focus:ring-1 focus:ring-cyber-blue/20",
                        )}
                    />
                </div>

                {/* Priority */}
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground">
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
                                    <PriorityBadge priority={p} className="border-0 bg-transparent px-0 py-0" />
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

                {/* Time Picker */}
                <AnimatePresence>
                    {isMeeting && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden space-y-1"
                        >
                            <label className="text-xs font-semibold text-muted-foreground">
                                وقت الاجتماع
                            </label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className={cn(
                                    "w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2.5",
                                    "text-sm text-foreground outline-none transition-colors",
                                    "focus:border-priority-meeting/40 focus:ring-1 focus:ring-priority-meeting/20",
                                    "[color-scheme:dark]",
                                )}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
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
                    disabled={!title.trim()}
                >
                    حفظ التعديلات
                </CyberButton>
            </DialogFooter>
        </>
    );
}

export function TaskEditDialog({ task, open, onOpenChange }: TaskEditDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "border-slate-800 bg-slate-950/95 backdrop-blur-xl",
                    "shadow-[0_0_60px_rgba(59,130,246,0.08)]",
                    "sm:max-w-md",
                )}
            >
                {task && (
                    <TaskEditForm key={task.id} task={task} onOpenChange={onOpenChange} />
                )}
            </DialogContent>
        </Dialog>
    );
}
