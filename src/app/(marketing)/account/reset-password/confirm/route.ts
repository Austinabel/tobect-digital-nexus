import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * Step 2 of "forgot password": the link in the reset email lands here.
 * Accepts both link styles Supabase can send:
 *  - `?token_hash=…&type=recovery` (works on any device — recommended email template)
 *  - `?code=…` (default PKCE link — works in the browser that requested it)
 * On success the customer is signed in just long enough to choose a new password.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");
  const supabase = await supabaseServer();

  let ok = false;
  if (tokenHash && type === "recovery") {
    ok = !(await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error;
  } else if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  }

  return NextResponse.redirect(new URL(ok ? "/account/reset-password" : "/account/forgot-password?expired=1", request.url));
}
