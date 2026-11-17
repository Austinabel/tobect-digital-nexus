import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { AdminCard, AdminHeader, NoAccess } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/data/products";
import { ORDER_STATUS, PAYMENT_STATUS } from "@/lib/shop/order-labels";
import { badge, customerWhatsApp } from "@/lib/admin/contact";

export const metadata = { title: "Customer" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function CustomerPage(props: PageProps<"/admin/customers/[id]">) {
  const { staff } = await getStaff();
  if (!can(staff, "customers.view")) return <NoAccess reason="permission" />;
  const { id } = await props.params;
  if (!UUID.test(id)) notFound();

  const admin = supabaseAdmin();
  const [{ data: p }, { data: orders }, { count: designs }, user] = await Promise.all([
    admin.from("customer_profiles").select("*").eq("id", id).maybeSingle(),
    admin.from("orders").select("id, order_number, created_at, subtotal_ngn, status, payment_status").eq("customer_id", id).order("created_at", { ascending: false }),
    admin.from("saved_designs").select("id", { count: "exact", head: true }).eq("customer_id", id),
    admin.auth.admin.getUserById(id),
  ]);
  if (!p) notFound();
  const email = user.data.user?.email;
  const wa = customerWhatsApp(p.phone, `Hello ${p.full_name.split(" ")[0]}, this is Tobecat Technologies.`);

  return (
    <>
      <AdminHeader title={p.full_name} intro={<Link href="/admin/customers" className="font-semibold text-blue hover:underline">← All customers</Link>} />
      <div className="grid items-start gap-4 xl:grid-cols-[1fr_340px]">
        <AdminCard title={`Orders (${orders?.length ?? 0})`}>
          {orders?.length ? (
            <ul className="divide-y divide-hair">
              {orders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <Link href={`/admin/orders/${o.id}`} className="font-heading font-bold text-blue hover:underline">
                    {o.order_number}
                  </Link>
                  <span className="flex items-center gap-2 text-[0.84rem]">
                    <span className={cn("rounded-md px-2 py-0.5 text-[0.72rem] font-bold", badge.status[o.status])}>{ORDER_STATUS[o.status]?.label}</span>
                    <span className={cn("rounded-md px-2 py-0.5 text-[0.72rem] font-bold", badge.payment[o.payment_status])}>{PAYMENT_STATUS[o.payment_status]}</span>
                    <span className="font-semibold tabular-nums">{formatNaira(Number(o.subtotal_ngn))}</span>
                    <span className="text-slate-light">{new Date(o.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate">No orders yet.</p>
          )}
        </AdminCard>
        <AdminCard title="Details">
          <p className="text-[0.88rem]">
            <a href={`tel:${p.phone}`} className="font-semibold text-blue hover:underline">
              {p.phone}
            </a>
            {email && (
              <>
                <br />
                <a href={`mailto:${email}`} className="text-blue hover:underline">
                  {email}
                </a>
              </>
            )}
          </p>
          {(p.delivery_address || p.city) && (
            <p className="mt-2 text-[0.86rem] text-ink">
              {p.delivery_address}
              {p.delivery_address && <br />}
              {[p.city, p.state].filter(Boolean).join(", ")}
            </p>
          )}
          <p className="mt-2 text-[0.82rem] text-slate">
            Joined {new Date(p.created_at).toLocaleDateString("en-NG", { dateStyle: "medium" })} · {designs ?? 0} saved solar design{designs === 1 ? "" : "s"}
          </p>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex h-9 items-center rounded-full bg-whatsapp px-4 font-heading text-[0.82rem] font-semibold text-white">
              WhatsApp customer
            </a>
          )}
        </AdminCard>
      </div>
    </>
  );
}
