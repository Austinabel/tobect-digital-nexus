import { cache } from "react";
import { supabaseAdmin, supabaseServer } from "@/lib/supabase/server";

/** Every admin capability. Roles (table admin_roles) are bundles of these. */
export const PERMISSIONS = [
  "settings.manage",
  "team.manage",
  "content.manage",
  "media.manage",
  "products.manage",
  "catalog.manage",
  "orders.view",
  "orders.manage",
  "quotes.manage",
  "customers.view",
  "activity.view",
  "calculator.manage",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export interface Staff {
  userId: string;
  email: string;
  roleKey: string;
  roleLabel: string;
  permissions: ReadonlySet<string>;
}

/**
 * The signed-in user and, if they are active staff, their role and
 * permissions. Verified with Supabase Auth; cached for one request.
 */
export const getStaff = cache(async (): Promise<{ user: { id: string; email: string } | null; staff: Staff | null }> => {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { user: null, staff: null };
  const user = { id: data.user.id, email: data.user.email ?? "" };
  // Read with the secret key: the role lookup itself must not depend on the role.
  const { data: row } = await supabaseAdmin()
    .from("staff_members")
    .select("role_key, active, admin_roles(label, permissions)")
    .eq("user_id", user.id)
    .maybeSingle();
  const role = row?.admin_roles as unknown as { label: string; permissions: string[] } | null;
  if (!row || !row.active || !role) return { user, staff: null };
  return { user, staff: { userId: user.id, email: user.email, roleKey: row.role_key, roleLabel: role.label, permissions: new Set(role.permissions) } };
});

export const can = (staff: Staff | null, perm: Permission) => Boolean(staff?.permissions.has(perm));

/** For server actions: returns the staff member or throws. Never trust the UI to hide a button. */
export async function requirePermission(perm: Permission): Promise<Staff> {
  const { staff } = await getStaff();
  if (!staff || !staff.permissions.has(perm)) throw new Error("You don't have permission to do that.");
  return staff;
}
