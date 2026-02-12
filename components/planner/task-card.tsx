"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { usePlannerStore } from "@/lib/planner-store";
import { Check, GripVertical, Pencil, Trash2 } from "lucide-react";
import type { Task } from "@/types";

interface TaskCardProps {
    task: Task;
    isDragging?: boolean;
    onEdit?: (task: Task) => void;
}

export function TaskCard({ task, isDragging = false, onEdit }: TaskCardProps) {
    const toggleComplete = usePlannerStore((s) => s.toggleComplete);
    const deleteTask = usePlannerStore((s) => s.deleteTask);

    return (
        <div
            onDoubleClick={() => onEdit?.(task)}
            className={cn(
                "group relative rounded-lg border p-3 transition-colors duration-200",
                // Glass surface
                "bg-slate-900/60 backdrop-blur-sm",
                // Border colors
                isDragging
                    ? "border-cyber-blue/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                    : "border-slate-800 hover:border-slate-700",
                // Completed state
                task.isCompleted && "opacity-60",
            )}
        >
            <div className="flex items-start gap-2.5">
                {/* Drag Handle (visual only for now — DnD TBD for React 19 compat) */}
                <div className="mt-0.5 cursor-grab text-slate-600 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
                    <GripVertical className="h-4 w-4" />
                </div>

                {/* Checkbox */}
                <button
                    onClick={() => toggleComplete(task.id)}
                    className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200",
                        "cursor-pointer",
                        task.isCompleted
                            ? "border-cyber-blue bg-cyber-blue/20 text-cyber-blue"
                            : "border-slate-600 hover:border-slate-500",
                    )}
                >
                    {task.isCompleted && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", duration: 0.3 }}
                        >
                            <Check className="h-3 w-3" />
                        </motion.div>
                    )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <p
                        className={cn(
                            "text-sm font-medium leading-tight text-foreground transition-all duration-300",
                            task.isCompleted && "line-through text-muted-foreground",
                        )}
                    >
                        {task.title}
                    </p>
                    {task.description && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                    <PriorityBadge priority={task.priority} dot={false} className="text-[10px] px-1.5" />
                    <button
                        onClick={() => onEdit?.(task)}
                        className={cn(
                            "rounded p-1 text-slate-600 opacity-0 transition-all",
                            "hover:bg-cyber-blue/10 hover:text-cyber-blue",
                            "group-hover:opacity-100",
                            "cursor-pointer",
                        )}
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={() => deleteTask(task.id)}
                        className={cn(
                            "rounded p-1 text-slate-600 opacity-0 transition-all",
                            "hover:bg-destructive/10 hover:text-destructive",
                            "group-hover:opacity-100",
                            "cursor-pointer",
                        )}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Completed glow effect */}
            {task.isCompleted && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                        background: "linear-gradient(135deg, rgba(59,130,246,0.03) 0%, transparent 60%)",
                    }}
                />
            )}
        </div>
    );
}
