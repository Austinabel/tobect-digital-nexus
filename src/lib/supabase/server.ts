import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import ws from "ws";

/**
 * Supabase clients for server code only (server components, server
 * actions, route handlers). Never import this file from a client component:
 * `supabaseAdmin()` uses the secret key, which bypasses row-level security.
 *
 * `realtime.transport: ws` — supabase-js needs a WebSocket implementation
 * on Node 20 (Node 22+ has one built in).
 */
function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set (see .env.example)`);
  return v;
}

const realtime = { transport: ws as unknown as typeof WebSocket };

/** Acts as the signed-in visitor (or anonymous). Respects row-level security. */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"), {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a server component, where cookies are read-only; the proxy refreshes sessions instead.
        }
      },
    },
    realtime,
  });
}

/** Anonymous visitor's view (no cookies): public site data, governed by row-level security. */
export function supabasePublic() {
  return createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime,
  });
}

/** Full-access client for trusted server operations (sign-up, orders). Bypasses row-level security. */
export function supabaseAdmin() {
  return createClient(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SECRET_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime,
  });
}

/** The signed-in customer, verified with Supabase Auth (not just read from the cookie). */
export async function currentUser() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/** Same-site relative path only — prevents open redirects through `?next=`. */
export function safeNext(next: unknown, fallback = "/account"): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}
