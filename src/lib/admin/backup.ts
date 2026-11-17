import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Everything the business has entered, table by table. Columns that are
 * secrets (each guest order's private access code) are left out. Images
 * themselves live in Supabase Storage; the backup lists their addresses.
 */
export const BACKUP_TABLES: { table: string; columns?: string; order?: string }[] = [
  { table: "site_settings" },
  { table: "page_content", order: "key" },
  { table: "categories", order: "slug" },
  { table: "products", order: "slug" },
  { table: "product_images" },
  { table: "media_assets", order: "created_at" },
  { table: "solar_kits", order: "slug" },
  { table: "kit_slots" },
  { table: "kit_slot_choices" },
  { table: "kit_accessories" },
  { table: "kit_addons" },
  { table: "kit_rules" },
  { table: "collection_items" },
  { table: "campaigns", order: "created_at" },
  { table: "hero_slides", order: "sort_order" },
  {
    table: "orders",
    columns:
      "id, order_number, customer_id, full_name, email, phone, delivery_address, city, state, notes, subtotal_ngn, has_unpriced_parts, payment_method, payment_status, payment_reference, paid_at, status, created_at, updated_at",
    order: "created_at",
  },
  { table: "order_items" },
  { table: "order_events", order: "created_at" },
  { table: "stock_reservations", order: "created_at" },
  { table: "quote_requests", order: "created_at" },
  { table: "quote_request_items" },
  { table: "quote_responses", order: "created_at" },
  { table: "customer_profiles", order: "created_at" },
  { table: "saved_designs", order: "created_at" },
  { table: "admin_roles" },
  { table: "staff_members" },
  { table: "admin_activity", order: "created_at" },
];

/** Reads a whole table in pages (the API returns at most 1,000 rows per request). */
export async function readAll(table: string, columns = "*", order?: string): Promise<Record<string, unknown>[]> {
  const out: Record<string, unknown>[] = [];
  const page = 1000;
  for (let from = 0; ; from += page) {
    let q = supabaseAdmin().from(table).select(columns).range(from, from + page - 1);
    if (order) q = q.order(order);
    const { data, error } = await q;
    if (error) throw new Error(`${table}: ${error.message}`);
    out.push(...((data ?? []) as unknown as Record<string, unknown>[]));
    if (!data || data.length < page) return out;
  }
}

/** Account emails by user id (customers and staff). */
export async function accountEmails(): Promise<Map<string, string>> {
  const emails = new Map<string, string>();
  for (let page = 1; page < 100; page++) {
    const { data, error } = await supabaseAdmin().auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`accounts: ${error.message}`);
    for (const u of data.users) emails.set(u.id, u.email ?? "");
    if (data.users.length < 1000) break;
  }
  return emails;
}
