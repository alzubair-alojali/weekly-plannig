"use client";

import { useState } from "react";
import { WeekNavigator } from "@/components/planner/week-navigator";
import { DesktopBoard } from "@/components/planner/desktop-board";
import { MobileBoard } from "@/components/planner/mobile-board";
import { TaskEditDialog } from "@/components/planner/task-edit-dialog";
import { WeeklyReviewDialog } from "@/components/planner/weekly-review-dialog";
import { BrainDumpPanel } from "@/components/planner/brain-dump";
import type { Task } from "@/types";

export default function PlannerPage() {
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [reviewOpen, setReviewOpen] = useState(false);

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Week Navigation Header */}
            <WeekNavigator onStartReview={() => setReviewOpen(true)} />

            {/* Brain Dump */}
            <BrainDumpPanel />

            {/* Desktop: Horizontal Kanban Board */}
            <DesktopBoard onEditTask={handleEditTask} />

            {/* Mobile: Tabbed Day View */}
            <MobileBoard onEditTask={handleEditTask} />

            {/* Task Edit Dialog */}
            <TaskEditDialog
                task={editingTask}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />

            {/* Weekly Review Dialog */}
            <WeeklyReviewDialog open={reviewOpen} onOpenChange={setReviewOpen} />
        </div>
    );
}
