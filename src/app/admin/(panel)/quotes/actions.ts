"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { QUOTE_STATUSES } from "@/lib/admin/quotes";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function back(id: string, notice: string): never {
  redirect(`/admin/quotes/${id}?notice=${encodeURIComponent(notice)}`);
}

export async function updateQuote(fd: FormData) {
  const actor = await requirePermission("quotes.manage");
  const id = String(fd.get("id") ?? "");
  if (!UUID.test(id)) redirect("/admin/quotes");
  const status = String(fd.get("status") ?? "");
  const notes = String(fd.get("staff_notes") ?? "").trim().slice(0, 3000);
  if (!(QUOTE_STATUSES as readonly string[]).includes(status)) back(id, "Choose a valid status.");
  const { data } = await supabaseAdmin()
    .from("quote_requests")
    .update({ status, staff_notes: notes || null, assigned_to: actor.userId, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("reference")
    .maybeSingle();
  if (data) await logActivity(actor, { action: "quote.update", entityType: "quote", entityId: id, summary: `${data.reference}: status ${status}` });
  revalidatePath("/admin/quotes");
  back(id, "Saved.");
}

/**
 * Records the reply in the request's history and opens it in WhatsApp
 * (the page builds the link) — the customer receives it only when sent.
 */
export async function logQuoteResponse(fd: FormData) {
  const actor = await requirePermission("quotes.manage");
  const id = String(fd.get("id") ?? "");
  if (!UUID.test(id)) redirect("/admin/quotes");
  const message = String(fd.get("message") ?? "").trim().slice(0, 3000);
  if (!message) back(id, "Write the reply first.");
  const admin = supabaseAdmin();
  await admin.from("quote_responses").insert({ request_id: id, author: actor.userId, message });
  // replying moves a new request into "reviewing" so it leaves the New tab
  await admin.from("quote_requests").update({ status: "reviewing", updated_at: new Date().toISOString() }).eq("id", id).eq("status", "new");
  const { data } = await admin.from("quote_requests").select("reference").eq("id", id).maybeSingle();
  await logActivity(actor, { action: "quote.reply", entityType: "quote", entityId: id, summary: `Replied to ${data?.reference ?? "a quote request"}` });
  revalidatePath("/admin/quotes");
  redirect(`/admin/quotes/${id}?notice=${encodeURIComponent("Reply saved — send it from the WhatsApp window.")}&send=1`);
}
