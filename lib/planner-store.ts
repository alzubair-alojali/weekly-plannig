import { create } from "zustand";
import type { Task, Priority, DayOfWeek, WeeklyReview, WeekMeta } from "@/types";
import { getWeekDays, getWeekId } from "@/lib/week-utils";
import {
    fetchTasksForWeek,
    insertTask,
    updateTaskInDb,
    deleteTaskFromDb,
} from "@/lib/supabase-tasks";
import { getOrCreateWeek, updateWeekInDb } from "@/lib/supabase-weeks";

// ── Helper: generate unique ID ──
function uid(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Helper: calculate next order value ──
function nextOrder(tasks: Task[]): number {
    if (tasks.length === 0) return 1;
    return Math.max(...tasks.map((t) => t.order)) + 1;
}

// ── Helper: calculate order between two tasks (for DnD insertion) ──
function orderBetween(before: number | null, after: number | null): number {
    if (before === null && after === null) return 1;
    if (before === null) return (after as number) / 2;
    if (after === null) return (before as number) + 1;
    return (before + after) / 2;
}

// ── Store Shape ──
interface PlannerState {
    // Current week navigation
    currentDate: Date;
    weekId: string;        // Display ID like "2026-W07"
    weekDbId: string | null; // UUID from weeks table

    // Supabase sync
    isSyncing: boolean;
    hasFetched: boolean; // true once initial fetch completes for current week
    syncWeek: (date?: Date) => Promise<void>;

    // All tasks (flat list, filtered by weekId/date for display)
    tasks: Task[];

    // Brain dump tasks (unscheduled)
    brainDumpTasks: Task[];

    // Weekly reviews
    reviews: WeeklyReview[];

    // Week metadata (challenges, etc.)
    weekMetas: WeekMeta[];

    // ── Actions ──
    // Week navigation
    goToNextWeek: () => void;
    goToPrevWeek: () => void;
    goToToday: () => void;

    // Task CRUD
    addTask: (params: {
        title: string;
        date: string | null;
        priority?: Priority;
        isBrainDump?: boolean;
        startTime?: string | null;
        skipOptimistic?: boolean; // Internal use for duplication
    }) => void;
    // Duplication
    duplicateTask: (taskId: string, targetDate: string) => void;

    updateTask: (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => void;
    deleteTask: (id: string) => void;
    toggleComplete: (id: string) => void;

    // Drag & Drop
    moveTask: (params: {
        taskId: string;
        fromDate: string | null;
        toDate: string | null;
        newIndex: number;
    }) => void;

    // Brain dump -> scheduled
    scheduleTask: (taskId: string, date: string) => void;

    // Weekly Reviews
    saveReview: (review: { good: string; bad: string; learned: string }) => void;
    getReviewForWeek: (weekId: string) => WeeklyReview | undefined;
    getAllReviews: () => WeeklyReview[];

    // Weekly Challenge
    setWeeklyChallenge: (challenge: string) => void;
    toggleChallengeDay: (date: string) => void;
    getWeekMeta: (weekId: string) => WeekMeta | undefined;
    getWeeklyChallenge: () => string;
    getChallengeProgress: () => string[];
    getVisitedWeeks: () => { weekId: string; challenge: string; taskCount: number; completedCount: number; hasReview: boolean }[];

    // Selectors
    getTasksForDate: (date: string) => Task[];
    getDayColumns: () => { id: DayOfWeek; label: string; date: string; tasks: Task[] }[];
}

export const usePlannerStore = create<PlannerState>((set, get) => {
    const now = new Date();

    return {
        currentDate: now,
        weekId: getWeekId(now),
        weekDbId: null,
        isSyncing: false,
        hasFetched: false,
        tasks: [],
        brainDumpTasks: [],
        reviews: [],
        weekMetas: [],

        // ── Supabase Sync ──
        syncWeek: async (overrideDate?: Date) => {
            const dateToUse = overrideDate ?? get().currentDate;
            set({ isSyncing: true });
            try {
                // Step 1: Resolve week UUID from weeks table (creates if needed)
                const weekRow = await getOrCreateWeek(dateToUse);
                if (!weekRow) {
                    console.error("[Store] ❌ Could not resolve week — auth missing?");
                    return;
                }

                const weekDbId = weekRow.id;
                set({ weekDbId });

                // Step 2: Fetch tasks using the week UUID
                const { tasks, brainDump } = await fetchTasksForWeek(weekDbId);

                // Preserve optimistic tasks with temp- IDs (pending inserts)
                const pendingTasks = get().tasks.filter((t) => t.id.startsWith("temp-"));
                const pendingBrainDump = get().brainDumpTasks.filter((t) => t.id.startsWith("temp-"));

                // Step 3: Load week metadata (challenge, review) from weeks table
                const displayWeekId = getWeekId(dateToUse);
                const existingMeta = get().weekMetas.find((m) => m.weekId === displayWeekId);
                const updatedMetas = existingMeta
                    ? get().weekMetas.map((m) =>
                        m.weekId === displayWeekId
                            ? {
                                ...m,
                                weekDbId,
                                weeklyChallenge: weekRow.weekly_challenge ?? m.weeklyChallenge,
                                challengeProgress: weekRow.challenge_progress ?? m.challengeProgress ?? [],
                            }
                            : m,
                    )
                    : [
                        ...get().weekMetas,
                        {
                            weekId: displayWeekId,
                            weekDbId,
                            weeklyChallenge: weekRow.weekly_challenge ?? "",
                            challengeProgress: weekRow.challenge_progress ?? [],
                            createdAt: weekRow.created_at,
                        },
                    ];

                // Load review from weeks table if available
                const reviews = [...get().reviews];
                if (weekRow.review_good || weekRow.review_bad || weekRow.review_learned) {
                    const existingReview = reviews.find((r) => r.weekId === displayWeekId);
                    if (!existingReview) {
                        reviews.push({
                            id: weekRow.id,
                            weekId: displayWeekId,
                            good: weekRow.review_good ?? "",
                            bad: weekRow.review_bad ?? "",
                            learned: weekRow.review_learned ?? "",
                            completedAt: weekRow.created_at,
                        });
                    }
                }

                set({
                    tasks: [...tasks, ...pendingTasks],
                    brainDumpTasks: [...brainDump, ...pendingBrainDump],
                    hasFetched: true,
                    weekMetas: updatedMetas,
                    reviews,
                });
            } catch (err) {
                console.error("[Store] ❌ syncWeek error:", err);
            } finally {
                set({ isSyncing: false });
            }
        },

        // ── Week Navigation ──
        goToNextWeek: () => {
            set((state) => {
                const next = new Date(state.currentDate);
                next.setDate(next.getDate() + 7);
                return { currentDate: next, weekId: getWeekId(next) };
            });
        },

        goToPrevWeek: () => {
            set((state) => {
                const prev = new Date(state.currentDate);
                prev.setDate(prev.getDate() - 7);
                return { currentDate: prev, weekId: getWeekId(prev) };
            });
        },

        goToToday: () => {
            const today = new Date();
            set({ currentDate: today, weekId: getWeekId(today) });
        },

        // ── Task CRUD ──
        addTask: ({ title, date, priority = "medium", isBrainDump = false, startTime = null, skipOptimistic = false }) => {
            const state = get();
            const targetTasks = isBrainDump
                ? state.brainDumpTasks
                : state.tasks.filter((t) => t.date === date);

            // Temporary optimistic ID (prefixed so we can identify it)
            const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

            const newTask: Task = {
                id: tempId,
                title,
                isCompleted: false,
                priority,
                startTime,
                isBrainDump,
                weekId: isBrainDump ? null : state.weekDbId,  // Use week UUID
                date: isBrainDump ? null : date,
                order: nextOrder(targetTasks),
                createdAt: new Date().toISOString(),
            };

            // Optimistic update — task appears immediately
            if (isBrainDump) {
                set((s) => ({ brainDumpTasks: [...s.brainDumpTasks, newTask] }));
            } else {
                const hasWeekMeta = state.weekMetas.some((m) => m.weekId === state.weekId);
                set((s) => ({
                    tasks: [...s.tasks, newTask],
                    ...(hasWeekMeta
                        ? {}
                        : {
                            weekMetas: [
                                ...s.weekMetas,
                                { weekId: s.weekId, weekDbId: s.weekDbId, weeklyChallenge: "", challengeProgress: [], createdAt: new Date().toISOString() },
                            ],
                        }),
                }));
            }

            // Persist to Supabase and swap temp ID → real DB UUID
            insertTask({
                title,
                priority,
                startTime,
                isBrainDump,
                weekId: newTask.weekId,   // week UUID (or null for brain dump)
                date: newTask.date,
                order: newTask.order,
                isCompleted: false,
            }).then((saved) => {
                if (!saved) {
                    console.error("[Store] ❌ Insert failed — removing optimistic task", tempId);
                    // Roll back optimistic update
                    set((s) => ({
                        tasks: s.tasks.filter((t) => t.id !== tempId),
                        brainDumpTasks: s.brainDumpTasks.filter((t) => t.id !== tempId),
                    }));
                    return;
                }
                // Replace temp task with the real one (has DB-generated UUID)
                set((s) => ({
                    tasks: s.tasks.map((t) => (t.id === tempId ? saved : t)),
                    brainDumpTasks: s.brainDumpTasks.map((t) => (t.id === tempId ? saved : t)),
                }));
                console.log("[Store] ✅ Swapped temp", tempId, "→ real", saved.id);
            }).catch((err) => {
                console.error("[Store] ❌ Insert threw:", err);
                set((s) => ({
                    tasks: s.tasks.filter((t) => t.id !== tempId),
                    brainDumpTasks: s.brainDumpTasks.filter((t) => t.id !== tempId),
                }));
            });
        },

        updateTask: (id, updates) => {
            set((state) => ({
                tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
                brainDumpTasks: state.brainDumpTasks.map((t) =>
                    t.id === id ? { ...t, ...updates } : t,
                ),
            }));
            // Sync to Supabase
            updateTaskInDb(id, updates as Partial<Task>);
        },

        deleteTask: (id) => {
            set((state) => ({
                tasks: state.tasks.filter((t) => t.id !== id),
                brainDumpTasks: state.brainDumpTasks.filter((t) => t.id !== id),
            }));
            // Sync to Supabase
            deleteTaskFromDb(id);
        },

        toggleComplete: (id) => {
            const task = get().tasks.find((t) => t.id === id) ?? get().brainDumpTasks.find((t) => t.id === id);
            set((state) => ({
                tasks: state.tasks.map((t) =>
                    t.id === id ? { ...t, isCompleted: !t.isCompleted } : t,
                ),
                brainDumpTasks: state.brainDumpTasks.map((t) =>
                    t.id === id ? { ...t, isCompleted: !t.isCompleted } : t,
                ),
            }));
            // Sync to Supabase
            if (task) updateTaskInDb(id, { isCompleted: !task.isCompleted });
        },

        duplicateTask: (taskId, targetDate) => {
            const state = get();
            const original = state.tasks.find((t) => t.id === taskId) ?? state.brainDumpTasks.find((t) => t.id === taskId);
            if (!original) return;

            // Reuse addTask logic but targeting new date
            get().addTask({
                title: original.title,
                date: targetDate,
                priority: original.priority,
                isBrainDump: false,
                startTime: original.startTime,
            });
        },

        // ── Drag & Drop ──
        moveTask: ({ taskId, fromDate: _fromDate, toDate, newIndex }) => {
            void _fromDate; // reserved for future API sync
            set((state) => {
                // Find the task in either list
                const task =
                    state.tasks.find((t) => t.id === taskId) ||
                    state.brainDumpTasks.find((t) => t.id === taskId);

                if (!task) return state;

                // Remove from old list
                let newTasks = state.tasks.filter((t) => t.id !== taskId);
                let newBrainDump = state.brainDumpTasks.filter((t) => t.id !== taskId);

                // Get target column tasks sorted by order
                const targetTasks = toDate
                    ? newTasks.filter((t) => t.date === toDate).sort((a, b) => a.order - b.order)
                    : newBrainDump.sort((a, b) => a.order - b.order);

                // Calculate new order
                const before = newIndex > 0 ? targetTasks[newIndex - 1]?.order ?? null : null;
                const after = targetTasks[newIndex]?.order ?? null;
                const newOrder = orderBetween(before, after);

                // Update the task
                const updatedTask: Task = {
                    ...task,
                    date: toDate,
                    isBrainDump: toDate === null,
                    weekId: toDate ? state.weekDbId : null,
                    order: newOrder,
                };

                // Add to new list
                if (toDate) {
                    newTasks = [...newTasks, updatedTask];
                } else {
                    newBrainDump = [...newBrainDump, updatedTask];
                }

                return { tasks: newTasks, brainDumpTasks: newBrainDump };
            });

            // Sync to Supabase (fire-and-forget)
            const state = get();
            const moved = state.tasks.find((t) => t.id === taskId) ?? state.brainDumpTasks.find((t) => t.id === taskId);
            if (moved) {
                updateTaskInDb(taskId, {
                    date: moved.date,
                    isBrainDump: moved.isBrainDump,
                    weekId: moved.weekId,
                    order: moved.order,
                });
            }
        },

        // ── Brain Dump → Scheduled ──
        scheduleTask: (taskId, date) => {
            set((state) => {
                const task = state.brainDumpTasks.find((t) => t.id === taskId);
                if (!task) return state;

                const dateTasks = state.tasks.filter((t) => t.date === date);
                const updated: Task = {
                    ...task,
                    isBrainDump: false,
                    weekId: state.weekDbId,
                    date,
                    order: nextOrder(dateTasks),
                };

                return {
                    brainDumpTasks: state.brainDumpTasks.filter((t) => t.id !== taskId),
                    tasks: [...state.tasks, updated],
                };
            });

            // Sync to Supabase
            const state = get();
            const scheduled = state.tasks.find((t) => t.id === taskId);
            if (scheduled) {
                updateTaskInDb(taskId, {
                    isBrainDump: false,
                    weekId: scheduled.weekId,
                    date: scheduled.date,
                    order: scheduled.order,
                });
            }
        },

        // ── Weekly Reviews ──
        saveReview: ({ good, bad, learned }) => {
            const state = get();
            const existing = state.reviews.find((r) => r.weekId === state.weekId);

            if (existing) {
                set((s) => ({
                    reviews: s.reviews.map((r) =>
                        r.weekId === s.weekId
                            ? { ...r, good, bad, learned, completedAt: new Date().toISOString() }
                            : r,
                    ),
                }));
            } else {
                const newReview: WeeklyReview = {
                    id: uid(),
                    weekId: state.weekId,
                    good,
                    bad,
                    learned,
                    completedAt: new Date().toISOString(),
                };
                set((s) => ({ reviews: [...s.reviews, newReview] }));
            }

            // Persist to weeks table
            if (state.weekDbId) {
                updateWeekInDb(state.weekDbId, {
                    review_good: good,
                    review_bad: bad,
                    review_learned: learned,
                });
            }
        },

        getReviewForWeek: (weekId) => {
            return get().reviews.find((r) => r.weekId === weekId);
        },

        getAllReviews: () => {
            return get().reviews;
        },

        // ── Weekly Challenge ──
        setWeeklyChallenge: (challenge) => {
            const state = get();
            const existing = state.weekMetas.find((m) => m.weekId === state.weekId);
            if (existing) {
                set((s) => ({
                    weekMetas: s.weekMetas.map((m) =>
                        m.weekId === s.weekId ? { ...m, weeklyChallenge: challenge } : m,
                    ),
                }));
            } else {
                set((s) => ({
                    weekMetas: [
                        ...s.weekMetas,
                        { weekId: s.weekId, weekDbId: s.weekDbId, weeklyChallenge: challenge, challengeProgress: [], createdAt: new Date().toISOString() },
                    ],
                }));
            }

            // Persist to weeks table
            if (state.weekDbId) {
                updateWeekInDb(state.weekDbId, { weekly_challenge: challenge });
            }
        },

        toggleChallengeDay: (date: string) => {
            const state = get();
            const meta = state.weekMetas.find((m) => m.weekId === state.weekId);
            const current = meta?.challengeProgress ?? [];
            const updated = current.includes(date)
                ? current.filter((d) => d !== date)
                : [...current, date];

            if (meta) {
                set((s) => ({
                    weekMetas: s.weekMetas.map((m) =>
                        m.weekId === s.weekId ? { ...m, challengeProgress: updated } : m,
                    ),
                }));
            } else {
                set((s) => ({
                    weekMetas: [
                        ...s.weekMetas,
                        { weekId: s.weekId, weekDbId: s.weekDbId, weeklyChallenge: "", challengeProgress: updated, createdAt: new Date().toISOString() },
                    ],
                }));
            }

            // Persist to weeks table
            if (state.weekDbId) {
                updateWeekInDb(state.weekDbId, { challenge_progress: updated });
            }
        },

        getWeekMeta: (weekId) => {
            return get().weekMetas.find((m) => m.weekId === weekId);
        },

        getWeeklyChallenge: () => {
            const state = get();
            return state.weekMetas.find((m) => m.weekId === state.weekId)?.weeklyChallenge ?? "";
        },

        getChallengeProgress: () => {
            const state = get();
            return state.weekMetas.find((m) => m.weekId === state.weekId)?.challengeProgress ?? [];
        },

        getVisitedWeeks: () => {
            const state = get();
            // Collect all unique weekIds from tasks, reviews, and weekMetas
            const weekIds = new Set<string>();
            state.tasks.forEach((t) => { if (t.weekId) weekIds.add(t.weekId); });
            state.reviews.forEach((r) => weekIds.add(r.weekId));
            state.weekMetas.forEach((m) => weekIds.add(m.weekId));

            return Array.from(weekIds)
                .sort((a, b) => b.localeCompare(a)) // newest first
                .map((wid) => {
                    const weekTasks = state.tasks.filter((t) => t.weekId === wid);
                    return {
                        weekId: wid,
                        challenge: state.weekMetas.find((m) => m.weekId === wid)?.weeklyChallenge ?? "",
                        taskCount: weekTasks.length,
                        completedCount: weekTasks.filter((t) => t.isCompleted).length,
                        hasReview: state.reviews.some((r) => r.weekId === wid),
                    };
                });
        },

        // ── Selectors ──
        getTasksForDate: (date) => {
            return get()
                .tasks.filter((t) => t.date === date)
                .sort((a, b) => {
                    // 1. Meetings first (checking startTime or priority)
                    const aIsMeeting = a.startTime || a.priority === "meeting";
                    const bIsMeeting = b.startTime || b.priority === "meeting";

                    if (aIsMeeting && !bIsMeeting) return -1;
                    if (!aIsMeeting && bIsMeeting) return 1;

                    // If both are meetings, sort by time if available
                    if (aIsMeeting && bIsMeeting && a.startTime && b.startTime) {
                        return a.startTime.localeCompare(b.startTime);
                    }

                    // 2. Priority: High > Medium > Low
                    const pOrder = { high: 0, medium: 1, low: 2, meeting: -1 }; // meeting handled above generally
                    const pa = pOrder[a.priority as keyof typeof pOrder] ?? 1;
                    const pb = pOrder[b.priority as keyof typeof pOrder] ?? 1;
                    if (pa !== pb) return pa - pb;

                    // 3. Manual Order
                    return a.order - b.order;
                });
        },

        getDayColumns: () => {
            const state = get();
            const weekDays = getWeekDays(state.currentDate);

            // Re-use sorting logic
            const sortTasks = (tasks: Task[]) => {
                return tasks.sort((a, b) => {
                     // 1. Meetings
                     const aIsMeeting = a.startTime || a.priority === "meeting";
                     const bIsMeeting = b.startTime || b.priority === "meeting";
                     if (aIsMeeting && !bIsMeeting) return -1;
                     if (!aIsMeeting && bIsMeeting) return 1;
 
                     if (aIsMeeting && bIsMeeting && a.startTime && b.startTime) {
                         return a.startTime.localeCompare(b.startTime);
                     }
 
                     // 2. Priority
                     const pOrder = { high: 0, medium: 1, low: 2, meeting: -1 };
                     const pa = pOrder[a.priority as keyof typeof pOrder] ?? 1;
                     const pb = pOrder[b.priority as keyof typeof pOrder] ?? 1;
                     if (pa !== pb) return pa - pb;
 
                     // 3. Order
                     return a.order - b.order;
                });
            };

            return weekDays.map((day) => ({
                ...day,
                tasks: sortTasks(state.tasks.filter((t) => t.date === day.date)),
            }));
        },
    };
});
