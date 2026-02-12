import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
    return (
        <div className="mx-auto max-w-4xl p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-4 w-96" />
            </div>

            {/* Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Data Management Card */}
                <div className="rounded-2xl border border-slate-800/50 bg-slate-950/30 p-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Skeleton className="h-10 flex-1 rounded-lg" />
                        <Skeleton className="h-10 flex-1 rounded-lg" />
                    </div>
                    <Skeleton className="h-10 w-full rounded-lg" />
                </div>

                {/* About Card */}
                <div className="rounded-2xl border border-slate-800/50 bg-slate-950/30 p-6 space-y-6">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
