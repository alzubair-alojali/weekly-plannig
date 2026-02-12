"use client";

import { useMemo } from "react";
import { usePlannerStore } from "@/lib/planner-store";
import { formatWeekRange, getWeekNumber } from "@/lib/week-utils";
import { CyberButton } from "@/components/ui/cyber-button";
import {
    ChevronRight,
    ChevronLeft,
    CalendarDays,
    ClipboardCheck,
} from "lucide-react";

interface WeekNavigatorProps {
    onStartReview?: () => void;
}

export function WeekNavigator({ onStartReview }: WeekNavigatorProps) {
    const currentDate = usePlannerStore((s) => s.currentDate);
    const weekId = usePlannerStore((s) => s.weekId);
    const goToNextWeek = usePlannerStore((s) => s.goToNextWeek);
    const goToPrevWeek = usePlannerStore((s) => s.goToPrevWeek);
    const goToToday = usePlannerStore((s) => s.goToToday);
    const reviews = usePlannerStore((s) => s.reviews);
    const existingReview = useMemo(() => reviews.find((r) => r.weekId === weekId), [reviews, weekId]);

    const weekRange = formatWeekRange(currentDate);
    const weekNumber = useMemo(() => getWeekNumber(currentDate), [currentDate]);

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Week label */}
            <div className="space-y-1">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-foreground">المخطط الأسبوعي</h2>
                    <span className="rounded-full bg-cyber-blue/10 border border-cyber-blue/20 px-2.5 py-0.5 text-xs font-semibold text-cyber-blue">
                        الأسبوع {weekNumber} / 52
                    </span>
                </div>
                <p className="text-sm text-muted-foreground">{weekRange}</p>
            </div>

            {/* Navigation controls */}
            <div className="flex items-center gap-2">
                <CyberButton
                    variant="ghost"
                    size="icon"
                    onClick={goToNextWeek}
                    aria-label="الأسبوع القادم"
                >
                    <ChevronRight className="h-4 w-4" />
                </CyberButton>

                <CyberButton
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                    className="gap-1.5"
                >
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>اليوم</span>
                </CyberButton>

                <CyberButton
                    variant="ghost"
                    size="icon"
                    onClick={goToPrevWeek}
                    aria-label="الأسبوع السابق"
                >
                    <ChevronLeft className="h-4 w-4" />
                </CyberButton>

                {/* Review button */}
                {onStartReview && (
                    <CyberButton
                        variant={existingReview ? "secondary" : "accent"}
                        size="sm"
                        onClick={onStartReview}
                        className="gap-1.5 ms-1"
                    >
                        <ClipboardCheck className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">
                            {existingReview ? "عرض المراجعة" : "مراجعة الأسبوع"}
                        </span>
                    </CyberButton>
                )}
            </div>
        </div>
    );
}
