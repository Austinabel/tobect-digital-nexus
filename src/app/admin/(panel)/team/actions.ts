"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";

export interface TeamState {
  error?: string;
  ok?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function findUserByEmail(email: string) {
  const admin = supabaseAdmin();
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email);
    if (hit) return hit;
    if (data.users.length < 1000) return null;
  }
  return null;
}

async function roleExists(key: string) {
  const { data } = await supabaseAdmin().from("admin_roles").select("key, label").eq("key", key).maybeSingle();
  return data;
}

async function activeOwnerCount() {
  const { count } = await supabaseAdmin().from("staff_members").select("user_id", { count: "exact", head: true }).eq("role_key", "owner").eq("active", true);
  return count ?? 0;
}

export async function addStaff(_: TeamState | undefined, fd: FormData): Promise<TeamState> {
  const actor = await requirePermission("team.manage");
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const roleKey = String(fd.get("role") ?? "");
  if (!EMAIL.test(email)) return { error: "Enter a valid email address." };
  const role = await roleExists(roleKey);
  if (!role) return { error: "Choose a role." };

  const user = await findUserByEmail(email);
  if (!user) return { error: `No account uses ${email} yet. Ask them to create one at /account/register, then add them here.` };

  const { error } = await supabaseAdmin().from("staff_members").upsert({ user_id: user.id, role_key: roleKey, active: true, added_by: actor.userId, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  if (error) return { error: "Couldn't add this person. Please try again." };
  await logActivity(actor, { action: "team.add", entityType: "staff", entityId: user.id, summary: `Added ${email} to the team as ${role.label}` });
  revalidatePath("/admin/team");
  return { ok: `${email} is now on the team as ${role.label}.` };
}

/** Back to the Team page with the reason shown — refused actions never fail silently. */
function refuse(message: string): never {
  redirect(`/admin/team?error=${encodeURIComponent(message)}`);
}

async function guardTarget(actorId: string, userId: string, change: "role" | "deactivate" | "remove", newRole?: string) {
  if (userId === actorId) return "You can't change your own access — ask another owner.";
  const { data: target } = await supabaseAdmin().from("staff_members").select("role_key, active").eq("user_id", userId).maybeSingle();
  if (!target) return "That person isn't on the team.";
  const losingOwner = target.role_key === "owner" && target.active && (change !== "role" || newRole !== "owner");
  if (losingOwner && (await activeOwnerCount()) <= 1) return "The site must keep at least one active owner.";
  return null;
}

export async function changeRole(fd: FormData) {
  const actor = await requirePermission("team.manage");
  const userId = String(fd.get("userId") ?? "");
  const roleKey = String(fd.get("role") ?? "");
  const role = await roleExists(roleKey);
  const problem = role ? await guardTarget(actor.userId, userId, "role", roleKey) : "Unknown role.";
  if (problem) refuse(problem);
  await supabaseAdmin().from("staff_members").update({ role_key: roleKey, updated_at: new Date().toISOString() }).eq("user_id", userId);
  await logActivity(actor, { action: "team.role", entityType: "staff", entityId: userId, summary: `Changed a team member's role to ${role!.label}`, details: { email: String(fd.get("email") ?? "") } });
  revalidatePath("/admin/team");
}

export async function setActive(fd: FormData) {
  const actor = await requirePermission("team.manage");
  const userId = String(fd.get("userId") ?? "");
  const active = fd.get("active") === "true";
  if (!active) {
    const problem = await guardTarget(actor.userId, userId, "deactivate");
    if (problem) refuse(problem);
  } else if (userId === actor.userId) refuse("You can't change your own access.");
  await supabaseAdmin().from("staff_members").update({ active, updated_at: new Date().toISOString() }).eq("user_id", userId);
  await logActivity(actor, { action: active ? "team.activate" : "team.deactivate", entityType: "staff", entityId: userId, summary: `${active ? "Reactivated" : "Deactivated"} ${String(fd.get("email") ?? "a team member")}` });
  revalidatePath("/admin/team");
}

export async function removeStaff(fd: FormData) {
  const actor = await requirePermission("team.manage");
  const userId = String(fd.get("userId") ?? "");
  const problem = await guardTarget(actor.userId, userId, "remove");
  if (problem) refuse(problem);
  await supabaseAdmin().from("staff_members").delete().eq("user_id", userId);
  await logActivity(actor, { action: "team.remove", entityType: "staff", entityId: userId, summary: `Removed ${String(fd.get("email") ?? "a team member")} from the team (their customer account is kept)` });
  revalidatePath("/admin/team");
}
