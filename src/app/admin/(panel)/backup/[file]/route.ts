import { NextResponse } from "next/server";
import { can, getStaff } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/activity";
import { BACKUP_TABLES, accountEmails, readAll } from "@/lib/admin/backup";
import { lagosDay, toCsv } from "@/lib/admin/reports";

const FILES = ["full-backup.json", "products.csv", "customers.csv"] as const;

/**
 * Downloads for Admin → Backup & export. Owner only (the files contain
 * customers' personal details); every download is written to the activity log.
 */
export async function GET(_: Request, ctx: RouteContext<"/admin/backup/[file]">) {
  const { staff } = await getStaff();
  if (!staff || !can(staff, "team.manage")) return new NextResponse("Not allowed", { status: 403 });
  const { file } = await ctx.params;
  if (!(FILES as readonly string[]).includes(file)) return new NextResponse("Not found", { status: 404 });
  const today = lagosDay(new Date());
  const actor = { userId: staff.userId, email: staff.email };

  try {
    if (file === "full-backup.json") {
      const tables: Record<string, unknown[]> = {};
      for (const t of BACKUP_TABLES) tables[t.table] = await readAll(t.table, t.columns, t.order);
      const emails = await accountEmails();
      const accounts = [...new Set([...(tables.customer_profiles as { id: string }[]).map((c) => c.id), ...(tables.staff_members as { user_id: string }[]).map((s) => s.user_id)])].map((id) => ({ id, email: emails.get(id) ?? null }));
      const body = JSON.stringify(
        {
          format: "tobecat-site-backup",
          version: 1,
          created_at: new Date().toISOString(),
          note: "Business data from the website database. Images are stored in Supabase Storage (bucket 'media'); their addresses are in media_assets. Passwords are never included.",
          counts: Object.fromEntries(Object.entries(tables).map(([k, v]) => [k, v.length])),
          accounts,
          tables,
        },
        null,
        1,
      );
      await logActivity(actor, { action: "backup.download", entityType: "backup", summary: "Downloaded a full backup" });
      return new NextResponse(body, {
        headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="site-backup-${today}.json"`, "Cache-Control": "no-store" },
      });
    }

    if (file === "products.csv") {
      const rows = await readAll("products", "slug, name, brand, model, category_slug, price_ngn, compare_at_price_ngn, availability, stock_quantity, featured, published, is_sample, deleted_at, specs, updated_at", "name");
      const csv = toCsv(
        ["Slug", "Name", "Brand", "Model", "Category", "Price (NGN)", "Previous price (NGN)", "Availability", "Stock", "Featured", "Published", "Sample", "In trash", "Specs", "Last updated"],
        rows.map((p) => [
          p.slug as string,
          p.name as string,
          p.brand as string,
          p.model as string,
          p.category_slug as string,
          Number(p.price_ngn),
          p.compare_at_price_ngn === null ? "" : Number(p.compare_at_price_ngn),
          p.availability as string,
          (p.stock_quantity as number | null) ?? "not tracked",
          p.featured ? "yes" : "no",
          p.published ? "yes" : "no",
          p.is_sample ? "yes" : "no",
          p.deleted_at ? "yes" : "no",
          ((p.specs as string[]) ?? []).join("; "),
          p.updated_at as string,
        ]),
      );
      await logActivity(actor, { action: "backup.export", entityType: "backup", summary: "Exported products (CSV)" });
      return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="products-${today}.csv"`, "Cache-Control": "no-store" } });
    }

    // customers.csv
    const [profiles, orders, emails] = await Promise.all([
      readAll("customer_profiles", "id, full_name, phone, delivery_address, city, state, created_at", "created_at"),
      readAll("orders", "customer_id, subtotal_ngn, status"),
      accountEmails(),
    ]);
    const stats = new Map<string, { n: number; total: number }>();
    for (const o of orders) {
      if (!o.customer_id) continue;
      const s = stats.get(o.customer_id as string) ?? { n: 0, total: 0 };
      s.n++;
      if (!["new", "cancelled", "returned"].includes(o.status as string)) s.total += Number(o.subtotal_ngn);
      stats.set(o.customer_id as string, s);
    }
    const csv = toCsv(
      ["Name", "Email", "Phone", "Address", "City", "State", "Joined", "Orders", "Confirmed sales (NGN)"],
      profiles.map((c) => [
        c.full_name as string,
        emails.get(c.id as string) ?? "",
        c.phone as string,
        c.delivery_address as string,
        c.city as string,
        c.state as string,
        String(c.created_at).slice(0, 10),
        stats.get(c.id as string)?.n ?? 0,
        stats.get(c.id as string)?.total ?? 0,
      ]),
    );
    await logActivity(actor, { action: "backup.export", entityType: "backup", summary: "Exported customers (CSV)" });
    return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="customers-${today}.csv"`, "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("Backup failed:", e);
    return new NextResponse("The backup couldn't be created — please try again.", { status: 500 });
  }
}
