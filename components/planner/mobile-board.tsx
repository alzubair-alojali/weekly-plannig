"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { usePlannerStore } from "@/lib/planner-store";
import { isDateToday, getWeekDays } from "@/lib/week-utils";
import { DayColumn } from "./day-column";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import type { Task } from "@/types";

interface MobileBoardProps {
    onEditTask?: (task: Task) => void;
}

export function MobileBoard({ onEditTask }: MobileBoardProps) {
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

    // Default to today's tab, or first day
    const todayCol = columns.find((c) => isDateToday(c.date));
    const [activeTab, setActiveTab] = useState(todayCol?.date || columns[0]?.date || "");

    return (
        <div className="block md:hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Scrollable day tabs */}
                <div className="overflow-x-auto -mx-4 px-4 pb-1">
                    <TabsList className="inline-flex w-max gap-1 bg-slate-900/50 border border-slate-800 p-1 rounded-lg">
                        {columns.map((col) => {
                            const today = isDateToday(col.date);
                            return (
                                <TabsTrigger
                                    key={col.date}
                                    value={col.date}
                                    className={cn(
                                        "rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                                        "data-[state=active]:bg-cyber-blue/15 data-[state=active]:text-cyber-blue data-[state=active]:border-cyber-blue/30",
                                        today && "text-cyber-blue",
                                    )}
                                >
                                    <span>{col.label}</span>
                                    {today && (
                                        <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-cyber-blue" />
                                    )}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                </div>

                {/* Tab content — single day column */}
                <AnimatePresence mode="wait">
                    {columns.map((col) => (
                        <TabsContent key={col.date} value={col.date} className="mt-3">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                                <DayColumn
                                    label={col.label}
                                    date={col.date}
                                    tasks={col.tasks}
                                    fullHeight
                                    onEditTask={onEditTask}
                                />
                            </motion.div>
                        </TabsContent>
                    ))}
                </AnimatePresence>
            </Tabs>
        </div>
    );
}
