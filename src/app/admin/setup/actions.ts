"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { supabaseAdmin, supabaseServer } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/activity";

export interface SetupState {
  error?: string;
}

const MIN_TOKEN = 16;

export async function ownerExists(): Promise<boolean> {
  const { count } = await supabaseAdmin().from("staff_members").select("user_id", { count: "exact", head: true }).eq("role_key", "owner").eq("active", true);
  return (count ?? 0) > 0;
}

function sameSecret(a: string, b: string) {
  // hash first so lengths always match for the constant-time compare
  const h = (s: string) => createHash("sha256").update(s).digest();
  return timingSafeEqual(h(a), h(b));
}

/**
 * First-run only: the signed-in user who knows ADMIN_SETUP_TOKEN (set by
 * whoever controls the server's .env) becomes the owner. Disabled for good
 * once any active owner exists.
 */
export async function claimOwnership(_: SetupState | undefined, fd: FormData): Promise<SetupState> {
  const expected = process.env.ADMIN_SETUP_TOKEN ?? "";
  if (expected.length < MIN_TOKEN) return { error: `Setup is locked: set ADMIN_SETUP_TOKEN (at least ${MIN_TOKEN} characters) in the server's environment first.` };
  if (await ownerExists()) return { error: "Setup is already complete — an owner exists." };

  const { data } = await (await supabaseServer()).auth.getUser();
  if (!data.user) return { error: "Please sign in first." };
  if (!sameSecret(String(fd.get("token") ?? ""), expected)) return { error: "That setup code isn't correct." };

  const { error } = await supabaseAdmin().from("staff_members").upsert({ user_id: data.user.id, role_key: "owner", active: true }, { onConflict: "user_id" });
  if (error) return { error: "Couldn't complete setup. Please try again." };
  await logActivity({ userId: data.user.id, email: data.user.email ?? "" }, { action: "setup.owner", entityType: "staff", entityId: data.user.id, summary: `${data.user.email} became the site owner (first-run setup)` });
  redirect("/admin");
}
