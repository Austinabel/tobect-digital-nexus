import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader, NoAccess } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { libraryImages } from "@/lib/admin/media-library";
import { isoToLagosLocal } from "@/lib/admin/campaign-form";
import { BannerForm } from "../banner-form";

export const metadata = { title: "Edit banner" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditBannerPage(props: PageProps<"/admin/banners/[id]">) {
  const { staff } = await getStaff();
  if (!can(staff, "content.manage")) return <NoAccess reason="permission" />;
  const { id } = await props.params;
  if (!UUID.test(id)) notFound();
  const [{ data: c }, library] = await Promise.all([supabaseAdmin().from("campaigns").select("*").eq("id", id).is("archived_at", null).maybeSingle(), libraryImages()]);
  if (!c) notFound();
  return (
    <>
      <AdminHeader
        title={c.title}
        intro={
          <span className="flex flex-wrap gap-3">
            <Link href="/admin/banners" className="font-semibold text-blue hover:underline">
              ← All banners
            </Link>
            <Link href="/shop" target="_blank" className="font-semibold text-blue hover:underline">
              View the shop ↗
            </Link>
          </span>
        }
      />
      <BannerForm
        library={library}
        canUpload={can(staff, "media.manage")}
        initial={{
          id: c.id,
          position: c.position,
          title: c.title,
          kicker: c.kicker ?? "",
          description: c.description ?? "",
          discountLabel: c.discount_label ?? "",
          ctaText: c.cta_text,
          ctaHref: c.cta_href,
          desktopImage: c.desktop_image_url ?? "",
          mobileImage: c.mobile_image_url ?? "",
          imageAlt: c.image_alt ?? "",
          imagePosition: c.image_position ?? "",
          designedBanner: c.designed_banner,
          theme: c.theme ?? "",
          startsAt: isoToLagosLocal(c.starts_at),
          endsAt: isoToLagosLocal(c.ends_at),
          active: c.active,
          evergreen: c.evergreen,
          priority: String(c.priority),
        }}
      />
    </>
  );
}
