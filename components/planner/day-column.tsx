"use client";

import { cn } from "@/lib/utils";
import { usePlannerStore } from "@/lib/planner-store";
import { isDateToday, formatDateAr } from "@/lib/week-utils";
import { TaskCard } from "./task-card";
import { Plus, Trophy, Clock } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import type { Task, Priority } from "@/types";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { motion, AnimatePresence } from "framer-motion";

// ── Inline Add with Priority + Meeting Toggle ──
interface AddTaskInlineProps {
    date: string;
}

const priorities: Priority[] = ["high", "medium", "low"];

function AddTaskInline({ date }: AddTaskInlineProps) {
    const addTask = usePlannerStore((s) => s.addTask);
    const [isAdding, setIsAdding] = useState(false);
    const [priority, setPriority] = useState<Priority>("medium");
    const [isMeeting, setIsMeeting] = useState(false);
    const [startTime, setStartTime] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = () => {
        const value = inputRef.current?.value.trim();
        if (value) {
            addTask({
                title: value,
                date,
                priority: isMeeting ? "meeting" : priority,
                startTime: isMeeting && startTime ? startTime + ":00" : null,
            });
            if (inputRef.current) inputRef.current.value = "";
            setPriority("medium");
            setIsMeeting(false);
            setStartTime("");
        }
        setIsAdding(false);
    };

    if (!isAdding) {
        return (
            <button
                onClick={() => setIsAdding(true)}
                className={cn(
                    "flex w-full items-center gap-2 rounded-lg border border-dashed border-slate-800 p-2.5",
                    "text-xs text-muted-foreground transition-colors",
                    "hover:border-slate-700 hover:text-foreground",
                    "cursor-pointer",
                )}
            >
                <Plus className="h-3.5 w-3.5" />
                <span>إضافة مهمة</span>
            </button>
        );
    }

    return (
        <div className="space-y-2 rounded-lg border border-cyber-blue/30 bg-slate-900/80 p-2.5">
            <input
                ref={inputRef}
                autoFocus
                placeholder="عنوان المهمة..."
                className={cn(
                    "w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground",
                    "outline-none",
                )}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleSubmit();
                    if (e.key === "Escape") setIsAdding(false);
                }}
            />

            {/* Meeting toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                    className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border transition-all",
                        isMeeting
                            ? "border-priority-meeting bg-priority-meeting/20"
                            : "border-slate-700 hover:border-slate-600",
                    )}
                    onClick={() => setIsMeeting(!isMeeting)}
                >
                    {isMeeting && <Clock className="h-2.5 w-2.5 text-priority-meeting" />}
                </div>
                <span className="text-[11px] text-muted-foreground">اجتماع / موعد</span>
            </label>

            {/* Time picker (shown when meeting is checked) */}
            <AnimatePresence>
                {isMeeting && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className={cn(
                                "w-full rounded-md border border-slate-800 bg-slate-950/80 px-2.5 py-1.5",
                                "text-xs text-foreground outline-none",
                                "focus:border-priority-meeting/40",
                                "[color-scheme:dark]",
                            )}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Priority selector (hidden when meeting) */}
            {!isMeeting && (
                <div className="flex items-center gap-1.5">
                    {priorities.map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setPriority(p)}
                            className={cn(
                                "rounded-md border px-2 py-0.5 text-[10px] transition-all cursor-pointer",
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
                    <div className="flex-1" />
                    <button
                        onClick={handleSubmit}
                        className="rounded-md bg-cyber-blue/15 px-2.5 py-0.5 text-[10px] font-semibold text-cyber-blue transition-colors hover:bg-cyber-blue/25 cursor-pointer"
                    >
                        إضافة
                    </button>
                </div>
            )}

            {/* Submit for meeting mode */}
            {isMeeting && (
                <button
                    onClick={handleSubmit}
                    className="w-full rounded-md bg-priority-meeting/15 px-2.5 py-1 text-[10px] font-semibold text-priority-meeting transition-colors hover:bg-priority-meeting/25 cursor-pointer"
                >
                    إضافة اجتماع
                </button>
            )}
        </div>
    );
}

