"use client";

import { usePathname } from "next/navigation";
import { MobileSidebar } from "./mobile-sidebar";
import { navItems } from "./sidebar";

const pageTitles: Record<string, string> = {
    "/": "لوحة التحكم",
    "/planner": "المخطط",
    "/archive": "الأرشيف",
    "/settings": "الإعدادات",
};

export function TopBar() {
    const pathname = usePathname();

    // Find matching page title
    const currentNav = navItems.find((item) =>
        item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
    );
    const title = currentNav
        ? pageTitles[currentNav.href] || currentNav.label
        : "المخطط الأسبوعي";

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-4 md:px-6">
            {/* Mobile menu trigger + Page title */}
            <div className="flex items-center gap-3">
                <div className="md:hidden">
                    <MobileSidebar />
                </div>
                <h1 className="text-lg font-bold text-foreground">{title}</h1>
            </div>

            {/* Right side — placeholder for future actions (notifications, profile, etc.) */}
            <div className="flex items-center gap-2">
                {/* Future: notification bell, user avatar */}
            </div>
        </header>
    );
}
