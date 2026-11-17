import Link from "next/link";
import { AdminHeader, NoAccess } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { libraryImages } from "@/lib/admin/media-library";
import { KitForm } from "../kit-form";
import { emptyKitValues, kitProductOptions } from "../data";

export const metadata = { title: "New kit" };

export default async function NewKitPage() {
  const { staff } = await getStaff();
  if (!can(staff, "catalog.manage")) return <NoAccess reason="permission" />;
  const [products, library] = await Promise.all([kitProductOptions(), libraryImages()]);
  return (
    <>
      <AdminHeader title="New solar kit" intro={<Link href="/admin/kits" className="font-semibold text-blue hover:underline">← All kits</Link>} />
      <KitForm mode="new" initial={emptyKitValues()} products={products} library={library} canUpload={can(staff, "media.manage")} />
    </>
  );
}
