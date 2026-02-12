import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
    // Base styles
    [
        "inline-flex items-center justify-center gap-2",
        "rounded-lg text-sm font-semibold",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        "cursor-pointer",
    ],
    {
        variants: {
            variant: {
                /** Primary action — electric blue with glow */
                glow: [
                    "bg-cyber-blue text-white",
                    "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
                    "hover:bg-cyber-blue-light hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]",
                    "active:shadow-[0_0_10px_rgba(59,130,246,0.2)]",
                ],
                /** Secondary solid */
                secondary: [
                    "bg-secondary text-secondary-foreground",
                    "border border-slate-700",
                    "hover:bg-slate-700 hover:border-slate-600",
                ],
                /** Ghost — transparent with hover */
                ghost: [
                    "text-muted-foreground",
                    "hover:bg-slate-800/50 hover:text-foreground",
                ],
                /** Destructive */
                destructive: [
                    "bg-destructive/10 text-destructive border border-destructive/20",
                    "hover:bg-destructive/20 hover:border-destructive/30",
                ],
                /** Outline */
                outline: [
                    "border border-slate-700 text-foreground bg-transparent",
                    "hover:bg-slate-800/50 hover:border-slate-600",
                ],
                /** Cyan accent */
                accent: [
                    "bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20",
                    "hover:bg-cyber-cyan/20 hover:border-cyber-cyan/30",
                    "shadow-[0_0_15px_rgba(6,182,212,0.1)]",
                    "hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]",
                ],
            },
            size: {
                sm: "h-8 px-3 text-xs",
                md: "h-10 px-4 text-sm",
                lg: "h-12 px-6 text-base",
                icon: "h-9 w-9",
            },
        },
        defaultVariants: {
            variant: "glow",
            size: "md",
        },
    }
);

export interface CyberButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> { }

const CyberButton = forwardRef<HTMLButtonElement, CyberButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);

CyberButton.displayName = "CyberButton";

export { CyberButton, buttonVariants };
