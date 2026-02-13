// ═══════════════════════════════════════════════════════
// Data Models — Weekly Personal Planner
// ═══════════════════════════════════════════════════════

export type Priority = "high" | "medium" | "low" | "meeting";
export type TaskStatus = "pending" | "completed";

export interface Task {
    id: string;
    title: string;
    description?: string;
    isCompleted: boolean;
    priority: Priority;

    // Meeting / Appointment
    startTime?: string | null; // HH:mm:ss or HH:mm (e.g., "14:30:00")

    // Scheduling Logic
    isBrainDump: boolean; // True if in the inbox/sidebar
    weekId: string | null; // UUID of the week record (FK to weeks.id)
    date: string | null; // ISO Date string (e.g., "2025-10-27")

    // Positioning
    order: number; // Float value for precise DnD positioning

    createdAt: string;
    userId?: string; // Supabase user id (not used locally)
}

/** Row shape returned from Supabase `tasks` table */
export interface TaskRow {
    id: string;
    user_id: string;
    week_id: string | null;
    title: string;
    description: string | null;
    task_date: string | null;
    is_brain_dump: boolean;
    priority: string;           // task_priority enum
    status: string;             // task_status enum ('pending' | 'completed')
    position: number;           // float8 (was "order" in old code)
    created_at: string;
    start_time: string | null;
}

/** Row shape for the `weeks` table */
export interface WeekRow {
    id: string;
    user_id: string;
    week_number: number;
    year: number;
    start_date: string;
    end_date: string;
    weekly_challenge: string | null;
    challenge_progress: string[] | null; // JSONB: array of date strings where challenge was completed
    review_good: string | null;
    review_bad: string | null;
    review_learned: string | null;
    rest_day: string | null; // ISO date string for the rest day
    created_at: string;
}

export interface WeeklyReview {
    id: string;
    weekId: string;
    good: string;
    bad: string;
    learned: string;
    completedAt: string;
}

/** Stores metadata about a week (challenge, creation time, etc.) */
export interface WeekMeta {
    weekId: string;           // display ID like "2026-W07"
    weekDbId: string | null;  // UUID from weeks table
    weeklyChallenge: string;
    challengeProgress: string[]; // array of date strings (e.g., "2026-02-07")
    restDay: string | null;
    createdAt: string;
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
