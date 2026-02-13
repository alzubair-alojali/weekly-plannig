"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { usePlannerStore } from "@/lib/planner-store";
import { waitForAuth } from "@/lib/supabase";
import { getWeekId } from "@/lib/week-utils";
import { WeekNavigator } from "@/components/planner/week-navigator";
import { PlannerGrid } from "@/components/planner/planner-grid";
import { TaskEditDialog } from "@/components/planner/task-edit-dialog";
import { WeeklyReviewDialog } from "@/components/planner/weekly-review-dialog";
import { BrainDumpPanel } from "@/components/planner/brain-dump";
import { WeeklyChallengeInput } from "@/components/planner/weekly-challenge";
import {
    PlannerGridSkeleton,
    BrainDumpSkeleton,
    ChallengeSkeleton,
} from "@/components/planner/planner-skeleton";
import { TaskCopyDialog } from "@/components/planner/task-copy-dialog";
import type { Task } from "@/types";

export default function PlannerPage() {
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [copyingTask, setCopyingTask] = useState<Task | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [copyDialogOpen, setCopyDialogOpen] = useState(false);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [authReady, setAuthReady] = useState(false);
    const weekId = usePlannerStore((s) => s.weekId);
    const currentDate = usePlannerStore((s) => s.currentDate);
    const weekMetas = usePlannerStore((s) => s.weekMetas);
    const syncWeek = usePlannerStore((s) => s.syncWeek);
    const isSyncing = usePlannerStore((s) => s.isSyncing);
    const hasFetched = usePlannerStore((s) => s.hasFetched);
    const syncInFlight = useRef(false);
    const weeklyChallenge = useMemo(
        () => weekMetas.find((m) => m.weekId === weekId)?.weeklyChallenge ?? "",
        [weekMetas, weekId],
    );

    // Wait for Supabase auth to hydrate before doing anything
    useEffect(() => {
        let cancelled = false;
        waitForAuth().then((uid) => {
            if (!cancelled) {
                console.log("[PlannerPage] 🔑 Auth ready — user:", uid);
                setAuthReady(!!uid);
            }
        });

        // Check for date param
        const params = new URLSearchParams(window.location.search);
        const dateParam = params.get("date");
        if (dateParam) {
            const targetDate = new Date(dateParam);
            if (!isNaN(targetDate.getTime())) {
                usePlannerStore.setState({ currentDate: targetDate, weekId: getWeekId(targetDate) });
            }
        }

        return () => { cancelled = true; };
    }, []);

    // Fetch tasks from Supabase ONLY after auth is ready
    useEffect(() => {
        if (!authReady) return;
        if (syncInFlight.current) return;
        syncInFlight.current = true;

        console.log("[PlannerPage] 🔄 weekId changed →", weekId, "— triggering syncWeek");
        syncWeek(currentDate).finally(() => {
            syncInFlight.current = false;
        });
    }, [weekId, currentDate, authReady, syncWeek]);

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setDialogOpen(true);
    };

    const handleCopyTask = (task: Task) => {
        setCopyingTask(task);
        setCopyDialogOpen(true);
    };

    const isLoading = !authReady || isSyncing || !hasFetched;

    return (
        <div className="space-y-5">
            {/* Week Navigation Header */}
            <WeekNavigator />

            {/* Weekly Challenge */}
            {isLoading ? <ChallengeSkeleton /> : <WeeklyChallengeInput />}

            {/* Brain Dump (draggable items) */}
            {isLoading ? <BrainDumpSkeleton /> : <BrainDumpPanel />}

            {/* Responsive Grid Board */}
            {isLoading ? (
                <PlannerGridSkeleton />
            ) : (
                <PlannerGrid
                    onEditTask={handleEditTask}
                    onCopyTask={handleCopyTask}
                    weeklyChallenge={weeklyChallenge || undefined}
                    onStartReview={() => setReviewOpen(true)}
                />
            )}

            {/* Task Edit Dialog */}
            <TaskEditDialog
                task={editingTask}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />

            {/* Weekly Review Dialog */}
            <WeeklyReviewDialog open={reviewOpen} onOpenChange={setReviewOpen} />

            {/* Task Copy Dialog */}
            <TaskCopyDialog
                task={copyingTask}
                open={copyDialogOpen}
                onOpenChange={setCopyDialogOpen}
            />
        </div>
    );
}
