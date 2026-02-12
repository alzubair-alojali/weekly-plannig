"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    CalendarDays,
    Archive,
    Settings,
    Plus,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { QuickAddModal } from "@/components/planner/quick-add-modal";

const bottomNavItems = [
    { label: "الرئيسية", href: "/", icon: LayoutDashboard },
    { label: "المخطط", href: "/planner", icon: CalendarDays },
    // Center slot is the Quick Add button (handled separately)
    { label: "الأسابيع", href: "/weeks", icon: Archive },
    { label: "الإعدادات", href: "/settings", icon: Settings },
] as const;

export function BottomNav() {
    const pathname = usePathname();
    const [quickAddOpen, setQuickAddOpen] = useState(false);

    // Split nav items: first 2 on left, last 2 on right (center = quick add)
    const leftItems = bottomNavItems.slice(0, 2);
    const rightItems = bottomNavItems.slice(2);

    return (
        <>
            <nav
                className={cn(
                    "fixed bottom-0 inset-x-0 z-40 md:hidden",
                    "border-t border-slate-800/80",
                    "bg-slate-950/80 backdrop-blur-xl",
                    "safe-area-bottom",
                )}
            >
                <div className="flex items-end justify-around px-2 pt-1.5 pb-2">
                    {/* Left nav items */}
                    {leftItems.map((item) => {
                        const isActive =
                            item.href === "/"
                                ? pathname === "/"
                                : pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors",
                                    isActive
                                        ? "text-cyber-blue"
                                        : "text-slate-500 active:text-slate-300",
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="text-[10px] font-medium">{item.label}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="bottom-nav-indicator"
                                        className="absolute -top-px start-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-cyber-blue"
                                        transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                                    />
                                )}
                            </Link>
                        );
                    })}

                    {/* Center Quick Add Button */}
                    <div className="relative -mt-5">
                        <button
                            onClick={() => setQuickAddOpen(true)}
                            className={cn(
                                "flex h-14 w-14 items-center justify-center rounded-full",
                                "bg-cyber-blue text-white shadow-[0_0_25px_rgba(59,130,246,0.3)]",
                                "transition-all duration-200 cursor-pointer",
                                "hover:bg-cyber-blue-light hover:shadow-[0_0_35px_rgba(59,130,246,0.4)]",
                                "active:scale-95",
                            )}
                            aria-label="إضافة سريعة"
                        >
                            <Plus className="h-7 w-7" />
                        </button>
                        {/* Glow ring */}
                        <div className="absolute inset-0 -z-10 rounded-full bg-cyber-blue/20 blur-md" />
                    </div>

                    {/* Right nav items */}
                    {rightItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors",
                                    isActive
                                        ? "text-cyber-blue"
                                        : "text-slate-500 active:text-slate-300",
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Quick Add Modal */}
            <QuickAddModal open={quickAddOpen} onOpenChange={setQuickAddOpen} />
        </>
    );
}
