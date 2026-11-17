import { AdminCard, AdminHeader, NoAccess, buttonClass, ghostButtonClass } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export const metadata = { title: "Backup & export" };

export default async function BackupPage() {
  const { staff } = await getStaff();
  if (!can(staff, "team.manage")) return <NoAccess reason="permission" />;
  const { data: last } = await supabaseAdmin().from("admin_activity").select("actor_email, created_at").eq("action", "backup.download").order("created_at", { ascending: false }).limit(1);
  const prev = last?.[0];

  return (
    <>
      <AdminHeader title="Backup & export" intro="Download a copy of everything entered into the website. Only the owner can do this, because the files include customers' personal details — store them safely." />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <AdminCard title="Full backup">
          <p className="text-[0.88rem] text-slate">
            One file with all business data: settings, pages, products, categories, kits, banners, orders, quote requests, customers, staff roles and the activity log. Passwords and private order links are never included. Images stay in your storage; the backup lists their
            addresses.
          </p>
          <a href="/admin/backup/full-backup.json" download className={`${buttonClass} mt-4`}>
            Download full backup (.json)
          </a>
          <p className="mt-2 text-[0.76rem] text-slate-light">
            {prev ? `Last downloaded ${new Date(prev.created_at).toLocaleString("en-NG", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" })} by ${prev.actor_email}.` : "Not downloaded yet."} A monthly copy kept somewhere safe is a good habit.
          </p>
        </AdminCard>
        <AdminCard title="Spreadsheets">
          <p className="text-[0.88rem] text-slate">For Excel or Google Sheets.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href="/admin/backup/products.csv" download className={ghostButtonClass}>
              Products (.csv)
            </a>
            <a href="/admin/backup/customers.csv" download className={ghostButtonClass}>
              Customers (.csv)
            </a>
            <a href="/admin/reports/orders.csv?days=365" download className={ghostButtonClass}>
              Orders, last 12 months (.csv)
            </a>
          </div>
        </AdminCard>
        <AdminCard title="Restoring" className="lg:col-span-2">
          <p className="text-[0.88rem] text-slate">
            Restoring overwrites live data, so it isn&rsquo;t a button here. If you ever need to restore, give the backup file to your developer — the steps are in <code className="rounded bg-field px-1">ADMIN.md</code>, which comes with the website&rsquo;s code. Supabase also keeps its own
            database backups; check your plan in the Supabase dashboard.
          </p>
        </AdminCard>
      </div>
    </>
  );
}
