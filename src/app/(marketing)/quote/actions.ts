"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { getCatalog } from "@/lib/catalog-server";

export interface QuotePayload {
  kind: "standard" | "bulk";
  name: string;
  phone: string;
  email?: string;
  location: string;
  customerType?: string;
  businessName?: string;
  services?: string[];
  message?: string;
  items?: { product: string; quantity: number }[];
  /** honeypot — real visitors never fill it */
  website?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

/**
 * Stores a quote / bulk-quote request so the team has it in the admin inbox
 * (the customer's WhatsApp message is sent separately). Everything is
 * re-validated here; product lines are linked to catalogue products when
 * the name matches exactly.
 */
export async function saveQuoteRequest(p: QuotePayload): Promise<{ ok: boolean; reference?: string; error?: string }> {
  if (clip(p?.website, 100)) return { ok: true }; // bot: pretend success, store nothing
  const kind = p?.kind === "bulk" ? "bulk" : "standard";
  const name = clip(p.name, 120);
  const phone = clip(p.phone, 40);
  const email = clip(p.email, 200).toLowerCase();
  const location = clip(p.location, 200);
  if (name.length < 2 || phone.replace(/\D/g, "").length < 10 || !location || (email && !EMAIL.test(email))) return { ok: false, error: "Please check your details." };

  const items = (Array.isArray(p.items) ? p.items : [])
    .slice(0, 30)
    .map((i) => ({ description: clip(i?.product, 200), quantity: Number(i?.quantity) }))
    .filter((i) => i.description);
  if (kind === "bulk" && (!items.length || items.some((i) => !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 100_000))) return { ok: false, error: "Please check the products and quantities." };

  const admin = supabaseAdmin();
  // Light abuse limit: at most 5 requests per phone number per hour.
  const since = new Date(Date.now() - 3_600_000).toISOString();
  const { count } = await admin.from("quote_requests").select("id", { count: "exact", head: true }).eq("phone", phone).gte("created_at", since);
  if ((count ?? 0) >= 5) return { ok: false, error: "We've already received several requests from this number — our team will be in touch." };

  const { data: req, error } = await admin
    .from("quote_requests")
    .insert({
      kind,
      name,
      phone,
      email: email || null,
      delivery_location: location,
      business_name: clip(p.businessName, 120) || null,
      customer_type: clip(p.customerType, 60) || null,
      services: (Array.isArray(p.services) ? p.services : []).map((s) => clip(s, 120)).filter(Boolean).slice(0, 10),
      project_description: clip(p.message, 3000) || null,
    })
    .select("id, reference")
    .single();
  if (error || !req) return { ok: false, error: "Couldn't save your request — WhatsApp still has it." };

  if (items.length) {
    const { products } = await getCatalog();
    const byName = new Map(products.map((x) => [x.name.toLowerCase(), x.slug]));
    await admin.from("quote_request_items").insert(items.map((i) => ({ request_id: req.id, description: i.description, quantity: i.quantity, product_slug: byName.get(i.description.toLowerCase()) ?? null })));
  }
  return { ok: true, reference: req.reference };
}
