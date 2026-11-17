import Link from "next/link";
import { AdminHeader, NoAccess } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { IMPORT_COLUMNS, MAX_IMPORT_ROWS, specColumns } from "@/lib/admin/product-import";
import { ImportClient } from "./import-client";

export const metadata = { title: "Bulk import products" };

export default async function ImportPage() {
  const { staff } = await getStaff();
  if (!can(staff, "products.manage")) return <NoAccess reason="permission" />;
  return (
    <>
      <AdminHeader
        title="Bulk import products"
        intro={
          <span className="block">
            Add many products at once from an Excel (.xlsx) or CSV file — up to {MAX_IMPORT_ROWS} rows. You&rsquo;ll see a preview first; nothing is saved until you press Import.{" "}
            <Link href="/admin/products" className="font-semibold text-blue hover:underline">
              ← All products
            </Link>
          </span>
        }
      />
      <ImportClient canAddImages={can(staff, "media.manage")} columns={IMPORT_COLUMNS.map(({ label, help, required }) => ({ label, help, required: Boolean(required) }))} specColumns={specColumns()} />
    </>
  );
}
