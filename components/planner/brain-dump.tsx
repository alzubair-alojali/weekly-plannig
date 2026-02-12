"use client";

import { useState, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { usePlannerStore } from "@/lib/planner-store";
import { getWeekDays } from "@/lib/week-utils";
import { GlassCard } from "@/components/ui/glass-card";
import { CyberButton } from "@/components/ui/cyber-button";
import { PriorityBadge } from "@/components/ui/priority-badge";
import {
    Lightbulb,
    ChevronDown,
    Plus,
    Trash2,
    CalendarPlus,
    Clock,
} from "lucide-react";
import { dayLabels } from "@/lib/week-utils";
import type { Task, DayOfWeek, Priority } from "@/types";

const priorities: Priority[] = ["high", "medium", "low"];

// ── Inline Add for Brain Dump (matches DayColumn AddTaskInline) ──
function BrainDumpInput() {
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
                date: null,
                isBrainDump: true,
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
            <CyberButton
                variant="ghost"
                size="sm"
                onClick={() => setIsAdding(true)}
                className="w-full justify-start gap-2 text-muted-foreground"
            >
                <Plus className="h-3.5 w-3.5" />
                <span>فكرة جديدة...</span>
            </CyberButton>
        );
    }

    return (
        <div className="space-y-2 rounded-lg border border-cyber-cyan/30 bg-slate-900/80 p-2.5">
            <input
                ref={inputRef}
                autoFocus
                placeholder="اكتب فكرتك..."
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
                                    ? "border-cyber-cyan/30 bg-cyber-cyan/10 scale-105"
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
                        className="rounded-md bg-cyber-cyan/15 px-2.5 py-0.5 text-[10px] font-semibold text-cyber-cyan transition-colors hover:bg-cyber-cyan/25 cursor-pointer"
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

// ── Schedule Popover (inline day picker) ──
function SchedulePicker({
    task,
    onClose,
}: {
    task: Task;
    onClose: () => void;
}) {
    const scheduleTask = usePlannerStore((s) => s.scheduleTask);
    const currentDate = usePlannerStore((s) => s.currentDate);
    const columns = useMemo(() => getWeekDays(currentDate), [currentDate]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute start-0 end-0 top-full z-20 mt-1 rounded-lg border border-slate-800 bg-slate-950/95 p-2 backdrop-blur-xl shadow-xl"
        >
            <p className="mb-2 text-[10px] font-semibold text-muted-foreground">
                جدولة ليوم:
            </p>
            <div className="grid grid-cols-4 gap-1">
                {columns.map((col) => (
                    <button
                        key={col.id}
                        onClick={() => {
                            scheduleTask(task.id, col.date);
                            onClose();
                        }}
                        className={cn(
                            "rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors cursor-pointer",
                            "border border-slate-800 hover:border-cyber-cyan/30 hover:bg-cyber-cyan/10 hover:text-cyber-cyan",
                            "text-muted-foreground",
                        )}
                    >
                        {dayLabels[col.id as DayOfWeek]}
                    </button>
                ))}
            </div>
        </motion.div>
    );
}

// ── Brain Dump Item ──
function BrainDumpItem({ task }: { task: Task }) {
    const deleteTask = usePlannerStore((s) => s.deleteTask);
    const [showSchedule, setShowSchedule] = useState(false);

    // ── Native HTML5 DnD ──
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.setData("application/from-date", "");
        e.dataTransfer.setData("application/source", "brain_dump");
        e.dataTransfer.effectAllowed = "move";
    };

    return (
        <div className="group relative">
            <div
                draggable
                onDragStart={handleDragStart}
                className={cn(
                    "flex items-center gap-2 rounded-lg border border-slate-800/60 bg-slate-900/40 p-2.5",
                    "transition-colors hover:border-slate-700 cursor-grab active:cursor-grabbing",
                )}
            >
                {/* Dot */}
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyber-cyan/60" />

                {/* Title */}
                <span className="flex-1 truncate text-sm text-foreground">
                    {task.title}
                </span>

                {/* Priority */}
                <PriorityBadge
                    priority={task.priority}
                    dot={false}
                    className="text-[10px] px-1.5"
                />

                {/* Schedule button */}
                <button
                    onClick={() => setShowSchedule(!showSchedule)}
                    className={cn(
                        "rounded p-1 text-slate-600 opacity-0 transition-all cursor-pointer",
                        "hover:bg-cyber-cyan/10 hover:text-cyber-cyan",
                        "group-hover:opacity-100",
                        showSchedule && "opacity-100 text-cyber-cyan",
                    )}
                    title="جدولة"
                >
                    <CalendarPlus className="h-3.5 w-3.5" />
                </button>

                {/* Delete */}
                <button
                    onClick={() => deleteTask(task.id)}
                    className={cn(
                        "rounded p-1 text-slate-600 opacity-0 transition-all cursor-pointer",
                        "hover:bg-destructive/10 hover:text-destructive",
                        "group-hover:opacity-100",
                    )}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            {/* Schedule Picker */}
            <AnimatePresence>
                {showSchedule && (
                    <SchedulePicker task={task} onClose={() => setShowSchedule(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Main Brain Dump Panel ──
export function BrainDumpPanel() {
    const brainDumpTasks = usePlannerStore((s) => s.brainDumpTasks);
    const [isOpen, setIsOpen] = useState(true);

    return (
        <GlassCard className="overflow-visible p-0">
            {/* Header — toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex w-full items-center justify-between px-4 py-3 cursor-pointer",
                    "transition-colors hover:bg-slate-800/30",
                    isOpen && "border-b border-slate-800/60",
                )}
            >
                <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyber-cyan/10">
                        <Lightbulb className="h-4 w-4 text-cyber-cyan" />
                    </div>
                    <span className="text-sm font-bold text-foreground">تفريغ الأفكار</span>
                    {brainDumpTasks.length > 0 && (
                        <span className="rounded-full bg-cyber-cyan/15 px-2 py-0.5 text-[10px] font-semibold text-cyber-cyan">
                            {brainDumpTasks.length}
                        </span>
                    )}
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </motion.div>
            </button>

            {/* Content */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-2 p-3">
                            {brainDumpTasks.length === 0 && (
                                <p className="py-4 text-center text-xs text-slate-600">
                                    اكتب أفكارك هنا ثم جدولها لاحقاً
                                </p>
                            )}

                            {brainDumpTasks.map((task) => (
                                <BrainDumpItem key={task.id} task={task} />
                            ))}

                            <BrainDumpInput />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassCard>
    );
}
