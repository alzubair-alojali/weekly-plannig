import { createBrowserClient } from "@supabase/ssr";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/** Singleton browser client — reuses the same instance across all calls */
export function createClient() {
    if (browserClient) return browserClient;

    browserClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    return browserClient;
}

// ═══════════════════════════════════════════════════════
// Auth readiness — resolves once the session is hydrated
// ═══════════════════════════════════════════════════════

let authReadyPromise: Promise<string | null> | null = null;

/**
 * Returns a promise that resolves to the user ID once auth is hydrated.
 * Uses onAuthStateChange so we never call getUser/getSession before
 * the browser client has processed the cookie-based JWT.
 */
export function waitForAuth(): Promise<string | null> {
    if (authReadyPromise) return authReadyPromise;

    const supabase = createClient();

    authReadyPromise = new Promise<string | null>((resolve) => {
        // onAuthStateChange fires INITIAL_SESSION once hydrated
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event: AuthChangeEvent, session: Session | null) => {
                if (event === "INITIAL_SESSION" || event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
                    resolve(session?.user?.id ?? null);
                    // Don't unsubscribe — keep listening for sign-out
                }
                if (event === "SIGNED_OUT") {
                    // Reset so next call re-subscribes
                    authReadyPromise = null;
                    resolve(null);
                    subscription.unsubscribe();
                }
            },
        );

        // Safety fallback: if no event fires within 5s, resolve with null
        setTimeout(() => resolve(null), 5000);
    });

    return authReadyPromise;
}

/**
 * Reset auth state (call on sign-out so the next login re-hydrates).
 */
export function resetAuthState() {
    authReadyPromise = null;
}
