import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/marketing/page-hero";
import { ProfileForm } from "@/components/account/profile-form";
import { supabaseServer } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/data/products";
import { ORDER_STATUS, PAYMENT_STATUS } from "@/lib/shop/order-labels";
import { logout } from "./actions";
import { getStaff } from "@/lib/admin/auth";
import { deleteDesign } from "../solar-calculator/actions";
import { BankTransferBox } from "@/components/shop/bank-transfer-box";
import { bankTransferDetails } from "@/lib/site";
import { getSite } from "@/lib/site-server";

export const metadata: Metadata = { title: "My Account", robots: { index: false, follow: false } };

export default async function AccountPage(props: PageProps<"/account">) {
  const passwordUpdated = (await props.searchParams).password === "updated";
  const { staff } = await getStaff();
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/account/login?next=/account");
  const bank = bankTransferDetails(await getSite());

  // Both reads go through row-level security: customers only ever get their own rows.
  const [{ data: profile }, { data: orders }, { data: designs }] = await Promise.all([
    supabase.from("customer_profiles").select("full_name, phone, delivery_address, city, state").eq("id", data.user.id).maybeSingle(),
    supabase
      .from("orders")
      .select("id, order_number, created_at, subtotal_ngn, status, payment_status, payment_method, order_items(name, quantity)")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("saved_designs").select("id, name, share_code, summary, created_at").order("created_at", { ascending: false }).limit(50),
  ]);

  return (
    <>
      <PageHero kicker="My Account" title={`Hello, ${(profile?.full_name ?? "there").split(" ")[0]}`} intro={data.user.email} crumbs={[{ label: "Account" }]}>
        <div className="mt-5 flex flex-wrap gap-2">
        {staff && (
          <Link href="/admin" className="inline-flex h-10 items-center rounded-full bg-ink px-5 font-heading text-[0.86rem] font-semibold text-white hover:bg-blue-deep">
            Go to admin ({staff.roleLabel})
          </Link>
        )}
        <form action={logout}>
          <button type="submit" className="h-10 rounded-full border border-hair bg-white px-5 font-heading text-[0.86rem] font-semibold text-slate hover:border-red hover:text-red">
            Sign out
          </button>
        </form>
        </div>
      </PageHero>
      <section className="bg-mist/50 py-8 lg:py-12">
        {passwordUpdated && (
          <p role="status" className="mx-auto mb-5 max-w-[1240px] px-4 sm:px-6 lg:px-9">
            <span className="block rounded-xl border border-[#bfe4cd] bg-[#effaf3] px-4 py-3 text-[0.9rem] font-semibold text-[#17733b]">
              Your password has been updated.
            </span>
          </p>
        )}
        <div className="mx-auto grid max-w-[1240px] items-start gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_400px] lg:px-9">
          <div className="rounded-3xl border border-hair bg-white p-5 sm:p-6">
            <h2 className="font-heading text-[1.15rem] font-bold text-ink">My orders</h2>
            {orders && orders.length > 0 ? (
              <ul className="mt-4 divide-y divide-hair">
                {orders.map((o) => {
                  const st = ORDER_STATUS[o.status] ?? ORDER_STATUS.new;
                  return (
                    <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                      <div className="min-w-0">
                        <Link href={`/account/orders/${o.id}`} className="font-heading font-bold text-blue hover:underline">
                          {o.order_number} — view details →
                        </Link>
                        <p className="text-[0.8rem] text-slate">
                          {new Date(o.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })} ·{" "}
                          {(o.order_items as { name: string; quantity: number }[]).map((i) => `${i.quantity} × ${i.name}`).join(", ")}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("rounded-full px-2.5 py-1 text-[0.72rem] font-semibold", st.tone)}>{st.label}</span>
                        <span className="rounded-full bg-field px-2.5 py-1 text-[0.72rem] font-semibold text-slate">{PAYMENT_STATUS[o.payment_status] ?? o.payment_status}</span>
                        <span className="font-heading font-extrabold tabular-nums text-ink">{formatNaira(o.subtotal_ngn)}</span>
                      </div>
                      {bank && o.payment_method === "bank-transfer" && o.payment_status === "unpaid" && !["cancelled", "returned"].includes(o.status) && (
                        <div className="basis-full">
                          <BankTransferBox bank={bank} orderNumber={o.order_number} amountNgn={Number(o.subtotal_ngn)} compact />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 text-slate">
                No orders yet.{" "}
                <Link href="/shop" className="font-semibold text-blue hover:underline">
                  Start shopping
                </Link>
              </p>
            )}
          </div>
          <div className="rounded-3xl border border-hair bg-white p-5 sm:p-6 lg:col-start-1 lg:row-start-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-heading text-[1.15rem] font-bold text-ink">Saved solar designs</h2>
              <Link href="/solar-calculator" className="text-[0.84rem] font-semibold text-blue hover:underline">
                New design →
              </Link>
            </div>
            {designs && designs.length > 0 ? (
              <ul className="mt-3 divide-y divide-hair">
                {designs.map((d) => {
                  const s = (d.summary ?? {}) as { inverterKva?: number; batteryKwh?: number; panels?: number; panelWatt?: number; dailyKwh?: number };
                  return (
                    <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                      <div className="min-w-0">
                        <p className="font-heading font-bold text-ink">{d.name}</p>
                        <p className="text-[0.8rem] text-slate">
                          {[s.inverterKva && `${s.inverterKva} kVA`, s.batteryKwh && `${s.batteryKwh} kWh battery`, s.panels && `${s.panels} × ${s.panelWatt} W panels`, s.dailyKwh && `${s.dailyKwh} kWh/day`]
                            .filter(Boolean)
                            .join(" · ")}{" "}
                          · saved {new Date(d.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/solar-calculator?d=${d.share_code}`} className="inline-flex h-9 items-center rounded-full bg-blue px-4 font-heading text-[0.8rem] font-semibold text-white hover:bg-blue-deep">
                          Open
                        </Link>
                        <form action={deleteDesign}>
                          <input type="hidden" name="id" value={d.id} />
                          <button type="submit" aria-label={`Delete ${d.name}`} className="inline-flex h-9 items-center rounded-full border border-hair px-3.5 text-[0.8rem] font-semibold text-slate hover:border-red hover:text-red">
                            Delete
                          </button>
                        </form>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 text-slate">
                No saved designs yet. Size a system with the{" "}
                <Link href="/solar-calculator" className="font-semibold text-blue hover:underline">
                  solar calculator
                </Link>{" "}
                and save it here.
              </p>
            )}
          </div>
          <div className="rounded-3xl border border-hair bg-white p-5 sm:p-6">
            <h2 className="font-heading text-[1.15rem] font-bold text-ink">Delivery details</h2>
            <p className="mt-1 text-[0.84rem] text-slate">Saved details fill in automatically at checkout.</p>
            <div className="mt-4">
              <ProfileForm profile={profile ?? { full_name: "", phone: "", delivery_address: null, city: null, state: null }} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
