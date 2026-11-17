"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin, supabaseServer } from "@/lib/supabase/server";
import { findKit } from "@/lib/data/kits";
import { getCatalog } from "@/lib/catalog-server";
import { parseRequestedLines, priceOrder } from "@/lib/shop/order-pricing";
import type { KitCatalogueProduct } from "@/lib/shop/kits";
import { NIGERIAN_STATES } from "@/lib/nigeria";
import { initializePayment, onlinePaymentEnabled } from "@/lib/payments/paystack";

export interface CheckoutState {
  error?: string;
  errors?: string[];
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (fd: FormData, k: string, max = 300) => String(fd.get(k) ?? "").trim().slice(0, max);

/**
 * Places an order for a signed-in customer or a guest.
 * 1. validate contact + delivery details
 * 2. re-price every line from the database catalogue (client prices ignored)
 * 3. save the order + items, then reserve stock for every component
 * 4. hand over to Paystack, or show the confirmation page
 */
export async function placeOrder(_: CheckoutState | undefined, fd: FormData): Promise<CheckoutState> {
  const requested = parseRequestedLines(fd.get("cart"));
  if (!requested) return { error: "Your cart is empty or couldn't be read. Please refresh the page." };

  const contact = {
    full_name: str(fd, "full_name", 120),
    email: str(fd, "email", 200).toLowerCase(),
    phone: str(fd, "phone", 40),
    delivery_address: str(fd, "delivery_address"),
    city: str(fd, "city", 100),
    state: str(fd, "state", 40),
    notes: str(fd, "notes", 1000),
  };
  let method: "paystack" | "pay-on-confirmation" = fd.get("payment_method") === "paystack" && onlinePaymentEnabled() ? "paystack" : "pay-on-confirmation";

  if (contact.full_name.length < 2) return { error: "Please enter your full name." };
  if (contact.phone.replace(/\D/g, "").length < 10) return { error: "Please enter a valid phone number." };
  if (contact.email && !EMAIL.test(contact.email)) return { error: "Please enter a valid email address." };
  if (method === "paystack" && !contact.email) return { error: "An email address is needed for online payment receipts." };
  if (contact.delivery_address.length < 5) return { error: "Please enter your delivery address." };
  if (!contact.city) return { error: "Please enter your city or town." };
  if (!(NIGERIAN_STATES as readonly string[]).includes(contact.state)) return { error: "Please choose your state." };

  const user = (await (await supabaseServer()).auth.getUser()).data.user;
  const admin = supabaseAdmin();

  // Authoritative kit definitions and prices: published rows from the database.
  const { kits } = await getCatalog();
  const slugs = new Set<string>();
  for (const l of requested) {
    const kit = l.kit ? findKit(kits, l.slug) : undefined;
    if (kit) kit.slots.forEach((s) => s.choices.forEach((c) => slugs.add(c)));
    else slugs.add(l.slug);
  }
  const { data: rows, error: productError } = await admin
    .from("products")
    .select("slug, name, price_ngn, availability")
    .eq("published", true)
    .in("slug", [...slugs]);
  if (productError) return { error: "We couldn't reach our catalogue. Please try again in a moment." };
  const bySlug = new Map<string, KitCatalogueProduct>(
    (rows ?? []).map((r) => [r.slug, { slug: r.slug, name: r.name, priceNgn: Number(r.price_ngn), availability: r.availability ?? undefined }]),
  );

  const order = priceOrder(requested, (s) => bySlug.get(s), (s) => findKit(kits, s));
  if (order.errors.length) return { error: "Some items in your cart need attention:", errors: order.errors };
  if (!order.lines.length) return { error: "Your cart is empty." };
  // A total that still has unpriced parts (kit accessories, quoted installation) can't be charged online yet.
  if (order.hasUnpricedParts) method = "pay-on-confirmation";

  const { data: created, error: orderError } = await admin
    .from("orders")
    .insert({
      customer_id: user?.id ?? null,
      ...contact,
      email: contact.email || user?.email || null,
      notes: contact.notes || null,
      subtotal_ngn: order.subtotalNgn,
      has_unpriced_parts: order.hasUnpricedParts,
      payment_method: method,
    })
    .select("id, order_number, access_token")
    .single();
  if (orderError || !created) return { error: "We couldn't place your order. Please try again." };

  const { error: itemsError } = await admin.from("order_items").insert(
    order.lines.map((l) => ({
      order_id: created.id,
      kind: l.kind,
      item_slug: l.slug,
      name: l.name,
      quantity: l.quantity,
      unit_price_ngn: l.unitPriceNgn,
      line_total_ngn: l.lineTotalNgn,
      kit_config: l.kitConfig ?? null,
      kit_parts: l.kitParts ?? null,
    })),
  );
  // Stock: reserves every component atomically; fails if a tracked item would oversell.
  const { error: stockError } = itemsError ? { error: itemsError } : await admin.rpc("reserve_stock", { order_ref: created.order_number, items: order.demand });
  if (itemsError || stockError) {
    await admin.from("orders").delete().eq("id", created.id); // undo our own half-written order
    const oversold = /insufficient_stock:(\S+)/.exec(stockError?.message ?? "")?.[1];
    return { error: oversold ? `Sorry — we don't have enough stock of ${bySlug.get(oversold)?.name ?? "an item"} for this order.` : "We couldn't place your order. Please try again." };
  }

  const done = `/checkout/complete?order=${created.id}&token=${created.access_token}`;

  if (method === "paystack") {
    const h = await headers();
    const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
    let payUrl: string;
    try {
      const init = await initializePayment({
        email: contact.email,
        amountNgn: order.subtotalNgn,
        reference: created.order_number,
        orderNumber: created.order_number,
        callbackUrl: `${origin}/checkout/paystack/callback`,
      });
      await admin.from("orders").update({ payment_status: "pending", payment_reference: init.reference }).eq("id", created.id);
      payUrl = init.authorization_url;
    } catch {
      // The order is saved; the customer can still pay after our team confirms it.
      await admin.from("orders").update({ payment_method: "pay-on-confirmation" }).eq("id", created.id);
      redirect(`${done}&payment=unavailable`);
    }
    redirect(payUrl);
  }

  redirect(done);
}
