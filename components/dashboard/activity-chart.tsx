"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { usePlannerStore } from "@/lib/planner-store";
import { getWeekDays } from "@/lib/week-utils";
import type { DayOfWeek } from "@/types";

const dayShortLabels: Record<DayOfWeek, string> = {
    sat: "سبت",
    sun: "أحد",
    mon: "إثن",
    tue: "ثلا",
    wed: "أرب",
    thu: "خمي",
    fri: "جمع",
};

// Custom tooltip
function CustomTooltip({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: { value: number; dataKey: string }[];
    label?: string;
}) {
    if (!active || !payload?.length) return null;

    return (
        <div
            className={cn(
                "rounded-lg border border-slate-800 bg-slate-950/95 backdrop-blur-xl",
                "px-3 py-2 shadow-xl",
            )}
        >
            <p className="mb-1 text-[11px] font-semibold text-muted-foreground">
                {label}
            </p>
            {payload.map((p) => (
                <p key={p.dataKey} className="text-sm font-bold text-cyber-blue">
                    {p.value} {p.dataKey === "completed" ? "مكتملة" : "مهام"}
                </p>
            ))}
        </div>
    );
}

export function ActivityChart() {
    const currentDate = usePlannerStore((s) => s.currentDate);
    const tasks = usePlannerStore((s) => s.tasks);

    const data = useMemo(() => {
        const weekDays = getWeekDays(currentDate);
        return weekDays.map((day) => {
            const dayTasks = tasks.filter((t) => t.date === day.date);
            const completed = dayTasks.filter((t) => t.isCompleted).length;
            const total = dayTasks.length;
            return {
                name: dayShortLabels[day.id],
                total,
                completed,
            };
        });
    }, [currentDate, tasks]);

    return (
        <div className="h-52 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1e293b"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 11, fontFamily: "var(--font-cairo)" }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        allowDecimals={false}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: "#3b82f640", strokeWidth: 1 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#gradTotal)"
                        dot={{ fill: "#3b82f6", r: 3, strokeWidth: 0 }}
                        activeDot={{ fill: "#3b82f6", r: 5, strokeWidth: 2, stroke: "#020617" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="completed"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        fill="url(#gradCompleted)"
                        dot={{ fill: "#06b6d4", r: 3, strokeWidth: 0 }}
                        activeDot={{ fill: "#06b6d4", r: 5, strokeWidth: 2, stroke: "#020617" }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
