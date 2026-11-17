import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader, NoAccess } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { libraryImages } from "@/lib/admin/media-library";
import { CONTENT_KEYS, CONTENT_SCHEMAS, readContent, type ContentKey } from "@/lib/content";
import { ContentEditor } from "../content-editor";

export const metadata = { title: "Edit page" };

export default async function EditContentPage(props: PageProps<"/admin/pages/[key]">) {
  const { staff } = await getStaff();
  if (!can(staff, "content.manage")) return <NoAccess reason="permission" />;
  const { key } = await props.params;
  if (!CONTENT_KEYS.includes(key as ContentKey) || CONTENT_SCHEMAS[key as ContentKey].group === "Calculator") notFound();
  const k = key as ContentKey;
  const schema = CONTENT_SCHEMAS[k];
  const [{ data }, library] = await Promise.all([supabaseAdmin().from("page_content").select("data").eq("key", k).maybeSingle(), libraryImages()]);

  return (
    <>
      <AdminHeader
        title={schema.title}
        intro={
          <span className="block">
            {schema.intro}{" "}
            <span className="mt-1 flex flex-wrap gap-3">
              <Link href="/admin/pages" className="font-semibold text-blue hover:underline">
                ← All pages
              </Link>
              <Link href={schema.path} target="_blank" className="font-semibold text-blue hover:underline">
                View page ↗
              </Link>
            </span>
          </span>
        }
      />
      <ContentEditor contentKey={k} initial={readContent(k, data?.data)} library={library} canUpload={can(staff, "media.manage")} />
    </>
  );
}
