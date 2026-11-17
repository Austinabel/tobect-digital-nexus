import Link from "next/link";
import { AdminHeader, NoAccess } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { libraryImages } from "@/lib/admin/media-library";
import { POSITIONS } from "@/lib/admin/campaign-form";
import { BannerForm } from "../banner-form";

export const metadata = { title: "New banner" };

export default async function NewBannerPage(props: PageProps<"/admin/banners/new">) {
  const { staff } = await getStaff();
  if (!can(staff, "content.manage")) return <NoAccess reason="permission" />;
  const { position } = await props.searchParams;
  const library = await libraryImages();
  return (
    <>
      <AdminHeader title="New banner" intro={<Link href="/admin/banners" className="font-semibold text-blue hover:underline">← All banners</Link>} />
      <BannerForm
        library={library}
        canUpload={can(staff, "media.manage")}
        initial={{
          position: POSITIONS.some((p) => p.value === position) ? String(position) : "shop-hero",
          title: "",
          kicker: "",
          description: "",
          discountLabel: "",
          ctaText: "",
          ctaHref: "",
          desktopImage: "",
          mobileImage: "",
          imageAlt: "",
          imagePosition: "",
          designedBanner: false,
          theme: "",
          startsAt: "",
          endsAt: "",
          active: false,
          evergreen: false,
          priority: "0",
        }}
      />
    </>
  );
}
