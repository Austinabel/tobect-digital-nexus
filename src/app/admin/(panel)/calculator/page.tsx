import Link from "next/link";
import { AdminHeader, NoAccess } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { CONTENT_SCHEMAS, readContent } from "@/lib/content";
import { ContentEditor } from "../pages/content-editor";

export const metadata = { title: "Calculator settings" };

export default async function CalculatorSettingsPage() {
  const { staff } = await getStaff();
  if (!can(staff, "calculator.manage")) return <NoAccess reason="permission" />;
  const { data } = await supabaseAdmin().from("page_content").select("data").eq("key", "calculator").maybeSingle();
  const schema = CONTENT_SCHEMAS.calculator;
  return (
    <>
      <AdminHeader
        title="Calculator settings"
        intro={
          <span className="block">
            {schema.intro}{" "}
            <Link href="/solar-calculator" target="_blank" className="font-semibold text-blue hover:underline">
              Open the calculator ↗
            </Link>
          </span>
        }
      />
      <ContentEditor contentKey="calculator" initial={readContent("calculator", data?.data)} library={[]} canUpload={false} />
    </>
  );
}
