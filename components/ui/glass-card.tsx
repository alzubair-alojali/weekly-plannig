"use client";

import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    /** Add the electric blue glow effect */
    glow?: boolean;
    /** Make the card interactive (hover lift) */
    interactive?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, glow = false, interactive = false, children, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                className={cn(
                    // Glass surface
                    "rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-md",
                    // Padding
                    "p-4",
                    // Glow effect
                    glow && "glow-blue",
                    // Interactive hover
                    interactive && "transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/70",
                    className
                )}
                {...(interactive
                    ? {
                        whileHover: { y: -2, transition: { duration: 0.2 } },
                        whileTap: { scale: 0.98 },
                    }
                    : {})}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
