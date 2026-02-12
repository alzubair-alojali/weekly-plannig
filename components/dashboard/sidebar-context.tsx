"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface SidebarState {
    collapsed: boolean;
    toggle: () => void;
    setCollapsed: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarState>({
    collapsed: false,
    toggle: () => { },
    setCollapsed: () => { },
});

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <SidebarContext.Provider
            value={{
                collapsed,
                toggle: () => setCollapsed((prev) => !prev),
                setCollapsed,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebarState() {
    return useContext(SidebarContext);
}
