import { supabaseAdmin } from "@/lib/supabase/server";
import type { Staff } from "@/lib/admin/auth";

/** Records an admin change (who, what, when). Never blocks the change if logging fails. */
export async function logActivity(
  actor: Pick<Staff, "userId" | "email"> | null,
  entry: { action: string; entityType: string; entityId?: string | null; summary: string; details?: Record<string, unknown> },
) {
  const { error } = await supabaseAdmin()
    .from("admin_activity")
    .insert({
      actor_id: actor?.userId ?? null,
      actor_email: actor?.email ?? null,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      summary: entry.summary.slice(0, 500),
      details: entry.details ?? {},
    });
  if (error) console.error("[admin-activity] could not record:", error.message);
}
