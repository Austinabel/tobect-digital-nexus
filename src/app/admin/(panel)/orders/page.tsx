import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminCard, AdminHeader, NoAccess, ghostButtonClass, inputClass } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/data/products";
import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from "@/lib/shop/order-labels";
import { badge } from "@/lib/admin/contact";

export const metadata = { title: "Orders" };

const TABS = ["", "new", "confirmed", "processing", "dispatched", "delivered", "cancelled", "returned"] as const;

export default async function OrdersPage(props: PageProps<"/admin/orders">) {
  const { staff } = await getStaff();
  if (!can(staff, "orders.view")) return <NoAccess reason="permission" />;
  const sp = await props.searchParams;
  const status = typeof sp.status === "string" && (TABS as readonly string[]).includes(sp.status) ? sp.status : "";
  const pay = typeof sp.payment === "string" && sp.payment in PAYMENT_STATUS ? sp.payment : "";
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 60).replace(/[%,()]/g, " ") : "";
  const notice = typeof sp.notice === "string" ? sp.notice.slice(0, 200) : null;

  const admin = supabaseAdmin();
  let query = admin.from("orders").select("id, order_number, created_at, full_name, phone, city, state, subtotal_ngn, has_unpriced_parts, status, payment_status, payment_method, customer_id, order_items(name, quantity)").order("created_at", { ascending: false }).limit(300);
  if (status) query = query.eq("status", status);
  if (pay) query = query.eq("payment_status", pay);
  if (q) query = query.or(`order_number.ilike.%${q}%,full_name.ilike.%${q}%,phone.ilike.%${q}%`);
  const [{ data: orders }, { data: all }] = await Promise.all([query, admin.from("orders").select("status")]);
  const counts = new Map<string, number>();
  for (const o of all ?? []) counts.set(o.status, (counts.get(o.status) ?? 0) + 1);

  return (
    <>
      <AdminHeader title="Orders" intro="Every order placed on the website. Confirm stock and delivery with the customer, then move the order along." />
      {notice && <p role="status" className="mb-4 rounded-xl border border-hair bg-white px-4 py-3 text-[0.88rem] text-ink">{notice}</p>}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Order status" className="flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <Link
              key={t || "all"}
              href={t ? `/admin/orders?status=${t}` : "/admin/orders"}
              aria-current={status === t ? "page" : undefined}
              className={cn("rounded-full border px-3 py-1.5 text-[0.8rem] font-semibold", status === t ? "border-blue bg-blue text-white" : "border-hair bg-white text-slate hover:border-blue")}
            >
              {t ? ORDER_STATUS[t].label : "All"}
              {t && counts.get(t) ? <span className="ml-1 opacity-70">{counts.get(t)}</span> : null}
            </Link>
          ))}
        </nav>
        <form action="/admin/orders" className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <select name="payment" defaultValue={pay} aria-label="Payment" className={`${inputClass} h-9 w-auto`}>
            <option value="">Any payment</option>
            {Object.entries(PAYMENT_STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <input name="q" defaultValue={q} placeholder="Order no., name or phone" aria-label="Search orders" className={`${inputClass} h-9 w-[200px]`} />
          <button type="submit" className={ghostButtonClass}>
            Filter
          </button>
        </form>
      </div>

      <AdminCard className="p-0">
        {orders?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-[0.88rem]">
              <thead className="border-b border-hair text-[0.72rem] uppercase tracking-[0.08em] text-slate">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Deliver to</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hair">
                {orders.map((o) => {
                  // every cell opens the order, so the whole row is clickable
                  const href = `/admin/orders/${o.id}`;
                  const cell = "block px-4 py-2.5";
                  const items = (o.order_items as { name: string; quantity: number }[] | null) ?? [];
                  return (
                    <tr key={o.id} className="cursor-pointer hover:bg-field/60">
                      <td>
                        <Link href={href} className={cell}>
                          <span className="font-heading font-bold text-blue">{o.order_number}</span>
                          <span className="block text-[0.74rem] text-slate">{new Date(o.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</span>
                        </Link>
                      </td>
                      <td>
                        <Link href={href} className={cell} tabIndex={-1}>
                          <span className="block font-semibold text-ink">{o.full_name}</span>
                          <span className="block text-[0.76rem] text-slate">
                            {o.phone} · {o.customer_id ? "Account" : "Guest"}
                          </span>
                          <span className="block max-w-[260px] truncate text-[0.76rem] text-slate" title={items.map((i) => `${i.quantity} × ${i.name}`).join(", ")}>
                            {items.map((i) => `${i.quantity} × ${i.name}`).join(", ")}
                          </span>
                        </Link>
                      </td>
                      <td>
                        <Link href={href} className={cn(cell, "text-slate")} tabIndex={-1}>
                          {o.city}, {o.state}
                        </Link>
                      </td>
                      <td>
                        <Link href={href} className={cn(cell, "text-right font-semibold tabular-nums text-ink")} tabIndex={-1}>
                          {formatNaira(Number(o.subtotal_ngn))}
                          {o.has_unpriced_parts && <span className="block text-[0.7rem] font-normal text-slate">+ items to price</span>}
                        </Link>
                      </td>
                      <td>
                        <Link href={href} className={cell} tabIndex={-1}>
                          <span className={cn("rounded-md px-2 py-0.5 text-[0.72rem] font-bold", badge.status[o.status])}>{ORDER_STATUS[o.status]?.label ?? o.status}</span>
                        </Link>
                      </td>
                      <td>
                        <Link href={href} className={cell} tabIndex={-1}>
                          <span className={cn("rounded-md px-2 py-0.5 text-[0.72rem] font-bold", badge.payment[o.payment_status])}>{PAYMENT_STATUS[o.payment_status] ?? o.payment_status}</span>
                          <span className="mt-1 block text-[0.72rem] text-slate">{PAYMENT_METHOD[o.payment_method] ?? o.payment_method}</span>
                        </Link>
                      </td>
                      <td>
                        <Link href={href} className={cn(cell, "whitespace-nowrap font-semibold text-blue")} tabIndex={-1}>
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-5 text-slate">{status || pay || q ? "No orders match these filters." : "No orders yet. They appear here as soon as a customer checks out."}</p>
        )}
      </AdminCard>
    </>
  );
}
