import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { AdminCard, AdminHeader, NoAccess, buttonClass, inputClass } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { customerWhatsApp } from "@/lib/admin/contact";
import { logQuoteResponse, updateQuote } from "../actions";
import { QUOTE_BADGE, QUOTE_STATUSES } from "@/lib/admin/quotes";

export const metadata = { title: "Quote request" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function QuotePage(props: PageProps<"/admin/quotes/[id]">) {
  const { staff } = await getStaff();
  if (!can(staff, "quotes.manage")) return <NoAccess reason="permission" />;
  const { id } = await props.params;
  if (!UUID.test(id)) notFound();
  const { notice, send } = await props.searchParams;

  const admin = supabaseAdmin();
  const [{ data: r }, { data: items }, { data: replies }] = await Promise.all([
    admin.from("quote_requests").select("*").eq("id", id).maybeSingle(),
    admin.from("quote_request_items").select("description, quantity, product_slug").eq("request_id", id),
    admin.from("quote_responses").select("id, message, created_at, author").eq("request_id", id).order("created_at", { ascending: false }),
  ]);
  if (!r) notFound();
  const last = replies?.[0];
  const waLast = send === "1" && last ? customerWhatsApp(r.phone, last.message) : null;
  const waBlank = customerWhatsApp(r.phone, `Hello ${r.name.split(" ")[0]}, this is Tobecat Technologies about your request ${r.reference}.`);

  return (
    <>
      <AdminHeader
        title={`${r.reference} · ${r.business_name || r.name}`}
        intro={
          <span className="flex flex-wrap items-center gap-2">
            <Link href="/admin/quotes" className="font-semibold text-blue hover:underline">
              ← All requests
            </Link>
            <span className={cn("rounded-md px-2 py-0.5 text-[0.74rem] font-bold capitalize", QUOTE_BADGE[r.status])}>{r.status}</span>
            <span className="text-slate">
              {r.kind === "bulk" ? "Bulk / commercial" : "Quote request"} · {new Date(r.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
            </span>
          </span>
        }
      />
      {typeof notice === "string" && (
        <p role="status" className="mb-4 rounded-xl border border-hair bg-white px-4 py-3 text-[0.88rem] text-ink">
          {notice.slice(0, 200)}{" "}
          {waLast && (
            <a href={waLast} target="_blank" rel="noopener noreferrer" className="ml-1 font-semibold text-whatsapp underline">
              Open WhatsApp with this reply
            </a>
          )}
        </p>
      )}

      <div className="grid items-start gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <AdminCard title="Request">
            {r.services?.length > 0 && (
              <p className="mb-2 text-[0.88rem]">
                <strong>Interested in:</strong> {(r.services as string[]).join(" · ")}
              </p>
            )}
            {items && items.length > 0 && (
              <table className="mb-3 w-full text-left text-[0.88rem]">
                <thead className="text-[0.72rem] uppercase tracking-[0.08em] text-slate">
                  <tr className="border-b border-hair">
                    <th className="py-2 font-semibold">Product</th>
                    <th className="py-2 text-right font-semibold">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hair">
                  {items.map((i, n) => (
                    <tr key={n}>
                      <td className="py-2">
                        {i.product_slug ? (
                          <Link href={`/admin/products/${i.product_slug}`} className="font-semibold text-blue hover:underline">
                            {i.description}
                          </Link>
                        ) : (
                          i.description
                        )}
                      </td>
                      <td className="py-2 text-right font-semibold tabular-nums">{i.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {r.project_description ? <p className="whitespace-pre-line text-[0.9rem] text-ink">{r.project_description}</p> : !items?.length && <p className="text-slate">No message.</p>}
          </AdminCard>

          <AdminCard title="Reply">
            <form action={logQuoteResponse} className="space-y-2">
              <input type="hidden" name="id" value={r.id} />
              <textarea name="message" rows={4} required maxLength={3000} placeholder="Your quotation or questions for the customer…" className={`${inputClass} h-auto py-2`} />
              <button type="submit" className={buttonClass}>
                Save reply &amp; open WhatsApp
              </button>
            </form>
            {replies && replies.length > 0 && (
              <ol className="mt-4 space-y-2">
                {replies.map((x) => (
                  <li key={x.id} className="rounded-xl bg-field px-3 py-2 text-[0.86rem]">
                    <p className="whitespace-pre-line text-ink">{x.message}</p>
                    <p className="mt-1 text-[0.72rem] text-slate-light">{new Date(x.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</p>
                  </li>
                ))}
              </ol>
            )}
          </AdminCard>
        </div>

        <div className="space-y-4">
          <AdminCard title="Customer">
            <p className="font-semibold text-ink">{r.name}</p>
            {r.business_name && <p className="text-[0.86rem] text-slate">{r.business_name}</p>}
            {r.customer_type && <p className="text-[0.86rem] text-slate">{r.customer_type}</p>}
            <p className="mt-2 text-[0.88rem]">
              <a href={`tel:${r.phone}`} className="font-semibold text-blue hover:underline">
                {r.phone}
              </a>
              {r.email && (
                <>
                  <br />
                  <a href={`mailto:${r.email}`} className="text-blue hover:underline">
                    {r.email}
                  </a>
                </>
              )}
            </p>
            <p className="mt-2 text-[0.86rem] text-ink">📍 {r.delivery_location}</p>
            {waBlank && (
              <a href={waBlank} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex h-9 items-center rounded-full bg-whatsapp px-4 font-heading text-[0.82rem] font-semibold text-white">
                WhatsApp customer
              </a>
            )}
          </AdminCard>
          <AdminCard title="Status & notes">
            <form action={updateQuote} className="space-y-2">
              <input type="hidden" name="id" value={r.id} />
              <select name="status" defaultValue={r.status} className={`${inputClass} capitalize`}>
                {QUOTE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <textarea name="staff_notes" rows={4} maxLength={3000} defaultValue={r.staff_notes ?? ""} placeholder="Internal notes (customers never see these)" className={`${inputClass} h-auto py-2`} />
              <button type="submit" className={`${buttonClass} w-full`}>
                Save
              </button>
            </form>
          </AdminCard>
        </div>
      </div>
    </>
  );
}
