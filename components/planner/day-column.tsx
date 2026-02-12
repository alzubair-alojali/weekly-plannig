"use client";

import { cn } from "@/lib/utils";
import { usePlannerStore } from "@/lib/planner-store";
import { isDateToday, formatDateAr } from "@/lib/week-utils";
import { TaskCard } from "./task-card";
import { Plus } from "lucide-react";
import { useState, useRef } from "react";
import type { Task } from "@/types";

interface AddTaskInlineProps {
    date: string;
}

function AddTaskInline({ date }: AddTaskInlineProps) {
    const addTask = usePlannerStore((s) => s.addTask);
    const [isAdding, setIsAdding] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = () => {
        const value = inputRef.current?.value.trim();
        if (value) {
            addTask({ title: value, date });
            if (inputRef.current) inputRef.current.value = "";
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
        <div className="rounded-lg border border-cyber-blue/30 bg-slate-900/80 p-2">
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
                onBlur={handleSubmit}
            />
        </div>
    );
}

interface DayColumnProps {
    label: string;
    date: string;
    tasks: Task[];
    /** Used in mobile tabs — stretch to fill */
    fullHeight?: boolean;
    /** Called when user wants to edit a task */
    onEditTask?: (task: Task) => void;
}

export function DayColumn({ label, date, tasks, fullHeight = false, onEditTask }: DayColumnProps) {
    const today = isDateToday(date);
    const dateLabel = formatDateAr(date);

    return (
        <div
            className={cn(
                "flex flex-col rounded-xl border bg-slate-900/30",
                today ? "border-cyber-blue/30" : "border-slate-800/60",
                // Desktop: fixed width for horizontal scroll
                !fullHeight && "w-65 shrink-0",
                // Mobile tabs: fill available height
                fullHeight && "min-h-[60vh]",
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
                <span className="text-[11px] text-muted-foreground">{dateLabel}</span>
                {tasks.length > 0 && (
                    <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground ms-1">
                        {tasks.length}
                    </span>
                )}
            </div>

            {/* Task List */}
            <div className="flex-1 space-y-2 p-2">
                {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} onEdit={onEditTask} />
                ))}

                {/* Empty state */}
                {tasks.length === 0 && (
                    <div className="py-6 text-center">
                        <p className="text-xs text-slate-600">لا توجد مهام</p>
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
