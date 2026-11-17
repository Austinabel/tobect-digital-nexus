import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { NoAccess } from "@/components/admin/admin-ui";
import { getStaff } from "@/lib/admin/auth";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { logout } from "@/app/(marketing)/account/actions";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin" },
  robots: { index: false, follow: false },
};

/** Every /admin page (except /admin/setup) is behind this check. Actions re-check permissions themselves. */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user, staff } = await getStaff();
  if (!user) redirect("/account/login?next=/admin");
  if (!staff) return <NoAccess reason="not-staff" />;

  const nav = ADMIN_NAV.map((g) => ({ group: g.group, items: g.items.filter((i) => !i.permission || staff.permissions.has(i.permission)) })).filter((g) => g.items.length);

  return (
    <AdminShell nav={nav} staff={{ email: staff.email, roleLabel: staff.roleLabel }} signOut={logout}>
      {children}
    </AdminShell>
  );
}
