import Link from "next/link";
import { AdminCard, AdminHeader, NoAccess } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { CONTENT_KEYS, CONTENT_SCHEMAS, readContent } from "@/lib/content";

export const metadata = { title: "Pages" };

export default async function PagesPage() {
  const { staff } = await getStaff();
  if (!can(staff, "content.manage")) return <NoAccess reason="permission" />;
  const { data } = await supabaseAdmin().from("page_content").select("key, data, updated_at");
  const saved = new Map((data ?? []).map((r) => [r.key, r]));
  const groups = ["Company", "Policies"] as const; // the calculator list lives under Calculator settings

  return (
    <>
      <AdminHeader title="Pages" intro="Text and lists on the information pages. Business details (phone, address…) live in Site settings and fill in automatically." />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        {groups.map((g) => (
          <AdminCard key={g} title={g} className="p-0 [&>h2]:px-5 [&>h2]:pt-4">
            <ul className="divide-y divide-hair">
              {CONTENT_KEYS.filter((k) => CONTENT_SCHEMAS[k].group === g).map((k) => {
                const s = CONTENT_SCHEMAS[k];
                const row = saved.get(k);
                const content = readContent(k, row?.data);
                const count = "items" in content ? (content.items as unknown[]).length : null;
                const empty = (k === "returns" && !String(content.body ?? "").trim()) || count === 0;
                return (
                  <li key={k}>
                    <Link href={`/admin/pages/${k}`} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 hover:bg-field/60">
                      <span className="min-w-0">
                        <span className="font-semibold text-blue">{s.title}</span>
                        <span className="block text-[0.76rem] text-slate">{s.intro}</span>
                      </span>
                      <span className="text-right text-[0.74rem] text-slate-light">
                        {count !== null && (
                          <span className="block">
                            {count} item{count === 1 ? "" : "s"}
                          </span>
                        )}
                        {empty ? <span className="font-semibold text-[#8a5a00]">Hidden until filled in</span> : row ? `Edited ${new Date(row.updated_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}` : "Original text"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </AdminCard>
        ))}
      </div>
    </>
  );
}
