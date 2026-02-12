// ═══════════════════════════════════════════════════════
// Data Models — Weekly Personal Planner
// ═══════════════════════════════════════════════════════

export type Priority = "high" | "medium" | "low";

export interface Task {
    id: string;
    title: string;
    description?: string;
    isCompleted: boolean;
    priority: Priority;

    // Scheduling Logic
    isBrainDump: boolean; // True if in the inbox/sidebar
    weekId: string | null; // Null if not assigned to a specific week
    date: string | null; // ISO Date string (e.g., "2025-10-27")

    // Positioning
    order: number; // Float value for precise DnD positioning

    createdAt: string;
}

export interface WeeklyReview {
    id: string;
    weekId: string;
    good: string;
    bad: string;
    learned: string;
    completedAt: string;
}

// ── UI Helper Types ──

export type DayOfWeek = "sat" | "sun" | "mon" | "tue" | "wed" | "thu" | "fri";

export interface DayColumn {
    id: DayOfWeek;
    label: string;
    date: string; // ISO date string
    tasks: Task[];
}

export interface WeekData {
    id: string;
    startDate: string;
    endDate: string;
    days: DayColumn[];
    review?: WeeklyReview;
}
