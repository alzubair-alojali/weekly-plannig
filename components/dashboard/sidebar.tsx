"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    CalendarDays,
    Archive,
    Settings,
    ChevronLeft,
    ChevronRight,
    Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebarState } from "./sidebar-context";

// ── Navigation Items ──
export const navItems = [
    {
        label: "لوحة التحكم",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        label: "المخطط",
        href: "/planner",
        icon: CalendarDays,
    },
    {
        label: "الأرشيف",
        href: "/archive",
        icon: Archive,
    },
    {
        label: "الإعدادات",
        href: "/settings",
        icon: Settings,
    },
] as const;

// ── Desktop Sidebar Component ──
export function Sidebar() {
    const pathname = usePathname();
    const { collapsed, toggle } = useSidebarState();

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 72 : 256 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(
                "hidden md:flex flex-col",
                "fixed inset-y-0 start-0 z-30",
                "border-e border-sidebar-border",
                "bg-sidebar/80 backdrop-blur-xl",
            )}
        >
            {/* Logo / Brand */}
            <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyber-blue/10 text-cyber-blue">
                    <Zap className="h-5 w-5" />
                </div>
                <AnimatePresence mode="wait">
                    {!collapsed && (
                        <motion.span
                            key="logo-text"
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-base font-bold text-foreground whitespace-nowrap overflow-hidden"
                        >
                            المخطط الأسبوعي
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-1 p-3">
                {navItems.map((item) => {
                    const isActive =
                        item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "text-cyber-blue"
                                    : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
                            )}
                        >
                            {/* Active indicator bar */}
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute inset-0 rounded-lg bg-cyber-blue/10 border border-cyber-blue/20"
                                    transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
                                />
                            )}

                            <item.icon
                                className={cn(
                                    "h-5 w-5 shrink-0 relative z-10 transition-colors",
                                    isActive ? "text-cyber-blue" : "text-muted-foreground group-hover:text-foreground",
                                )}
                            />

                            <AnimatePresence mode="wait">
                                {!collapsed && (
                                    <motion.span
                                        key={item.href}
                                        initial={{ opacity: 0, width: 0 }}
                                        animate={{ opacity: 1, width: "auto" }}
                                        exit={{ opacity: 0, width: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="relative z-10 whitespace-nowrap overflow-hidden"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse Toggle */}
            <div className="border-t border-sidebar-border p-3">
                <button
                    onClick={toggle}
                    className={cn(
                        "flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5",
                        "text-muted-foreground transition-colors duration-200",
                        "hover:bg-sidebar-accent hover:text-foreground",
                        "cursor-pointer",
                    )}
                >
                    {collapsed ? (
                        <ChevronLeft className="h-4 w-4" />
                    ) : (
                        <>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-xs">طي القائمة</span>
                        </>
                    )}
                </button>
            </div>
        </motion.aside>
    );
}
