import { create } from "zustand";
import type { Task, Priority, DayOfWeek, WeeklyReview } from "@/types";
import { getWeekDays, getWeekId } from "@/lib/week-utils";

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
    weekId: string;

    // All tasks (flat list, filtered by weekId/date for display)
    tasks: Task[];

    // Brain dump tasks (unscheduled)
    brainDumpTasks: Task[];

    // Weekly reviews
    reviews: WeeklyReview[];

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
    }) => void;
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

    // Selectors
    getTasksForDate: (date: string) => Task[];
    getDayColumns: () => { id: DayOfWeek; label: string; date: string; tasks: Task[] }[];
}

export const usePlannerStore = create<PlannerState>((set, get) => {
    const now = new Date();

    return {
        currentDate: now,
        weekId: getWeekId(now),
        tasks: [],
        brainDumpTasks: [],
        reviews: [],

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
        addTask: ({ title, date, priority = "medium", isBrainDump = false }) => {
            const state = get();
            const targetTasks = isBrainDump
                ? state.brainDumpTasks
                : state.tasks.filter((t) => t.date === date);

            const newTask: Task = {
                id: uid(),
                title,
                isCompleted: false,
                priority,
                isBrainDump,
                weekId: isBrainDump ? null : state.weekId,
                date: isBrainDump ? null : date,
                order: nextOrder(targetTasks),
                createdAt: new Date().toISOString(),
            };

            if (isBrainDump) {
                set((s) => ({ brainDumpTasks: [...s.brainDumpTasks, newTask] }));
            } else {
                set((s) => ({ tasks: [...s.tasks, newTask] }));
            }
        },

        updateTask: (id, updates) => {
            set((state) => ({
                tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
                brainDumpTasks: state.brainDumpTasks.map((t) =>
                    t.id === id ? { ...t, ...updates } : t,
                ),
            }));
        },

        deleteTask: (id) => {
            set((state) => ({
                tasks: state.tasks.filter((t) => t.id !== id),
                brainDumpTasks: state.brainDumpTasks.filter((t) => t.id !== id),
            }));
        },

        toggleComplete: (id) => {
            set((state) => ({
                tasks: state.tasks.map((t) =>
                    t.id === id ? { ...t, isCompleted: !t.isCompleted } : t,
                ),
                brainDumpTasks: state.brainDumpTasks.map((t) =>
                    t.id === id ? { ...t, isCompleted: !t.isCompleted } : t,
                ),
            }));
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
                    weekId: toDate ? state.weekId : null,
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
                    weekId: state.weekId,
                    date,
                    order: nextOrder(dateTasks),
                };

                return {
                    brainDumpTasks: state.brainDumpTasks.filter((t) => t.id !== taskId),
                    tasks: [...state.tasks, updated],
                };
            });
        },

        // ── Weekly Reviews ──
        saveReview: ({ good, bad, learned }) => {
            const state = get();
            const existing = state.reviews.find((r) => r.weekId === state.weekId);

            if (existing) {
                // Update existing review
                set((s) => ({
                    reviews: s.reviews.map((r) =>
                        r.weekId === s.weekId
                            ? { ...r, good, bad, learned, completedAt: new Date().toISOString() }
                            : r,
                    ),
                }));
            } else {
                // Create new review
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
        },

        getReviewForWeek: (weekId) => {
            return get().reviews.find((r) => r.weekId === weekId);
        },

        getAllReviews: () => {
            return get().reviews;
        },

        // ── Selectors ──
        getTasksForDate: (date) => {
            return get()
                .tasks.filter((t) => t.date === date)
                .sort((a, b) => a.order - b.order);
        },

        getDayColumns: () => {
            const state = get();
            const weekDays = getWeekDays(state.currentDate);

            return weekDays.map((day) => ({
                ...day,
                tasks: state.tasks
                    .filter((t) => t.date === day.date)
                    .sort((a, b) => a.order - b.order),
            }));
        },
    };
});
