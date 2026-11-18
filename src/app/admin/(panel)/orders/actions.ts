"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { canChangeStatus, canRecordPayment, stockEffect } from "@/lib/shop/order-status";
import { emailOrderUpdate } from "@/lib/email/notify";
import { emailEnabled } from "@/lib/email/send";
import type { OrderUpdateEvent } from "@/lib/email/templates";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function back(id: string, notice: string): never {
  redirect(`/admin/orders/${id}?notice=${encodeURIComponent(notice)}`);
}

async function loadOrder(id: string) {
  if (!UUID.test(id)) redirect("/admin/orders");
  const { data } = await supabaseAdmin().from("orders").select("id, order_number, status, payment_status").eq("id", id).maybeSingle();
  if (!data) redirect("/admin/orders?notice=Order%20not%20found.");
  return data;
}

/** Emails the customer about the change (unless staff unticked "Email the customer"); returns a note for the admin. */
async function tellCustomer(id: string, event: OrderUpdateEvent, fd: FormData): Promise<string> {
  // forms with an "Email the customer" tick box send notify_box; unticked = don't email
  if ((fd.has("notify_box") && !fd.get("notify")) || !emailEnabled()) return "";
  const to = await emailOrderUpdate(id, event);
  return to ? ` The customer has been emailed at ${to}.` : " (No email address on this order — let the customer know by phone or WhatsApp.)";
}

export async function changeOrderStatus(fd: FormData) {
  const actor = await requirePermission("orders.manage");
  const id = String(fd.get("id") ?? "");
  const to = String(fd.get("to") ?? "");
  const reason = String(fd.get("reason") ?? "").trim().slice(0, 500) || null;
  const order = await loadOrder(id);
  if (!canChangeStatus(order.status, to)) back(id, `An order that is "${order.status}" can't be moved to "${to}".`);
  if ((to === "cancelled" || to === "returned") && !reason) back(id, "Please give a reason for cancelling or returning the order.");

  const admin = supabaseAdmin();
  const effect = stockEffect(order.status, to);
  let stockNote: string | null = null;
  if (effect === "commit") {
    const { data, error } = await admin.rpc("commit_order_stock", { p_order_ref: order.order_number });
    if (error) {
      const slug = /insufficient_stock:(\S+)/.exec(error.message)?.[1];
      back(id, slug ? `Not enough stock of ${slug} to confirm this order. Update the stock or contact the customer.` : `Couldn't update stock: ${error.message}`);
    }
    stockNote = data ? `Stock deducted for ${data} tracked item${data === 1 ? "" : "s"}.` : "No tracked stock on this order.";
  } else if (effect === "release") {
    const { data, error } = await admin.rpc("release_order_stock", { p_order_ref: order.order_number });
    if (error) back(id, `Couldn't return stock: ${error.message}`);
    stockNote = data ? `Stock returned for ${data} item${data === 1 ? "" : "s"}.` : null;
  }

  // Guard against a double click / two staff acting at once: only move from the status we checked.
  const { data: moved } = await admin.from("orders").update({ status: to, updated_at: new Date().toISOString() }).eq("id", id).eq("status", order.status).select("id");
  if (!moved?.length) back(id, "Someone else just updated this order — please check it again.");

  await admin.from("order_events").insert([
    { order_id: id, actor_id: actor.userId, actor_email: actor.email, kind: "status", from_value: order.status, to_value: to, message: reason },
    ...(stockNote ? [{ order_id: id, actor_id: actor.userId, actor_email: actor.email, kind: "stock", message: stockNote }] : []),
  ]);
  await logActivity(actor, { action: "order.status", entityType: "order", entityId: id, summary: `${order.order_number}: ${order.status} → ${to}` });
  revalidatePath("/admin/orders");
  revalidatePath("/", "layout"); // stock levels show in the shop
  const emailed = await tellCustomer(id, to as OrderUpdateEvent, fd);
  back(id, `Order ${to}.${stockNote ? ` ${stockNote}` : ""}${emailed}`);
}

export async function recordPayment(fd: FormData) {
  const actor = await requirePermission("orders.manage");
  const id = String(fd.get("id") ?? "");
  const to = String(fd.get("to") ?? "");
  const note = String(fd.get("note") ?? "").trim().slice(0, 300);
  const order = await loadOrder(id);
  if (!canRecordPayment(order.payment_status, to)) back(id, `Payment can't go from "${order.payment_status}" to "${to}".`);
  if (!note) back(id, to === "paid" ? "Add how it was paid (e.g. bank transfer + reference)." : "Add a refund note (amount, method, reference).");

  const admin = supabaseAdmin();
  await admin
    .from("orders")
    .update({ payment_status: to, ...(to === "paid" ? { paid_at: new Date().toISOString() } : {}), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("payment_status", order.payment_status);
  await admin.from("order_events").insert({ order_id: id, actor_id: actor.userId, actor_email: actor.email, kind: "payment", from_value: order.payment_status, to_value: to, message: note });
  await logActivity(actor, { action: "order.payment", entityType: "order", entityId: id, summary: `${order.order_number}: payment ${order.payment_status} → ${to}` });
  revalidatePath("/admin/orders");
  const emailed = await tellCustomer(id, to as OrderUpdateEvent, fd);
  back(id, `${to === "paid" ? "Payment recorded." : "Refund recorded."}${emailed}`);
}

export async function addOrderNote(fd: FormData) {
  const actor = await requirePermission("orders.manage");
  const id = String(fd.get("id") ?? "");
  const message = String(fd.get("message") ?? "").trim().slice(0, 1000);
  await loadOrder(id);
  if (!message) back(id, "Write a note first.");
  await supabaseAdmin().from("order_events").insert({ order_id: id, actor_id: actor.userId, actor_email: actor.email, kind: "note", message });
  back(id, "Note added.");
}
