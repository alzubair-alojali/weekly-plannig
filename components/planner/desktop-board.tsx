"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { usePlannerStore } from "@/lib/planner-store";
import { getWeekDays } from "@/lib/week-utils";
import { DayColumn } from "./day-column";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { Task } from "@/types";

interface DesktopBoardProps {
    onEditTask?: (task: Task) => void;
}

export function DesktopBoard({ onEditTask }: DesktopBoardProps) {
    const currentDate = usePlannerStore((s) => s.currentDate);
    const tasks = usePlannerStore((s) => s.tasks);

    const columns = useMemo(() => {
        const weekDays = getWeekDays(currentDate);
        return weekDays.map((day) => ({
            ...day,
            tasks: tasks
                .filter((t) => t.date === day.date)
                .sort((a, b) => a.order - b.order),
        }));
    }, [currentDate, tasks]);

    return (
        <div className="hidden md:block">
            <ScrollArea className="w-full" dir="rtl">
                <div dir="rtl" className={cn("flex gap-3 pb-4", "min-w-max")}>
                    {columns.map((col) => (
                        <DayColumn
                            key={col.id}
                            label={col.label}
                            date={col.date}
                            tasks={col.tasks}
                            onEditTask={onEditTask}
                        />
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
