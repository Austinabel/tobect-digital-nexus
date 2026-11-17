import Link from "next/link";
import { AdminHeader, NoAccess } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { ProductForm } from "../product-form";
import { productFormData } from "../data";
import { scanAvailable } from "@/lib/admin/product-scan";

export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  const { staff } = await getStaff();
  if (!can(staff, "products.manage")) return <NoAccess reason="permission" />;
  const { categories, brands, library } = await productFormData();
  return (
    <>
      <AdminHeader title="Add product" intro={<Link href="/admin/products" className="font-semibold text-blue hover:underline">← All products</Link>} />
      <ProductForm
        mode="new"
        categories={categories}
        brands={brands}
        library={library}
        canScan={scanAvailable()}
        initial={{ slug: "", name: "", brand: "", model: "", sku: "", barcode: "", category: "", price: "", compareAt: "", availability: "", stock: "", specs: "", attributes: {}, description: "", seoTitle: "", seoDescription: "", invBatteryV: "", invMaxPv: "", invMpptMin: "", featured: false, published: true, imageIds: [] }}
      />
    </>
  );
}
