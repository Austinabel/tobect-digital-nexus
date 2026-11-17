import { AdminHeader, NoAccess } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { libraryImages } from "@/lib/admin/media-library";
import { parseSiteSettings } from "@/lib/site";
import { SettingsForm } from "./settings-form";

export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  const { staff } = await getStaff();
  if (!can(staff, "settings.manage")) return <NoAccess reason="permission" />;
  const [{ data }, library] = await Promise.all([supabaseAdmin().from("site_settings").select("data, updated_at").eq("id", 1).maybeSingle(), libraryImages()]);
  const { site } = parseSiteSettings(data?.data ?? {});
  return (
    <>
      <AdminHeader
        title="Site settings"
        intro={`Your business details, contacts and branding — change them here and the whole website follows.${data?.updated_at ? ` Last saved ${new Date(data.updated_at).toLocaleString("en-NG", { timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short" })}.` : ""}`}
      />
      <SettingsForm site={site} library={library} canUpload={can(staff, "media.manage")} />
    </>
  );
}
