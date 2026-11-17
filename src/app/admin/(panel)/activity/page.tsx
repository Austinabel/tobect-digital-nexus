import { AdminCard, AdminHeader, NoAccess } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export const metadata = { title: "Activity log" };

export default async function ActivityPage() {
  const { staff } = await getStaff();
  if (!can(staff, "activity.view")) return <NoAccess reason="permission" />;
  const { data: rows } = await supabaseAdmin().from("admin_activity").select("id, actor_email, action, entity_type, summary, created_at").order("created_at", { ascending: false }).limit(300);

  return (
    <>
      <AdminHeader title="Activity log" intro="Every change made in the admin — who did it and when. Entries can't be edited or deleted." />
      <AdminCard>
        {rows && rows.length > 0 ? (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[0.86rem]">
              <thead className="text-[0.72rem] uppercase tracking-[0.08em] text-slate">
                <tr className="border-b border-hair">
                  <th className="px-5 py-2 font-semibold">When</th>
                  <th className="px-5 py-2 font-semibold">Who</th>
                  <th className="px-5 py-2 font-semibold">What</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hair">
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap px-5 py-2.5 text-slate">{new Date(r.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td className="px-5 py-2.5 text-ink">{r.actor_email ?? "system"}</td>
                    <td className="px-5 py-2.5 text-ink">
                      {r.summary}
                      <span className="ml-2 rounded bg-field px-1.5 py-0.5 text-[0.68rem] text-slate">{r.action}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate">No admin changes recorded yet.</p>
        )}
      </AdminCard>
    </>
  );
}
