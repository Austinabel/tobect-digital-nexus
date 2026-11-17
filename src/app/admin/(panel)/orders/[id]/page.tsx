import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { AdminCard, AdminHeader, NoAccess, buttonClass, ghostButtonClass, inputClass } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/data/products";
import { ORDER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } from "@/lib/shop/order-labels";
import { STATUS_ACTION_LABEL, allowedNextStatuses, canRecordPayment } from "@/lib/shop/order-status";
import { badge, customerWhatsApp } from "@/lib/admin/contact";
import { addOrderNote, changeOrderStatus, recordPayment } from "../actions";

export const metadata = { title: "Order" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EVENT_LABEL: Record<string, string> = { status: "Status", payment: "Payment", note: "Note", stock: "Stock" };

export default async function OrderPage(props: PageProps<"/admin/orders/[id]">) {
  const { staff } = await getStaff();
  if (!can(staff, "orders.view")) return <NoAccess reason="permission" />;
  const manage = can(staff, "orders.manage");
  const { id } = await props.params;
  if (!UUID.test(id)) notFound();
  const { notice } = await props.searchParams;

  const admin = supabaseAdmin();
  const [{ data: o }, { data: items }, { data: events }] = await Promise.all([
    admin.from("orders").select("*").eq("id", id).maybeSingle(),
    admin.from("order_items").select("kind, item_slug, name, quantity, unit_price_ngn, line_total_ngn, kit_parts").eq("order_id", id),
    admin.from("order_events").select("id, kind, from_value, to_value, message, actor_email, created_at").eq("order_id", id).order("created_at", { ascending: false }),
  ]);
  if (!o) notFound();
  const next = allowedNextStatuses(o.status);
  const wa = customerWhatsApp(o.phone, `Hello ${o.full_name.split(" ")[0]}, this is Tobecat Technologies about your order ${o.order_number}.`);

  return (
    <>
      <AdminHeader
        title={`Order ${o.order_number}`}
        intro={
          <span className="flex flex-wrap items-center gap-2">
            <Link href="/admin/orders" className="font-semibold text-blue hover:underline">
              ← All orders
            </Link>
            <span className={cn("rounded-md px-2 py-0.5 text-[0.74rem] font-bold", badge.status[o.status])}>{ORDER_STATUS[o.status]?.label}</span>
            <span className={cn("rounded-md px-2 py-0.5 text-[0.74rem] font-bold", badge.payment[o.payment_status])}>{PAYMENT_STATUS[o.payment_status]}</span>
            <span className="text-slate">Placed {new Date(o.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</span>
          </span>
        }
      />
      {typeof notice === "string" && <p role="status" className="mb-4 rounded-xl border border-hair bg-white px-4 py-3 text-[0.88rem] text-ink">{notice.slice(0, 300)}</p>}

      <div className="grid items-start gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <AdminCard title="Items">
            <ul className="divide-y divide-hair">
              {(items ?? []).map((i, n) => (
                <li key={n} className="flex justify-between gap-4 py-2.5 text-[0.9rem]">
                  <span>
                    <span className="font-semibold text-ink">
                      {i.quantity} × {i.name}
                    </span>
                    <span className="block text-[0.78rem] text-slate">
                      {formatNaira(Number(i.unit_price_ngn))} each{i.kind === "kit" ? " · solar kit" : ""}
                    </span>
                    {i.kit_parts && <span className="block text-[0.76rem] text-slate">{(i.kit_parts as string[]).join(" · ")}</span>}
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">{formatNaira(Number(i.line_total_ngn))}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-between border-t border-hair pt-3 font-heading">
              <span className="font-bold">Subtotal</span>
              <span className="text-[1.2rem] font-extrabold tabular-nums">{formatNaira(Number(o.subtotal_ngn))}</span>
            </div>
            {o.has_unpriced_parts && <p className="mt-1 text-[0.8rem] text-slate">Kit accessories or quoted extras still need pricing — agree them with the customer.</p>}
            <p className="mt-1 text-[0.8rem] text-slate">Payment method: {PAYMENT_METHOD[o.payment_method] ?? o.payment_method}{o.payment_reference ? ` · ref ${o.payment_reference}` : ""}</p>
          </AdminCard>

          <AdminCard title="Timeline">
            {manage && (
              <form action={addOrderNote} className="mb-4 flex gap-2">
                <input type="hidden" name="id" value={o.id} />
                <input name="message" maxLength={1000} placeholder="Add an internal note (customers never see these)" className={inputClass} />
                <button type="submit" className={ghostButtonClass}>
                  Add note
                </button>
              </form>
            )}
            <ol className="space-y-3">
              {(events ?? []).map((e) => (
                <li key={e.id} className="border-l-2 border-blue/20 pl-3 text-[0.86rem]">
                  <p className="text-ink">
                    <strong>{EVENT_LABEL[e.kind] ?? e.kind}:</strong>{" "}
                    {e.from_value && e.to_value ? `${e.from_value} → ${e.to_value}` : ""}
                    {e.message && <span className="text-slate">{e.from_value ? " — " : ""}{e.message}</span>}
                  </p>
                  <p className="text-[0.74rem] text-slate-light">
                    {e.actor_email ?? "system"} · {new Date(e.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </li>
              ))}
              <li className="border-l-2 border-blue/20 pl-3 text-[0.86rem] text-slate">Order placed on the website · {new Date(o.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</li>
            </ol>
          </AdminCard>
        </div>

        <div className="space-y-4">
          <AdminCard title="Customer">
            <p className="font-semibold text-ink">{o.full_name}</p>
            <p className="text-[0.86rem] text-slate">{o.customer_id ? "Registered account" : "Guest checkout"}</p>
            <p className="mt-2 text-[0.88rem]">
              <a href={`tel:${o.phone}`} className="font-semibold text-blue hover:underline">
                {o.phone}
              </a>
              {o.email && (
                <>
                  <br />
                  <a href={`mailto:${o.email}`} className="text-blue hover:underline">
                    {o.email}
                  </a>
                </>
              )}
            </p>
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex h-9 items-center rounded-full bg-whatsapp px-4 font-heading text-[0.82rem] font-semibold text-white">
                WhatsApp customer
              </a>
            )}
            <p className="mt-4 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-slate-light">Deliver to</p>
            <p className="text-[0.88rem] text-ink">
              {o.delivery_address}
              <br />
              {o.city}, {o.state}
            </p>
            {o.notes && (
              <>
                <p className="mt-3 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-slate-light">Customer&rsquo;s note</p>
                <p className="text-[0.86rem] text-ink">{o.notes}</p>
              </>
            )}
          </AdminCard>

          {manage ? (
            <>
              <AdminCard title="Order status">
                {next.length ? (
                  <div className="space-y-2">
                    {next.map((to) =>
                      to === "cancelled" || to === "returned" ? (
                        <form key={to} action={changeOrderStatus} className="space-y-1.5 rounded-xl border border-hair p-2.5">
                          <input type="hidden" name="id" value={o.id} />
                          <input type="hidden" name="to" value={to} />
                          <input name="reason" required maxLength={500} placeholder={`Reason (required)`} className={`${inputClass} h-9`} />
                          <button type="submit" className={`${ghostButtonClass} w-full hover:border-red hover:text-red`}>
                            {STATUS_ACTION_LABEL[to]}
                          </button>
                        </form>
                      ) : (
                        <form key={to} action={changeOrderStatus}>
                          <input type="hidden" name="id" value={o.id} />
                          <input type="hidden" name="to" value={to} />
                          <button type="submit" className={`${buttonClass} w-full`}>
                            {STATUS_ACTION_LABEL[to]}
                          </button>
                        </form>
                      ),
                    )}
                    {o.status === "new" && <p className="text-[0.74rem] text-slate">Confirming deducts any tracked stock for this order.</p>}
                  </div>
                ) : (
                  <p className="text-[0.86rem] text-slate">This order is {ORDER_STATUS[o.status]?.label.toLowerCase()} — no further steps.</p>
                )}
              </AdminCard>

              {(canRecordPayment(o.payment_status, "paid") || canRecordPayment(o.payment_status, "refunded")) && (
                <AdminCard title="Payment">
                  <form action={recordPayment} className="space-y-2">
                    <input type="hidden" name="id" value={o.id} />
                    <input type="hidden" name="to" value={canRecordPayment(o.payment_status, "paid") ? "paid" : "refunded"} />
                    <input
                      name="note"
                      required
                      maxLength={300}
                      placeholder={canRecordPayment(o.payment_status, "paid") ? "How it was paid, e.g. Bank transfer ref 12345" : "Refund details: amount, method, reference"}
                      className={`${inputClass} h-9`}
                    />
                    <button type="submit" className={`${canRecordPayment(o.payment_status, "paid") ? buttonClass : ghostButtonClass} w-full`}>
                      {canRecordPayment(o.payment_status, "paid") ? `Record payment of ${formatNaira(Number(o.subtotal_ngn))}` : "Record refund"}
                    </button>
                  </form>
                </AdminCard>
              )}
            </>
          ) : (
            <AdminCard>
              <p className="text-[0.86rem] text-slate">Your role can view orders but not change them.</p>
            </AdminCard>
          )}
        </div>
      </div>
    </>
  );
}
