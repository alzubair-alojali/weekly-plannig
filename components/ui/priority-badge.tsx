import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import type { Priority } from "@/types";

const badgeVariants = cva(
    [
        "inline-flex items-center gap-1",
        "rounded-full px-2.5 py-0.5",
        "text-[11px] font-semibold leading-none",
        "border",
    ],
    {
        variants: {
            priority: {
                high: [
                    "bg-priority-high/10 text-priority-high border-priority-high/20",
                ],
                medium: [
                    "bg-priority-medium/10 text-priority-medium border-priority-medium/20",
                ],
                low: [
                    "bg-priority-low/10 text-priority-low border-priority-low/20",
                ],
                meeting: [
                    "bg-priority-meeting/10 text-priority-meeting border-priority-meeting/20",
                ],
            },
        },
        defaultVariants: {
            priority: "medium",
        },
    }
);

const priorityLabels: Record<Priority, string> = {
    high: "عالي",
    medium: "متوسط",
    low: "منخفض",
    meeting: "اجتماع",
};

interface PriorityBadgeProps
    extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
    priority: Priority;
    /** Show a dot indicator before the label */
    dot?: boolean;
}

function PriorityBadge({
    priority,
    dot = true,
    className,
    ...props
}: PriorityBadgeProps) {
    return (
        <span
            className={cn(badgeVariants({ priority, className }))}
            {...props}
        >
            {dot && (
                <span
                    className={cn("h-1.5 w-1.5 rounded-full", {
                        "bg-priority-high": priority === "high",
                        "bg-priority-medium": priority === "medium",
                        "bg-priority-low": priority === "low",
                        "bg-priority-meeting": priority === "meeting",
                    })}
                />
            )}
            {priorityLabels[priority]}
        </span>
    );
}

export { PriorityBadge, badgeVariants };