// ── Day Column ──
interface DayColumnProps {
    label: string;
    date: string;
    tasks: Task[];
    fullHeight?: boolean;
    onEditTask?: (task: Task) => void;
    weeklyChallenge?: string;
    challengeChecked?: boolean;
    onToggleChallenge?: (date: string) => void;
}

export function DayColumn({
    label,
    date,
    tasks,
    fullHeight = false,
    onEditTask,
    weeklyChallenge,
    challengeChecked = false,
    onToggleChallenge,
}: DayColumnProps) {
    const today = isDateToday(date);
    const dateLabel = formatDateAr(date);
    const moveTask = usePlannerStore((s) => s.moveTask);
    const [isDragOver, setIsDragOver] = useState(false);

    // ── DnD: Drop Target ──
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            const taskId = e.dataTransfer.getData("text/plain");
            if (!taskId) return;

            moveTask({
                taskId,
                fromDate: e.dataTransfer.getData("application/from-date") || null,
                toDate: date,
                newIndex: tasks.length,
            });
        },
        [date, moveTask, tasks.length],
    );

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "flex flex-col rounded-xl border bg-slate-900/30 transition-colors duration-200",
                today ? "border-cyber-blue/30" : "border-slate-800/60",
                isDragOver && "border-cyber-cyan/50 bg-cyber-cyan/5 shadow-[0_0_20px_rgba(6,182,212,0.08)]",
                fullHeight && "min-h-[30vh]",
            )}
        >
            {/* Column Header */}
            <div
                className={cn(
                    "flex items-center justify-between px-3 py-2.5 border-b",
                    today
                        ? "border-cyber-blue/20 bg-cyber-blue/5"
                        : "border-slate-800/60",
                )}
            >
                <div className="flex items-center gap-2">
                    <h3
                        className={cn(
                            "text-sm font-bold",
                            today ? "text-cyber-blue" : "text-foreground",
                        )}
                    >
                        {label}
                    </h3>
                    {today && (
                        <span className="rounded-full bg-cyber-blue/20 px-2 py-0.5 text-[10px] font-semibold text-cyber-blue">
                            اليوم
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">{dateLabel}</span>
                    {tasks.length > 0 && (
                        <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            {tasks.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Weekly Challenge Badge with Check-in */}
            <AnimatePresence>
                {weeklyChallenge && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-b border-slate-800/40"
                    >
                        <div className="flex items-center gap-2 px-3 py-2 bg-linear-to-l from-amber-500/5 to-transparent">
                            {/* Check-in checkbox */}
                            <button
                                onClick={() => onToggleChallenge?.(date)}
                                className={cn(
                                    "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-all cursor-pointer",
                                    challengeChecked
                                        ? "border-amber-400 bg-amber-400/20 text-amber-400"
                                        : "border-slate-600 hover:border-amber-400/50",
                                )}
                            >
                                {challengeChecked && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", duration: 0.3 }}
                                    >
                                        <Trophy className="h-2.5 w-2.5" />
                                    </motion.div>
                                )}
                            </button>
                            <span className={cn(
                                "text-[11px] font-semibold truncate flex-1",
                                challengeChecked ? "text-amber-400 line-through" : "text-amber-400/90",
                            )}>
                                {weeklyChallenge}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Task List */}
            <div className="flex-1 space-y-2 p-2">
                {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={onEditTask} />
                ))}

                {/* Empty state */}
                {tasks.length === 0 && (
                    <div className="py-6 text-center">
                        <p className="text-xs text-slate-600">
                            {isDragOver ? "أفلت هنا" : "لا توجد مهام"}
                        </p>
                    </div>
                )}
            </div>

            {/* Add Task */}
            <div className="border-t border-slate-800/40 p-2">
                <AddTaskInline date={date} />
            </div>
        </div>
    );
}
