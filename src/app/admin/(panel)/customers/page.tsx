import Link from "next/link";
import { AdminCard, AdminHeader, NoAccess, ghostButtonClass, inputClass } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/data/products";

export const metadata = { title: "Customers" };

export default async function CustomersPage(props: PageProps<"/admin/customers">) {
  const { staff } = await getStaff();
  if (!can(staff, "customers.view")) return <NoAccess reason="permission" />;
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 60).replace(/[%,()]/g, " ") : "";

  const admin = supabaseAdmin();
  let pq = admin.from("customer_profiles").select("id, full_name, phone, city, state, created_at").order("created_at", { ascending: false }).limit(500);
  if (q) pq = pq.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`);
  const [{ data: profiles }, { data: orders }, users] = await Promise.all([
    pq,
    admin.from("orders").select("customer_id, subtotal_ngn, status, created_at").not("customer_id", "is", null),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);
  const emails = new Map((users.data?.users ?? []).map((u) => [u.id, u.email ?? ""]));
  const stats = new Map<string, { count: number; total: number; last: string }>();
  for (const o of orders ?? []) {
    const s = stats.get(o.customer_id!) ?? { count: 0, total: 0, last: "" };
    s.count++;
    if (o.status !== "cancelled") s.total += Number(o.subtotal_ngn);
    if (o.created_at > s.last) s.last = o.created_at;
    stats.set(o.customer_id!, s);
  }

  return (
    <>
      <AdminHeader title="Customers" intro="People who created an account on the website. Guest orders appear under Orders." />
      <form action="/admin/customers" className="mb-3 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Search name or phone" aria-label="Search customers" className={`${inputClass} h-9 max-w-[280px]`} />
        <button type="submit" className={ghostButtonClass}>
          Search
        </button>
      </form>
      <AdminCard className="p-0">
        {profiles?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[0.88rem]">
              <thead className="border-b border-hair text-[0.72rem] uppercase tracking-[0.08em] text-slate">
                <tr>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 text-right font-semibold">Orders</th>
                  <th className="px-4 py-3 text-right font-semibold">Total spent</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hair">
                {profiles.map((p) => {
                  const s = stats.get(p.id);
                  return (
                    <tr key={p.id} className="hover:bg-field/60">
                      <td className="px-4 py-2.5">
                        <Link href={`/admin/customers/${p.id}`} className="font-semibold text-blue hover:underline">
                          {p.full_name}
                        </Link>
                        <span className="block text-[0.76rem] text-slate">
                          {p.phone} · {emails.get(p.id)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate">{[p.city, p.state].filter(Boolean).join(", ") || "—"}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{s?.count ?? 0}</td>
                      <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{s ? formatNaira(s.total) : "—"}</td>
                      <td className="px-4 py-2.5 text-[0.8rem] text-slate">{new Date(p.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-5 text-slate">{q ? "No customers match." : "No customer accounts yet."}</p>
        )}
      </AdminCard>
    </>
  );
}
