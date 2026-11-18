import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminCard, AdminHeader, NoAccess, buttonClass } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { getSite } from "@/lib/site-server";
import { bankTransferDetails } from "@/lib/site";
import { emailEnabled } from "@/lib/email/send";
import { sampleEmails } from "@/lib/email/samples";
import { sendTestEmail } from "./actions";

export const metadata = { title: "Emails" };

export default async function EmailsPage(props: PageProps<"/admin/emails">) {
  const { staff } = await getStaff();
  if (!can(staff, "settings.manage")) return <NoAccess reason="permission" />;
  const sp = await props.searchParams;
  const site = await getSite();
  const samples = sampleEmails(site);
  const show = samples.find((s) => s.key === sp.show) ?? samples[0];
  const notice = typeof sp.notice === "string" ? sp.notice.slice(0, 300) : null;
  const on = emailEnabled();

  return (
    <>
      <AdminHeader
        title="Emails"
        intro="The emails the website sends automatically. They use your logo, contact details and bank account from Site settings, so changes there show up here."
      />
      {notice && <p role="status" className="mb-4 rounded-xl border border-hair bg-white px-4 py-3 text-[0.88rem] text-ink">{notice}</p>}

      <AdminCard className={cn("mb-4", on ? "border-whatsapp/40" : "border-gold/50 bg-[#fffaf0]")}>
        {on ? (
          <p className="text-[0.9rem] text-ink">
            <b>Sending is on.</b> Emails go out from <code className="rounded bg-field px-1.5 py-0.5 text-[0.82rem]">{process.env.EMAIL_FROM}</code>. Order and quote alerts go to{" "}
            <b>{site.alertEmail || site.email}</b> (change it in{" "}
            <Link href="/admin/settings" className="font-semibold text-blue hover:underline">
              Site settings
            </Link>
            ).
          </p>
        ) : (
          <p className="text-[0.9rem] text-ink">
            <b>Sending isn&rsquo;t switched on yet.</b> Everything below is ready; emails start going out once the Resend key (<code>RESEND_API_KEY</code>) and sender address (
            <code>EMAIL_FROM</code>) are added to the website&rsquo;s settings on Vercel. Until then orders and quotes still arrive in the admin as usual.
          </p>
        )}
        {!bankTransferDetails(site) && (
          <p className="mt-2 text-[0.84rem] text-slate">
            Tip: add your bank details in{" "}
            <Link href="/admin/settings" className="font-semibold text-blue hover:underline">
              Site settings
            </Link>{" "}
            to offer “Pay by bank transfer” — the order email then includes them.
          </p>
        )}
      </AdminCard>

      <div className="grid items-start gap-4 lg:grid-cols-[280px_1fr]">
        <nav aria-label="Email templates" className="grid gap-2">
          {samples.map((s) => (
            <Link
              key={s.key}
              href={`/admin/emails?show=${s.key}`}
              aria-current={s.key === show.key ? "page" : undefined}
              className={cn("rounded-2xl border bg-white p-3.5", s.key === show.key ? "border-blue ring-2 ring-blue/15" : "border-hair hover:border-blue")}
            >
              <span className="block font-heading text-[0.92rem] font-bold text-ink">{s.label}</span>
              <span className="block text-[0.78rem] text-slate">
                To: {s.who} · {s.when}
              </span>
            </Link>
          ))}
        </nav>
        <AdminCard className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hair px-4 py-3">
            <p className="min-w-0 text-[0.86rem] text-slate">
              Subject: <b className="text-ink">{show.email.subject}</b>
            </p>
            <form action={sendTestEmail}>
              <input type="hidden" name="template" value={show.key} />
              <button type="submit" disabled={!on} className={buttonClass} title={on ? undefined : "Available once sending is switched on"}>
                Send a test to me
              </button>
            </form>
          </div>
          <iframe title={`${show.label} email preview`} srcDoc={show.email.html} sandbox="" className="h-[900px] w-full rounded-b-2xl bg-[#f3f6fb]" />
          <p className="px-4 pb-3 text-[0.76rem] text-slate">Preview filled with example details. Real emails use the customer&rsquo;s own name, order and items.</p>
        </AdminCard>
      </div>
    </>
  );
}
