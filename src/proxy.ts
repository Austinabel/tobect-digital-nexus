import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import ws from "ws";

/**
 * Keeps the customer's Supabase session fresh on the pages that use it
 * (account and checkout). Proxy (Next.js 16's name for middleware) runs on
 * the Node.js runtime. Authorization itself happens in the pages and server
 * actions, never here.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
    realtime: { transport: ws as unknown as typeof WebSocket },
  });
  // Refreshes an expiring access token and writes the new cookies.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/solar-calculator", "/admin/:path*"],
};
