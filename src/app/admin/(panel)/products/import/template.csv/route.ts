import { NextResponse } from "next/server";
import { can, getStaff } from "@/lib/admin/auth";
import { templateCsv } from "@/lib/admin/product-import";

/** The bulk-import template (opens in Excel; the example row is skipped on import). */
export async function GET() {
  const { staff } = await getStaff();
  if (!can(staff, "products.manage")) return new NextResponse("Not allowed", { status: 403 });
  return new NextResponse(templateCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="product-import-template.csv"',
      "Cache-Control": "no-store",
    },
  });
}
