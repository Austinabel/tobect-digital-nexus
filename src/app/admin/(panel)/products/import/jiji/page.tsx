import Link from "next/link";
import { AdminHeader, NoAccess } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { JijiImportClient } from "./jiji-client";

export const metadata = { title: "Import from Jiji" };
/** Reading listings and downloading their photos takes a while; the page's server actions may run up to a minute. */
export const maxDuration = 60;

export default async function JijiImportPage() {
  const { staff } = await getStaff();
  if (!can(staff, "products.manage")) return <NoAccess reason="permission" />;
  const { data: cats } = await supabaseAdmin().from("categories").select("slug, name, parent_slug").order("sort_order");
  const categories = (cats ?? []).map((c) => ({ slug: c.slug, name: c.name, parent: c.parent_slug as string | null }));
  return (
    <>
      <AdminHeader
        title="Import from Jiji"
        intro={
          <span className="block">
            Paste links to your Jiji adverts — or your Jiji shop page to bring in everything. You&rsquo;ll check each product before anything is saved.{" "}
            <Link href="/admin/products" className="font-semibold text-blue hover:underline">
              ← All products
            </Link>
          </span>
        }
      />
      <JijiImportClient categories={categories} canAddImages={can(staff, "media.manage")} />
    </>
  );
}
