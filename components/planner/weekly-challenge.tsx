"use client";

import { useState, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { usePlannerStore } from "@/lib/planner-store";
import { Trophy, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function WeeklyChallengeInput() {
    const weekId = usePlannerStore((s) => s.weekId);
    const weekMetas = usePlannerStore((s) => s.weekMetas);
    const setWeeklyChallenge = usePlannerStore((s) => s.setWeeklyChallenge);

    const savedChallenge = useMemo(
        () => weekMetas.find((m) => m.weekId === weekId)?.weeklyChallenge ?? "",
        [weekMetas, weekId],
    );

    // Use key pattern from parent (keyed on weekId) — this component is
    // remounted when weekId changes, so initial state is always fresh.
    return <ChallengeForm key={weekId} savedChallenge={savedChallenge} setWeeklyChallenge={setWeeklyChallenge} />;
}

function ChallengeForm({
    savedChallenge,
    setWeeklyChallenge,
}: {
    savedChallenge: string;
    setWeeklyChallenge: (challenge: string) => void;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(savedChallenge);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        setWeeklyChallenge(draft.trim());
        setIsEditing(false);
    };

    const handleCancel = () => {
        setDraft(savedChallenge);
        setIsEditing(false);
    };

    // If no challenge set — show prompt
    if (!savedChallenge && !isEditing) {
        return (
            <button
                onClick={() => {
                    setIsEditing(true);
                    setTimeout(() => inputRef.current?.focus(), 50);
                }}
                className={cn(
                    "flex items-center gap-2.5 rounded-xl border border-dashed border-amber-500/20 px-4 py-2.5",
                    "bg-amber-500/5 text-amber-400/60 transition-all hover:border-amber-500/30 hover:text-amber-400/80",
                    "cursor-pointer w-full",
                )}
            >
                <Trophy className="h-4 w-4" />
                <span className="text-sm font-medium">حدد تحدي الأسبوع...</span>
            </button>
        );
    }

    // Editing mode
    if (isEditing) {
        return (
            <div
                className={cn(
                    "flex items-center gap-2 rounded-xl border border-amber-500/30 px-3 py-2",
                    "bg-amber-500/5",
                )}
            >
                <Trophy className="h-4 w-4 text-amber-400 shrink-0" />
                <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    autoFocus
                    placeholder="مثال: بدون سكر لمدة أسبوع"
                    className={cn(
                        "flex-1 bg-transparent text-sm text-foreground placeholder:text-amber-400/40",
                        "outline-none",
                    )}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave();
                        if (e.key === "Escape") handleCancel();
                    }}
                />
                <button
                    onClick={handleSave}
                    className="rounded-md p-1 text-cyber-neon hover:bg-cyber-neon/10 transition-colors cursor-pointer"
                >
                    <Check className="h-4 w-4" />
                </button>
                <button
                    onClick={handleCancel}
                    className="rounded-md p-1 text-slate-500 hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }

    // Display mode — show saved challenge
    return (
        <AnimatePresence mode="wait">
            <motion.button
                key={savedChallenge}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                    setIsEditing(true);
                    setDraft(savedChallenge);
                }}
                className={cn(
                    "flex items-center gap-2.5 rounded-xl border border-amber-500/20 px-4 py-2.5 w-full",
                    "bg-linear-to-l from-amber-500/5 to-transparent",
                    "transition-all hover:border-amber-500/30",
                    "cursor-pointer group",
                )}
            >
                <Trophy className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-400/90 flex-1 text-start truncate">
                    {savedChallenge}
                </span>
                <span className="text-[10px] text-amber-400/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    تعديل
                </span>
            </motion.button>
        </AnimatePresence>
    );
}
