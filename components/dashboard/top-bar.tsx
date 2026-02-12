"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { format, getWeek } from "date-fns";
import { ar } from "date-fns/locale";

export function TopBar() {
    const [name, setName] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        setMounted(true);
        setCurrentDate(new Date());

        const supabase = createClient();
        const fetchUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (data.user) {
                // Extract name from metadata
                const fullName =
                    data.user.user_metadata?.full_name ||
                    data.user.user_metadata?.name;
                if (fullName) setName(fullName);
            }
        };

        fetchUser();
    }, []);

    // Prevent hydration mismatch for date/time
    if (!mounted) return <header className="h-24 w-full border-b border-slate-800 bg-slate-900/50" />;

    const formattedDate = format(currentDate, "EEEE، d MMMM yyyy", { locale: ar });
    // Using date-fns default week calculation. For Arabic locale specific (starts Sat),
    // we can pass weekStartsOn: 6 if strictly needed, but standard ISO or locale default is usually fine for display.
    // date-fns/locale/ar usually implies correct starting day.
    const weekNumber = getWeek(currentDate, { locale: ar });

    return (
        <header
            className={cn(
                "relative z-20 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl",
                "flex flex-col gap-4 py-8 px-6 md:flex-row md:items-center md:h-36 md:py-0"
            )}
        >
            {/* 1. Greeting (Right / Start in RTL) */}
            <div className="flex flex-col gap-2 items-center md:items-start order-1">
                <h2 className="text-xl font-bold text-foreground">
                    {name ? `مرحباً، ${name}` : "مرحباً بك"}
                </h2>
                <p className="text-xs text-muted-foreground hidden md:block">
                    أتمنى لك يوماً مثمراً
                </p>
            </div>

            {/* 2. Centerpiece: Date & Week (Absolute Center on Desktop) */}
            <div className="order-2 flex flex-col items-center gap-5 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
                <div className="text-center">
                    <h1 className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-2xl font-black tracking-tight text-transparent sm:text-3xl">
                        {formattedDate}
                    </h1>
                </div>

                <div
                    className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-4 py-1",
                        "border border-primary/20 bg-primary/10 text-xs font-medium text-primary",
                        "shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)]"
                    )}
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                    </span>
                    <span>الأسبوع {weekNumber} من 52</span>
                </div>
            </div>

            {/* 3. Actions / Placeholder (Left / End in RTL) */}
            <div className="order-3 flex items-center gap-2 justify-center md:justify-end md:ms-auto">
                {/* Future actions: Notifications, User Menu, etc can go here */}
            </div>
        </header>
    );
}
