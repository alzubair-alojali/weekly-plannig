import { createClient, waitForAuth } from "@/lib/supabase";
import { getWeekStart, getWeekEnd, getWeekNumber, getWeekYearNum } from "@/lib/week-utils";
import { format } from "date-fns";
import type { WeekRow } from "@/types";

// ═══════════════════════════════════════════════════════
// Weeks Table — find or create week records
// ═══════════════════════════════════════════════════════

// Cache: "userId-year-weekNumber" → WeekRow
const weekCache = new Map<string, WeekRow>();

/**
 * Find or create a week record for the given date.
 * Returns the full WeekRow (with UUID) or null on auth failure.
 */
export async function getOrCreateWeek(date: Date): Promise<WeekRow | null> {
    const userId = await waitForAuth();
    if (!userId) {
        console.error("[Weeks] ❌ No auth — cannot resolve week");
        return null;
    }

    const weekNumber = getWeekNumber(date);
    const year = getWeekYearNum(date);
    const cacheKey = `${userId}-${year}-${weekNumber}`;

    // Check cache first
    const cached = weekCache.get(cacheKey);
    if (cached) return cached;

    const supabase = createClient();

    // Try to find existing week
    const { data: existing, error: findError } = await supabase
        .from("weeks")
        .select("*")
        .eq("user_id", userId)
        .eq("week_number", weekNumber)
        .eq("year", year)
        .maybeSingle();

    if (findError) {
        console.error("[Weeks] ❌ Find error:", findError.message, findError.details);
    }

    if (existing) {
        console.log("[Weeks] ✅ Found existing week:", existing.id, `W${weekNumber}/${year}`);
        weekCache.set(cacheKey, existing as WeekRow);
        return existing as WeekRow;
    }

    // Create new week record
    const weekStart = getWeekStart(date);
    const weekEnd = getWeekEnd(date);

    const payload = {
        user_id: userId,
        week_number: weekNumber,
        year: year,
        start_date: format(weekStart, "yyyy-MM-dd"),
        end_date: format(weekEnd, "yyyy-MM-dd"),
    };

    console.log("[Weeks] ➕ Creating week:", JSON.stringify(payload));

    const { data: created, error: createError } = await supabase
        .from("weeks")
        .insert(payload)
        .select()
        .single();

    if (createError || !created) {
        console.error("[Weeks] ❌ Create error:", createError?.message, createError?.details, createError?.hint);

        // Might have been created by a concurrent request — try fetching again
        const { data: retry } = await supabase
            .from("weeks")
            .select("*")
            .eq("user_id", userId)
            .eq("week_number", weekNumber)
            .eq("year", year)
            .maybeSingle();

        if (retry) {
            console.log("[Weeks] ✅ Found on retry:", retry.id);
            weekCache.set(cacheKey, retry as WeekRow);
            return retry as WeekRow;
        }

        return null;
    }

    console.log("[Weeks] ✅ Created week:", created.id);
    weekCache.set(cacheKey, created as WeekRow);
    return created as WeekRow;
}

/**
 * Update a week record (challenge, review fields).
 */
export async function updateWeekInDb(
    weekDbId: string,
    updates: {
        weekly_challenge?: string;
        review_good?: string;
        review_bad?: string;
        review_learned?: string;
    },
): Promise<boolean> {
    const supabase = createClient();

    const { error } = await supabase.from("weeks").update(updates).eq("id", weekDbId);

    if (error) {
        console.error("[Weeks] ❌ Update error:", error.message);
        return false;
    }
    console.log("[Weeks] ✅ Updated:", weekDbId);
    return true;
}

/**
 * Fetch all weeks for the current user (for archive/history views).
 */
export async function fetchAllWeeks(): Promise<WeekRow[]> {
    const userId = await waitForAuth();
    if (!userId) return [];

    const supabase = createClient();
    const { data, error } = await supabase
        .from("weeks")
        .select("*")
        .eq("user_id", userId)
        .order("year", { ascending: false })
        .order("week_number", { ascending: false });

    if (error) {
        console.error("[Weeks] ❌ Fetch all error:", error.message);
        return [];
    }

    return (data ?? []) as WeekRow[];
}
