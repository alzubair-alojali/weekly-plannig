"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { usePlannerStore } from "@/lib/planner-store";
import { getWeekDays } from "@/lib/week-utils";
import { DayColumn } from "./day-column";
import type { Task } from "@/types";

interface PlannerGridProps {
    onEditTask?: (task: Task) => void;
    /** The current weekly challenge string to show in each column */
    weeklyChallenge?: string;
}

const stagger = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.04 },
    },
};

const fadeScale = {
    hidden: { opacity: 0, scale: 0.97 },
    show: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3, ease: "easeOut" as const },
    },
};

export function PlannerGrid({ onEditTask, weeklyChallenge }: PlannerGridProps) {
    const currentDate = usePlannerStore((s) => s.currentDate);
    const tasks = usePlannerStore((s) => s.tasks);
    const weekId = usePlannerStore((s) => s.weekId);
    const weekMetas = usePlannerStore((s) => s.weekMetas);
    const toggleChallengeDay = usePlannerStore((s) => s.toggleChallengeDay);

    const challengeProgress = useMemo(
        () => weekMetas.find((m) => m.weekId === weekId)?.challengeProgress ?? [],
        [weekMetas, weekId],
    );

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
        <motion.div
            dir="rtl"
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
            {columns.map((col) => (
                <motion.div key={col.id} variants={fadeScale}>
                    <DayColumn
                        label={col.label}
                        date={col.date}
                        tasks={col.tasks}
                        fullHeight
                        onEditTask={onEditTask}
                        weeklyChallenge={weeklyChallenge}
                        challengeChecked={challengeProgress.includes(col.date)}
                        onToggleChallenge={toggleChallengeDay}
                    />
                </motion.div>
            ))}
        </motion.div>
    );
}
