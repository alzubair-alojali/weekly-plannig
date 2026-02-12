import { createClient, waitForAuth } from "@/lib/supabase";
import type { Task, TaskRow, Priority } from "@/types";

// ═══════════════════════════════════════════════════════
// Supabase ↔ Frontend Task Mapping
// ═══════════════════════════════════════════════════════

/** Convert a Supabase row to a frontend Task */
export function rowToTask(row: TaskRow): Task {
    return {
        id: row.id,
        title: row.title,
        description: row.description ?? undefined,
        isCompleted: row.status === "completed",
        priority: row.priority as Priority,
        startTime: row.start_time,
        isBrainDump: row.is_brain_dump,
        weekId: row.week_id,           // UUID from weeks table
        date: row.task_date,
        order: row.position ?? 0,       // DB column is "position"
        createdAt: row.created_at,
        userId: row.user_id,
    };
}

/** Convert frontend Task fields to Supabase column names (for UPDATE) */
function taskFieldsToRow(updates: Partial<Task>) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row: Record<string, any> = {};
    if (updates.title !== undefined) row.title = updates.title;
    if (updates.description !== undefined) row.description = updates.description ?? null;
    if (updates.isCompleted !== undefined) row.status = updates.isCompleted ? "completed" : "pending";
    if (updates.priority !== undefined) row.priority = updates.priority;
    if (updates.startTime !== undefined) row.start_time = updates.startTime ?? null;
    if (updates.isBrainDump !== undefined) row.is_brain_dump = updates.isBrainDump;
    if (updates.weekId !== undefined) row.week_id = updates.weekId ?? null;
    if (updates.date !== undefined) row.task_date = updates.date ?? null;
    if (updates.order !== undefined) row.position = updates.order;
    return row;
}

// ═══════════════════════════════════════════════════════
// Auth helper
// ═══════════════════════════════════════════════════════

async function getCurrentUserId(): Promise<string | null> {
    const uid = await waitForAuth();
    if (uid) return uid;

    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        console.error("[Supabase] ❌ Auth failed:", error?.message ?? "no session");
        return null;
    }
    return user.id;
}

// ═══════════════════════════════════════════════════════
// CRUD Operations
// ═══════════════════════════════════════════════════════

/**
 * Fetch tasks for a given week UUID + all brain dump tasks.
 * @param weekDbId — The UUID from the weeks table (NOT "2026-W07")
 */
export async function fetchTasksForWeek(weekDbId: string): Promise<{ tasks: Task[]; brainDump: Task[] }> {
    const userId = await getCurrentUserId();
    if (!userId) return { tasks: [], brainDump: [] };

    const supabase = createClient();
    console.log("[Supabase] 🔑 Fetching tasks — user:", userId, "weekDbId:", weekDbId);

    // Scheduled tasks for this week
    const { data: weekTasks, error: weekError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("week_id", weekDbId)
        .eq("is_brain_dump", false)
        .order("position", { ascending: true });

    if (weekError) {
        console.error("[Supabase] ❌ Fetch week tasks:", weekError.message, weekError.details, weekError.hint);
    } else {
        console.log("[Supabase] ✅ Week tasks:", weekTasks?.length ?? 0);
    }

    // Brain dump (unscheduled) — not filtered by week
    const { data: brainDumpRows, error: bdError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", userId)
        .eq("is_brain_dump", true)
        .order("position", { ascending: true });

    if (bdError) {
        console.error("[Supabase] ❌ Fetch brain dump:", bdError.message);
    } else {
        console.log("[Supabase] ✅ Brain dump:", brainDumpRows?.length ?? 0);
    }

    return {
        tasks: (weekTasks ?? []).map(rowToTask),
        brainDump: (brainDumpRows ?? []).map(rowToTask),
    };
}

/**
 * Insert a NEW task into Supabase.
 * @param task.weekId — Must be the UUID from weeks table (or null for brain dump)
 */
export async function insertTask(task: {
    title: string;
    priority: string;
    startTime?: string | null;
    isBrainDump: boolean;
    weekId: string | null;       // UUID from weeks table
    date: string | null;
    order: number;
    description?: string | null;
    isCompleted?: boolean;
}): Promise<Task | null> {
    const userId = await getCurrentUserId();
    if (!userId) {
        console.error("[Supabase] ❌ INSERT aborted — no auth session");
        return null;
    }

    const supabase = createClient();

    const payload = {
        title: task.title,
        priority: task.priority,
        start_time: task.startTime ?? null,
        is_brain_dump: task.isBrainDump,
        week_id: task.weekId ?? null,      // UUID or null
        task_date: task.date ?? null,
        position: task.order,               // DB column is "position"
        description: task.description ?? null,
        status: (task.isCompleted ? "completed" : "pending") as string,
        user_id: userId,
    };

    console.log("[Supabase] ➕ Inserting:", task.title, JSON.stringify(payload));

    const { data, error } = await supabase
        .from("tasks")
        .insert(payload)
        .select()
        .single();

    if (!error && data) {
        console.log("[Supabase] ✅ Inserted — DB id:", data.id);
        return rowToTask(data as TaskRow);
    }

    if (error) {
        console.error("[Supabase] ❌ INSERT error:", error.code, error.message, error.details, error.hint);
    }

    return null;
}

/**
 * Update specific fields on an existing task.
 */
export async function updateTaskInDb(taskId: string, updates: Partial<Task>): Promise<boolean> {
    // Skip updates for temp IDs (optimistic tasks not yet persisted)
    if (taskId.startsWith("temp-")) {
        console.log("[Supabase] ⏭️ Skipping update for temp task:", taskId);
        return false;
    }

    const supabase = createClient();
    const row = taskFieldsToRow(updates);

    if (Object.keys(row).length === 0) return true;

    console.log("[Supabase] ✏️ Updating:", taskId, row);
    const { error } = await supabase.from("tasks").update(row).eq("id", taskId);

    if (error) {
        console.error("[Supabase] ❌ UPDATE error:", error.message, error.details);
        return false;
    }
    console.log("[Supabase] ✅ Updated");
    return true;
}

/**
 * Delete a task by ID.
 */
export async function deleteTaskFromDb(taskId: string): Promise<boolean> {
    // Skip deletes for temp IDs
    if (taskId.startsWith("temp-")) return false;

    const supabase = createClient();

    console.log("[Supabase] 🗑️ Deleting:", taskId);
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
        console.error("[Supabase] ❌ DELETE error:", error.message, error.details);
        return false;
    }
    console.log("[Supabase] ✅ Deleted");
    return true;
}

/**
 * Fetch task counts (total + completed) grouped by week_id.
 * Returns a map: weekDbId → { total, completed }
 */
export async function fetchTaskCountsByWeek(): Promise<Map<string, { total: number; completed: number }>> {
    const userId = await getCurrentUserId();
    if (!userId) return new Map();

    const supabase = createClient();
    const { data, error } = await supabase
        .from("tasks")
        .select("week_id, status")
        .eq("user_id", userId)
        .eq("is_brain_dump", false)
        .not("week_id", "is", null);

    if (error) {
        console.error("[Supabase] ❌ Fetch task counts:", error.message);
        return new Map();
    }

    const counts = new Map<string, { total: number; completed: number }>();
    for (const row of data ?? []) {
        const wid = row.week_id as string;
        const existing = counts.get(wid) ?? { total: 0, completed: 0 };
        existing.total++;
        if (row.status === "completed") existing.completed++;
        counts.set(wid, existing);
    }
    return counts;
}
