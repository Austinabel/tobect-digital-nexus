#!/usr/bin/env node
/**
 * Security regression check for the Supabase access rules (RLS).
 * Run: npm run db:check   (reads keys from .env.local; makes one reversible test toggle)
 */
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const pub = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false }, realtime: { transport: ws } });
const admin = createClient(url, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false }, realtime: { transport: ws } });
const out = (label, ok, detail) => console.log(`${ok ? "PASS" : "FAIL"}  ${label}  — ${detail}`);

let r = await pub.from("products").select("slug", { count: "exact" });
out("public can read published products", (r.data?.length ?? 0) > 0, `${r.data?.length} rows ${r.error?.message ?? ""}`);
r = await pub.from("solar_kits").select("slug, kit_slots(key, kit_slot_choices(product_slug))").eq("slug", "10kva-complete-solar-kit");
out("public can read kits with components", r.data?.[0]?.kit_slots?.length === 3, r.error?.message ?? "3 slots");
r = await pub.from("campaigns").select("id, active, archived_at");
out("public sees only switched-on, unarchived banners", !r.error && r.data.every((c) => c.active && !c.archived_at), `${r.data?.length} rows ${r.error?.message ?? ""}`);
const allCamps = await admin.from("campaigns").select("id").eq("active", false);
out("secret key sees draft banners", (allCamps.data?.length ?? 0) >= 1, `${allCamps.data?.length} drafts ${allCamps.error?.message ?? ""}`);
r = await pub.from("quote_requests").insert({ name: "x", phone: "0800", delivery_location: "x" });
out("public cannot insert quote requests directly", Boolean(r.error), r.error?.message ?? "insert succeeded!");
r = await pub.from("quote_requests").select("id");
out("public cannot read quote requests", (r.data?.length ?? 0) === 0, `${r.data?.length ?? 0} rows`);
r = await pub.rpc("reserve_stock", { order_ref: "t", items: [] });
out("public cannot call reserve_stock", Boolean(r.error), r.error?.message ?? "call succeeded!");
r = await pub.from("staff_roles").select("user_id");
out("public cannot list staff", (r.data?.length ?? 0) === 0, `${r.data?.length ?? 0} rows`);
r = await admin.from("products").update({ published: false }).eq("slug", "solar-street-light-200w").select("slug");
const hidden = await pub.from("products").select("slug").eq("slug", "solar-street-light-200w");
await admin.from("products").update({ published: true }).eq("slug", "solar-street-light-200w");
out("unpublished product is hidden from public", hidden.data?.length === 0, "toggled and restored");

// ---- customers & orders
r = await pub.from("orders").select("id");
out("public cannot read orders", Boolean(r.error) || (r.data?.length ?? 0) === 0, r.error?.message ?? `${r.data?.length} rows`);
r = await pub.from("orders").insert({ full_name: "x", phone: "08000000000", delivery_address: "x", city: "x", state: "Lagos", subtotal_ngn: 1, payment_method: "pay-on-confirmation" });
out("public cannot create orders directly", Boolean(r.error), r.error?.message ?? "insert succeeded!");
r = await pub.from("order_items").select("id");
out("public cannot read order items", Boolean(r.error) || (r.data?.length ?? 0) === 0, r.error?.message ?? `${r.data?.length} rows`);
r = await pub.from("customer_profiles").select("id");
out("public cannot read customer profiles", Boolean(r.error) || (r.data?.length ?? 0) === 0, r.error?.message ?? `${r.data?.length} rows`);

// ---- saved calculator designs
r = await pub.from("saved_designs").select("id");
out("public cannot read saved designs", Boolean(r.error) || (r.data?.length ?? 0) === 0, r.error?.message ?? `${r.data?.length} rows`);
r = await pub.from("saved_designs").insert({ customer_id: "00000000-0000-0000-0000-000000000000", name: "x", share_code: "abc" });
out("public cannot create saved designs", Boolean(r.error), r.error?.message ?? "insert succeeded!");

