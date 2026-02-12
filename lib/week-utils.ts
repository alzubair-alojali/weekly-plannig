import {
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    addWeeks,
    subWeeks,
    isToday,
    isSameDay,
    parseISO,
    getWeek,
    getWeekYear,
} from "date-fns";
import { ar } from "date-fns/locale";
import type { DayOfWeek, DayColumn } from "@/types";

// Week starts on Saturday for Arabic locale
const WEEK_START_DAY = 6; // 0=Sun, 6=Sat

const dayIdMap: Record<number, DayOfWeek> = {
    6: "sat",
    0: "sun",
    1: "mon",
    2: "tue",
    3: "wed",
    4: "thu",
    5: "fri",
};

const dayLabels: Record<DayOfWeek, string> = {
    sat: "السبت",
    sun: "الأحد",
    mon: "الإثنين",
    tue: "الثلاثاء",
    wed: "الأربعاء",
    thu: "الخميس",
    fri: "الجمعة",
};

const dayLabelsShort: Record<DayOfWeek, string> = {
    sat: "سبت",
    sun: "أحد",
    mon: "إثن",
    tue: "ثلا",
    wed: "أرب",
    thu: "خمي",
    fri: "جمع",
};

/** Get the start of the week (Saturday) for a given date */
export function getWeekStart(date: Date = new Date()): Date {
    return startOfWeek(date, { weekStartsOn: WEEK_START_DAY });
}

/** Get the end of the week (Friday) for a given date */
export function getWeekEnd(date: Date = new Date()): Date {
    return endOfWeek(date, { weekStartsOn: WEEK_START_DAY });
}

/** Generate a week ID from a date (e.g., "2026-W07") */
export function getWeekId(date: Date = new Date()): string {
    const start = getWeekStart(date);
    return format(start, "yyyy-'W'ww", { weekStartsOn: WEEK_START_DAY });
}

/** Get all 7 days of the week as DayColumn structures */
export function getWeekDays(date: Date = new Date()): Omit<DayColumn, "tasks">[] {
    const start = getWeekStart(date);
    const end = getWeekEnd(date);
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
        const dayNum = day.getDay();
        const id = dayIdMap[dayNum];
        return {
            id,
            label: dayLabels[id],
            date: format(day, "yyyy-MM-dd"),
        };
    });
}

/** Navigate to next week */
export function nextWeek(current: Date): Date {
    return addWeeks(current, 1);
}

/** Navigate to previous week */
export function prevWeek(current: Date): Date {
    return subWeeks(current, 1);
}

/** Check if a date string is today */
export function isDateToday(dateStr: string): boolean {
    return isToday(parseISO(dateStr));
}

/** Check if two date strings represent the same day */
export function isSameDate(a: string, b: string): boolean {
    return isSameDay(parseISO(a), parseISO(b));
}

/** Format date for display (e.g., "١٢ فبراير") */
export function formatDateAr(dateStr: string): string {
    return format(parseISO(dateStr), "d MMMM", { locale: ar });
}

/** Format a date range for header (e.g., "٧ - ١٣ فبراير ٢٠٢٦") */
export function formatWeekRange(date: Date = new Date()): string {
    const start = getWeekStart(date);
    const end = getWeekEnd(date);
    const startStr = format(start, "d", { locale: ar });
    const endStr = format(end, "d MMMM yyyy", { locale: ar });
    return `${startStr} - ${endStr}`;
}

export { dayLabels, dayLabelsShort, dayIdMap };

/** Get the week number for DB storage (consistent with Saturday-start weeks) */
export function getWeekNumber(date: Date = new Date()): number {
    const start = getWeekStart(date);
    return getWeek(start, { weekStartsOn: WEEK_START_DAY });
}

/** Get the year for DB storage (week-year, accounts for year boundary weeks) */
export function getWeekYearNum(date: Date = new Date()): number {
    const start = getWeekStart(date);
    return getWeekYear(start, { weekStartsOn: WEEK_START_DAY });
}
