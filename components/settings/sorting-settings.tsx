"use client";

import { useState, useEffect } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { usePlannerStore } from "@/lib/planner-store";
import { GripVertical, Clock, Flag, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";

const sortOptions = [
    { id: "meeting", label: "المواعيد والاجتماعات", icon: Clock },
    { id: "priority", label: "الأولوية (مرتفع > منخفض)", icon: Flag },
    { id: "order", label: "ترتيب يدوي", icon: ListOrdered },
];

export function SortingSettings() {
    const preferences = usePlannerStore((s) => s.sortPreferences);
    const updatePreferences = usePlannerStore((s) => s.updateSortPreferences);
    const [items, setItems] = useState(preferences);

    // Sync local state if store changes externally
    useEffect(() => {
        setItems(preferences);
    }, [preferences]);

    const handleReorder = (newOrder: string[]) => {
        setItems(newOrder);
        updatePreferences(newOrder);
    };

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground">ترتيب المهام</h3>
            <p className="text-xs text-muted-foreground">
                اسحب العناصر لترتيب أولويات عرض المهام في عمود اليوم.
            </p>

            <Reorder.Group
                axis="y"
                values={items}
                onReorder={handleReorder}
                className="space-y-2"
            >
                {items.map((item) => {
                    const option = sortOptions.find((o) => o.id === item);
                    if (!option) return null;
                    const Icon = option.icon;

                    return (
                        <Reorder.Item
                            key={item}
                            value={item}
                            className={cn(
                                "flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/30 p-3",
                                "cursor-grab active:cursor-grabbing hover:border-slate-700 hover:bg-slate-900/50"
                            )}
                        >
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                            <div className="flexh-8 w-8 items-center justify-center rounded-md bg-slate-800">
                                <Icon className="h-4 w-4 text-cyber-blue" />
                            </div>
                            <span className="text-sm font-medium text-foreground">
                                {option.label}
                            </span>
                        </Reorder.Item>
                    );
                })}
            </Reorder.Group>
        </div>
    );
}
