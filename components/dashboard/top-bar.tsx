"use client";

import { usePathname } from "next/navigation";
import { navItems } from "./sidebar";

const pageTitles: Record<string, string> = {
    "/": "لوحة التحكم",
    "/planner": "المخطط",
    "/archive": "الأرشيف",
    "/weeks": "الأسابيع",
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
        <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-4 md:px-6">
            {/* Page title */}
            <h1 className="text-lg font-bold text-foreground">{title}</h1>

            {/* Right side — placeholder for future actions */}
            <div className="flex items-center gap-2" />
        </header>
    );
}