// ---- admin foundation
r = await pub.from("media_assets").select("id");
out("public can read the media library (live images)", !r.error && (r.data?.length ?? 0) >= 8, r.error?.message ?? `${r.data?.length} rows`);
r = await pub.from("media_assets").insert({ storage_path: "x", public_url: "x", filename: "x", mime_type: "image/png", size_bytes: 1 });
out("public cannot add media records", Boolean(r.error), r.error?.message ?? "insert succeeded!");
r = await pub.from("admin_activity").select("id");
out("public cannot read the activity log", Boolean(r.error) || (r.data?.length ?? 0) === 0, r.error?.message ?? `${r.data?.length} rows`);
r = await pub.from("staff_members").select("user_id");
out("public cannot list staff members", Boolean(r.error) || (r.data?.length ?? 0) === 0, r.error?.message ?? `${r.data?.length} rows`);
r = await pub.from("staff_members").insert({ user_id: "00000000-0000-0000-0000-000000000000", role_key: "owner" });
out("public cannot make anyone staff", Boolean(r.error), r.error?.message ?? "insert succeeded!");
r = await pub.from("admin_roles").update({ permissions: ["team.manage"] }).eq("key", "sales").select("key");
out("public cannot change role permissions", Boolean(r.error) || (r.data?.length ?? 0) === 0, r.error?.message ?? "no rows changed");
r = await pub.rpc("has_permission", { perm: "team.manage" });
out("has_permission is false for visitors", r.data === false, r.error?.message ?? String(r.data));
r = await pub.from("products").update({ price_ngn: 1 }).eq("slug", "jinko-550w-solar-panel").select("slug");
out("public cannot edit products", Boolean(r.error) || (r.data?.length ?? 0) === 0, r.error?.message ?? "no rows changed");

// ---- products admin
r = await pub.from("product_images").insert({ product_slug: "jinko-550w-solar-panel", media_id: "00000000-0000-0000-0000-000000000000" });
out("public cannot attach product photos", Boolean(r.error), r.error?.message ?? "insert succeeded!");
r = await pub.from("product_images").delete().eq("product_slug", "jinko-550w-solar-panel").select("product_slug");
out("public cannot remove product photos", Boolean(r.error) || (r.data?.length ?? 0) === 0, r.error?.message ?? "no rows deleted");
await admin.from("products").update({ deleted_at: new Date().toISOString() }).eq("slug", "solar-street-light-200w");
const trashed = await pub.from("products").select("slug").eq("slug", "solar-street-light-200w");
await admin.from("products").update({ deleted_at: null }).eq("slug", "solar-street-light-200w");
out("trashed product is hidden from public", trashed.data?.length === 0, "trashed and restored");
r = await pub.from("categories").insert({ slug: "hack", name: "Hack", glyph: "panel" });
out("public cannot add categories", Boolean(r.error), r.error?.message ?? "insert succeeded!");

// ---- orders & quotes admin
r = await pub.from("order_events").select("id");
out("public cannot read order timelines", Boolean(r.error) || (r.data?.length ?? 0) === 0, r.error?.message ?? `${r.data?.length} rows`);
r = await pub.rpc("commit_order_stock", { p_order_ref: "TBC-1001" });
out("public cannot deduct stock", Boolean(r.error), r.error?.message ?? "call succeeded!");
r = await pub.rpc("release_order_stock", { p_order_ref: "TBC-1001" });
out("public cannot return stock", Boolean(r.error), r.error?.message ?? "call succeeded!");
r = await pub.from("quote_responses").select("id");
out("public cannot read quote replies", Boolean(r.error) || (r.data?.length ?? 0) === 0, r.error?.message ?? `${r.data?.length} rows`);

// ---- banners, slides, kits admin
r = await pub.from("campaigns").insert({ title: "Hack", cta_text: "x", cta_href: "/x", position: "shop-hero", active: true });
out("public cannot add banners", Boolean(r.error), r.error?.message ?? "insert succeeded!");
r = await pub.from("hero_slides").select("id, active");
out("public reads only visible homepage slides", !r.error && r.data.length > 0 && r.data.every((x) => x.active), `${r.data?.length} rows ${r.error?.message ?? ""}`);
r = await pub.from("hero_slides").insert({ image_url: "https://evil.example/x.jpg", alt: "hack" });
out("public cannot add homepage slides", Boolean(r.error), r.error?.message ?? "insert succeeded!");
r = await pub.rpc("save_kit", { p_existing: "10kva-complete-solar-kit", p_kit: {}, p_slots: [], p_accessories: [], p_addons: [], p_actor: null });
out("public cannot call save_kit", Boolean(r.error), r.error?.message ?? "call succeeded!");
r = await pub.from("collection_items").insert({ collection: "popular", product_slug: "jinko-550w-solar-panel" });
out("public cannot edit collections", Boolean(r.error), r.error?.message ?? "insert succeeded!");

// ---- site settings & page content
r = await pub.from("site_settings").select("id");
out("public can read site settings", !r.error && r.data.length === 1, r.error?.message ?? `${r.data.length} row`);
r = await pub.from("site_settings").update({ data: { email: "hacker@example.com" } }).eq("id", 1).select("id");
out("public cannot change site settings", Boolean(r.error) || (r.data?.length ?? 0) === 0, r.error?.message ?? `${r.data?.length} rows changed`);
r = await pub.from("page_content").upsert({ key: "terms", data: { title: "x", body: "hacked" } }).select("key");
out("public cannot edit page content", Boolean(r.error), r.error?.message ?? "upsert succeeded!");
r = await pub.from("page_content").select("key");
out("public can read page content", !r.error, r.error?.message ?? `${r.data.length} rows`);
