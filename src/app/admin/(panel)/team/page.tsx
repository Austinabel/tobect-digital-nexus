import { AdminCard, AdminHeader, NoAccess, ghostButtonClass, inputClass } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { changeRole, removeStaff, setActive } from "./actions";
import { AddStaffForm } from "./add-staff-form";

export const metadata = { title: "Team & roles" };

const PERMISSION_LABELS: Record<string, string> = {
  "settings.manage": "Site settings",
  "team.manage": "Team",
  "content.manage": "Pages & banners",
  "media.manage": "Media",
  "products.manage": "Products",
  "catalog.manage": "Categories & kits",
  "orders.view": "View orders",
  "orders.manage": "Confirm orders & payments",
  "quotes.manage": "Quotes",
  "customers.view": "Customers",
  "activity.view": "Activity log",
  "calculator.manage": "Calculator settings",
};

export default async function TeamPage(props: PageProps<"/admin/team">) {
  const { error: notice } = await props.searchParams;
  const { staff } = await getStaff();
  if (!can(staff, "team.manage")) return <NoAccess reason="permission" />;

  const admin = supabaseAdmin();
  const [{ data: roles }, { data: members }] = await Promise.all([
    admin.from("admin_roles").select("key, label, description, permissions").order("sort_order"),
    admin.from("staff_members").select("user_id, role_key, active, created_at").order("created_at"),
  ]);
  const people = await Promise.all(
    (members ?? []).map(async (m) => {
      const { data } = await admin.auth.admin.getUserById(m.user_id);
      return { ...m, email: data.user?.email ?? "(deleted account)" };
    }),
  );
  const roleLabel = (k: string) => roles?.find((r) => r.key === k)?.label ?? k;

  return (
    <>
      <AdminHeader title="Team & roles" intro="Give your staff exactly the access they need. Everyone signs in with their normal website account." />
      {typeof notice === "string" && (
        <p role="alert" className="mb-4 rounded-xl border border-red/30 bg-red/5 px-4 py-3 text-[0.88rem] text-red-dark">{notice.slice(0, 200)}</p>
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <AdminCard title={`Team (${people.length})`}>
          <ul className="divide-y divide-hair">
            {people.map((p) => {
              const self = p.user_id === staff!.userId;
              return (
                <li key={p.user_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">
                      {p.email} {self && <span className="text-[0.76rem] font-normal text-slate">(you)</span>}
                    </p>
                    <p className="text-[0.78rem] text-slate">
                      {roleLabel(p.role_key)} · {p.active ? "Active" : <span className="font-semibold text-red-dark">Deactivated</span>}
                    </p>
                  </div>
                  {!self && (
                    <div className="flex flex-wrap items-center gap-2">
                      <form action={changeRole} className="flex items-center gap-1.5">
                        <input type="hidden" name="userId" value={p.user_id} />
                        <input type="hidden" name="email" value={p.email} />
                        <label className="sr-only" htmlFor={`role-${p.user_id}`}>
                          Role for {p.email}
                        </label>
                        <select id={`role-${p.user_id}`} name="role" defaultValue={p.role_key} className={`${inputClass} h-9 w-auto py-0`}>
                          {roles?.map((r) => (
                            <option key={r.key} value={r.key}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                        <button type="submit" className={ghostButtonClass}>
                          Save
                        </button>
                      </form>
                      <form action={setActive}>
                        <input type="hidden" name="userId" value={p.user_id} />
                        <input type="hidden" name="email" value={p.email} />
                        <input type="hidden" name="active" value={String(!p.active)} />
                        <button type="submit" className={ghostButtonClass}>
                          {p.active ? "Deactivate" : "Reactivate"}
                        </button>
                      </form>
                      <form action={removeStaff}>
                        <input type="hidden" name="userId" value={p.user_id} />
                        <input type="hidden" name="email" value={p.email} />
                        <button type="submit" className={`${ghostButtonClass} hover:border-red hover:text-red`}>
                          Remove
                        </button>
                      </form>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </AdminCard>

        <AdminCard title="Add a team member">
          <AddStaffForm roles={(roles ?? []).map((r) => ({ key: r.key, label: r.label }))} />
        </AdminCard>
      </div>

      <AdminCard title="What each role can do" className="mt-4">
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {roles?.map((r) => (
            <li key={r.key} className="rounded-xl border border-hair p-4">
              <p className="font-heading font-bold text-ink">{r.label}</p>
              <p className="text-[0.82rem] text-slate">{r.description}</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {(r.permissions as string[]).map((p) => (
                  <li key={p} className="rounded-md bg-mist px-2 py-0.5 text-[0.7rem] font-semibold text-blue-deep">
                    {PERMISSION_LABELS[p] ?? p}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </AdminCard>
    </>
  );
}
