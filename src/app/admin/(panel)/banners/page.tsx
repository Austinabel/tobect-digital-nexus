import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminCard, AdminHeader, NoAccess, buttonClass, ghostButtonClass } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { POSITIONS, campaignState, type CampaignState } from "@/lib/admin/campaign-form";
import { archiveBanner, deleteBanner, restoreBanner } from "./actions";
import { BannerTabs } from "./banner-tabs";

export const metadata = { title: "Banners & slides" };

const STATE: Record<CampaignState, { label: string; cls: string }> = {
  live: { label: "Live", cls: "bg-[#e6f6ec] text-[#17733b]" },
  "always-on": { label: "Always on", cls: "bg-mist text-blue" },
  scheduled: { label: "Scheduled", cls: "bg-[#fff6e0] text-[#8a5a00]" },
  ended: { label: "Ended", cls: "bg-field text-slate" },
  draft: { label: "Draft", cls: "bg-field text-slate" },
};

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-NG", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" }) : null);

export default async function BannersPage(props: PageProps<"/admin/banners">) {
  const { staff } = await getStaff();
  if (!can(staff, "content.manage")) return <NoAccess reason="permission" />;
  const { view, notice } = await props.searchParams;
  const archived = view === "archived";

  let q = supabaseAdmin().from("campaigns").select("id, title, kicker, position, desktop_image_url, active, evergreen, priority, starts_at, ends_at, archived_at, designed_banner").order("priority", { ascending: false }).order("created_at");
  q = archived ? q.not("archived_at", "is", null) : q.is("archived_at", null);
  const { data: rows } = await q;
  const now = new Date();

  return (
    <>
      <AdminHeader
        title="Banners & slides"
        intro="Promotions and always-on banners on the shop page, and the homepage background slideshow. Promotions with an end date disappear by themselves."
        actions={
          <Link href="/admin/banners/new" className={buttonClass}>
            + New banner
          </Link>
        }
      />
      <BannerTabs current={archived ? "archived" : "banners"} />
      {typeof notice === "string" && (
        <p role="status" className="mb-4 rounded-xl border border-hair bg-white px-4 py-3 text-[0.88rem] text-ink">
          {notice.slice(0, 200)}
        </p>
      )}

      {archived ? (
        <AdminCard className="p-0">
          {rows?.length ? (
            <ul className="divide-y divide-hair">
              {rows.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <span>
                    <span className="font-semibold text-ink">{c.title}</span>
                    <span className="block text-[0.76rem] text-slate">{POSITIONS.find((p) => p.value === c.position)?.label} · archived {when(c.archived_at)}</span>
                  </span>
                  <span className="flex gap-2">
                    <form action={restoreBanner}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className={ghostButtonClass}>Restore</button>
                    </form>
                    <form action={deleteBanner}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className={`${ghostButtonClass} hover:border-red hover:text-red`}>Delete forever</button>
                    </form>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-5 text-slate">Nothing archived.</p>
          )}
        </AdminCard>
      ) : (
        <div className="space-y-4">
          {POSITIONS.map((p) => {
            const list = (rows ?? []).filter((c) => c.position === p.value);
            return (
              <AdminCard key={p.value} title={p.label} className="p-0 [&>h2]:px-5 [&>h2]:pt-4">
                {list.length ? (
                  <ul className="divide-y divide-hair">
                    {list.map((c) => {
                      const st = STATE[campaignState(c, now)];
                      return (
                        <li key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap">
                          <span className="relative block h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-[linear-gradient(115deg,#0b1930_0%,#10306b_60%,#1556d9_130%)]">
                            {c.desktop_image_url && <Image src={c.desktop_image_url} alt="" fill sizes="80px" className="object-cover" />}
                          </span>
                          <span className="min-w-0 grow">
                            <Link href={`/admin/banners/${c.id}`} className="font-semibold text-blue hover:underline">
                              {c.title}
                            </Link>
                            <span className="block text-[0.76rem] text-slate">
                              {[c.kicker, c.designed_banner && "designed banner", `priority ${c.priority}`, c.starts_at && `from ${when(c.starts_at)}`, c.ends_at && `until ${when(c.ends_at)}`].filter(Boolean).join(" · ")}
                            </span>
                          </span>
                          <span className={cn("rounded-md px-2 py-0.5 text-[0.72rem] font-bold", st.cls)}>{st.label}</span>
                          <form action={archiveBanner}>
                            <input type="hidden" name="id" value={c.id} />
                            <button className={`${ghostButtonClass} hover:border-red hover:text-red`} aria-label={`Archive ${c.title}`}>
                              Archive
                            </button>
                          </form>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="px-5 pb-4 text-[0.86rem] text-slate">Nothing here — this position stays hidden on the shop until you add a banner.</p>
                )}
              </AdminCard>
            );
          })}
        </div>
      )}
    </>
  );
}
