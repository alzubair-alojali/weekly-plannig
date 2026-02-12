"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./sidebar";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";

export function MobileSidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button
                    className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        "text-muted-foreground transition-colors",
                        "hover:bg-slate-800/50 hover:text-foreground",
                        "cursor-pointer",
                    )}
                    aria-label="فتح القائمة"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </SheetTrigger>

            <SheetContent
                side="right"
                className="w-72 border-e border-sidebar-border bg-sidebar/95 backdrop-blur-xl p-0"
            >
                <SheetHeader className="border-b border-sidebar-border px-4 py-4">
                    <SheetTitle className="flex items-center gap-3 text-foreground">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg overflow-hidden">
                            <Image
                                src="/logo.png"
                                alt="المخطط الأسبوعي"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        </div>
                        <span className="text-base font-bold">المخطط الأسبوعي</span>
                    </SheetTitle>
                </SheetHeader>

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
                                onClick={() => setOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "text-cyber-blue bg-cyber-blue/10 border border-cyber-blue/20"
                                        : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "h-5 w-5 shrink-0",
                                        isActive ? "text-cyber-blue" : "text-muted-foreground",
                                    )}
                                />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </SheetContent>
        </Sheet>
    );
}
