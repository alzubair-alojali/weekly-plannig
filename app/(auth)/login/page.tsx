"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { CalendarDays, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        const supabase = createClient();

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (signInError) {
            console.error("[Auth] ❌ Sign in error:", signInError.message);
            setError(signInError.message);
        } else {
            // CRITICAL: Use full page navigation (not router.push)
            // so the middleware runs and sets the auth cookies properly.
            // router.push does a soft SPA navigation that leaves cookies stale.
            window.location.href = "/planner";
            return; // Don't setLoading(false) — we're navigating away
        }

        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div
                className={cn(
                    "w-full max-w-sm rounded-2xl border border-slate-800 p-8",
                    "bg-slate-950/80 backdrop-blur-xl",
                    "shadow-[0_0_80px_rgba(59,130,246,0.06)]",
                )}
            >
                {/* Logo */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-cyber-blue/15 text-cyber-blue">
                        <CalendarDays className="h-6 w-6" />
                    </div>
                    <h1 className="text-xl font-bold text-foreground">المخطط الأسبوعي</h1>
                    <p className="mt-1 text-xs text-muted-foreground">
                        تسجيل الدخول
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">
                            البريد الإلكتروني
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            dir="ltr"
                            className={cn(
                                "w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2.5",
                                "text-sm text-foreground placeholder:text-muted-foreground",
                                "outline-none transition-colors",
                                "focus:border-cyber-blue/40 focus:ring-1 focus:ring-cyber-blue/20",
                            )}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">
                            كلمة المرور
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            placeholder="••••••••"
                            dir="ltr"
                            className={cn(
                                "w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2.5",
                                "text-sm text-foreground placeholder:text-muted-foreground",
                                "outline-none transition-colors",
                                "focus:border-cyber-blue/40 focus:ring-1 focus:ring-cyber-blue/20",
                            )}
                        />
                    </div>

                    {error && (
                        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                            {error}
                        </p>
                    )}

                    {message && (
                        <p className="rounded-lg border border-cyber-blue/30 bg-cyber-blue/10 px-3 py-2 text-xs text-cyber-blue">
                            {message}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={cn(
                            "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5",
                            "bg-cyber-blue/15 text-sm font-semibold text-cyber-blue",
                            "border border-cyber-blue/30 transition-all",
                            "hover:bg-cyber-blue/25 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            "cursor-pointer",
                        )}
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        تسجيل الدخول
                    </button>
                </form>
            </div>
        </div>
    );
}
