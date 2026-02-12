import {
    PlannerGridSkeleton,
    BrainDumpSkeleton,
    ChallengeSkeleton,
} from "@/components/planner/planner-skeleton";

export default function PlannerLoading() {
    return (
        <div className="h-full flex flex-col gap-4 p-4 md:p-6 overflow-hidden">
            {/* Top Bar Skeleton */}
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between px-1">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-[200px] animate-pulse rounded-lg bg-slate-800/50" />
                </div>
                <div className="h-9 w-[120px] animate-pulse rounded-lg bg-slate-800/50" />
            </div>

            {/* Weekly Challenge Skeleton (Mobile/Desktop) */}
            <div className="shrink-0">
                <ChallengeSkeleton />
            </div>

            <div className="flex flex-1 gap-6 min-h-0">
                {/* Main Board Skeleton */}
                <div className="flex-1 min-w-0 h-full">
                    <PlannerGridSkeleton />
                </div>

                {/* Brain Dump Sidebar Skeleton (Desktop) */}
                <div className="hidden lg:flex flex-col w-[320px] shrink-0 gap-4">
                    <div className="h-full rounded-2xl border border-slate-800/50 bg-slate-950/30 p-4">
                        <BrainDumpSkeleton />
                    </div>
                </div>
            </div>
        </div>
    );
}
