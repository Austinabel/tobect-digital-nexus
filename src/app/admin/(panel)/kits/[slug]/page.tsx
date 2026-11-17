import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader, NoAccess } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { libraryImages } from "@/lib/admin/media-library";
import { SLUG_RE } from "@/lib/admin/product-form";
import { KitForm } from "../kit-form";
import { kitProductOptions, kitValues } from "../data";

export const metadata = { title: "Edit kit" };

export default async function EditKitPage(props: PageProps<"/admin/kits/[slug]">) {
  const { staff } = await getStaff();
  if (!can(staff, "catalog.manage")) return <NoAccess reason="permission" />;
  const { slug } = await props.params;
  if (!SLUG_RE.test(slug)) notFound();
  const [values, products, library] = await Promise.all([kitValues(slug), kitProductOptions(), libraryImages()]);
  if (!values) notFound();
  return (
    <>
      <AdminHeader title={values.name} intro={<Link href="/admin/kits" className="font-semibold text-blue hover:underline">← All kits</Link>} />
      <KitForm mode="edit" initial={values} products={products} library={library} canUpload={can(staff, "media.manage")} />
    </>
  );
}
