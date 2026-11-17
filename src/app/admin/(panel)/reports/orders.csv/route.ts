import { NextResponse } from "next/server";
import { getStaff, can } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { RANGES, lagosDay, rangeStart, toCsv } from "@/lib/admin/reports";

/** Orders for the chosen period as a spreadsheet (staff who can view orders). */
export async function GET(request: Request) {
  const { staff } = await getStaff();
  if (!can(staff, "orders.view")) return new NextResponse("Not allowed", { status: 403 });
  const daysParam = Number(new URL(request.url).searchParams.get("days"));
  const days = (RANGES as readonly number[]).includes(daysParam) ? daysParam : 30;
  const now = new Date();
  const { data: orders, error } = await supabaseAdmin()
    .from("orders")
    .select("order_number, created_at, status, payment_status, payment_method, payment_reference, subtotal_ngn, full_name, phone, email, city, state, customer_id, order_items(quantity, name)")
    .gte("created_at", rangeStart(now, days))
    .order("created_at");
  if (error) return new NextResponse("Couldn't load orders", { status: 500 });

  const csv = toCsv(
    ["Order", "Placed (Lagos time)", "Status", "Payment", "Payment method", "Payment reference", "Subtotal (NGN)", "Customer", "Phone", "Email", "City", "State", "Account", "Items"],
    (orders ?? []).map((o) => [
      o.order_number,
      new Date(new Date(o.created_at).getTime() + 3_600_000).toISOString().slice(0, 16).replace("T", " "),
      o.status,
      o.payment_status,
      o.payment_method,
      o.payment_reference,
      Number(o.subtotal_ngn),
      o.full_name,
      o.phone,
      o.email,
      o.city,
      o.state,
      o.customer_id ? "registered" : "guest",
      (o.order_items as { quantity: number; name: string }[]).map((i) => `${i.quantity} × ${i.name}`).join("; "),
    ]),
  );
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${lagosDay(now)}-last-${days}-days.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
