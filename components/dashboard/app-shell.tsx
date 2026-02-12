"use client";

import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarProvider, useSidebarState } from "./sidebar-context";

interface AppShellProps {
    children: React.ReactNode;
}

function ShellContent({ children }: AppShellProps) {
    const { collapsed } = useSidebarState();

    return (
        <div className="flex min-h-screen">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main content — responsive offset */}
            <div
                className="flex flex-1 flex-col transition-[margin-inline-start] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] md:ms-(--sidebar-w)"
                style={
                    { "--sidebar-w": collapsed ? "72px" : "256px" } as React.CSSProperties
                }
            >
                <TopBar />
                <ScrollArea className="flex-1">
                    <main className="p-4 md:p-6">{children}</main>
                </ScrollArea>
            </div>
        </div>
    );
}

export function AppShell({ children }: AppShellProps) {
    return (
        <SidebarProvider>
            <ShellContent>{children}</ShellContent>
        </SidebarProvider>
    );
}
