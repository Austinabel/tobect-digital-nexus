import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AdminCard, AdminHeader, NoAccess, buttonClass, ghostButtonClass, inputClass } from "@/components/admin/admin-ui";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { deleteMedia, restoreMedia, updateMedia } from "./actions";
import { UploadForm } from "./upload-form";
import { mediaReferences } from "@/lib/admin/media-library";

export const metadata = { title: "Media library" };

const VIEWS = [
  { key: "", label: "All images" },
  { key: "samples", label: "Sample images" },
  { key: "deleted", label: "Recently deleted" },
] as const;

const kb = (n: number) => (n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

export default async function MediaPage(props: PageProps<"/admin/media">) {
  const { staff } = await getStaff();
  if (!can(staff, "media.manage")) return <NoAccess reason="permission" />;
  const { view: rawView, notice } = await props.searchParams;
  const view = rawView === "samples" || rawView === "deleted" ? rawView : "";

  let q = supabaseAdmin().from("media_assets").select("*").order("created_at", { ascending: false }).limit(200);
  q = view === "deleted" ? q.not("deleted_at", "is", null) : q.is("deleted_at", null);
  if (view === "samples") q = q.eq("is_sample", true);
  const [{ data: rows }, refs] = await Promise.all([q, mediaReferences()]);
  // hand-written labels (pages not yet editable) + live references from banners, slides and kits
  const assets = (rows ?? []).map((a) => ({ ...a, usage: [...(a.usage ?? []), ...(refs.get(a.public_url) ?? [])] as string[] }));

  return (
    <>
      <AdminHeader title="Media library" intro="Every image the website uses lives here, stored in your Supabase project. Images still used on the site can't be deleted." />
      {typeof notice === "string" && <p role="status" className="mb-4 rounded-xl border border-hair bg-white px-4 py-3 text-[0.88rem] text-ink">{notice.slice(0, 300)}</p>}

      <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <AdminCard title="Upload" className="self-start">
          <UploadForm />
        </AdminCard>

        <div>
          <nav aria-label="Filter images" className="mb-3 flex flex-wrap gap-2">
            {VIEWS.map((v) => (
              <Link
                key={v.key}
                href={v.key ? `/admin/media?view=${v.key}` : "/admin/media"}
                aria-current={view === v.key ? "page" : undefined}
                className={cn("rounded-full border px-3.5 py-1.5 text-[0.82rem] font-semibold", view === v.key ? "border-blue bg-blue text-white" : "border-hair bg-white text-slate hover:border-blue")}
              >
                {v.label}
              </Link>
            ))}
          </nav>

          {assets && assets.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {assets.map((a) => (
                <li key={a.id} className="overflow-hidden rounded-2xl border border-hair bg-white">
                  <div className="relative aspect-[16/10] bg-field">
                    <Image src={a.public_url} alt={a.alt || ""} fill sizes="(min-width: 1536px) 360px, (min-width: 640px) 45vw, 100vw" className="object-cover" />
                    <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                      {a.is_sample && <span className="rounded-md bg-gold px-1.5 py-0.5 text-[0.66rem] font-bold text-ink">SAMPLE</span>}
                      {!a.alt && <span className="rounded-md bg-red px-1.5 py-0.5 text-[0.66rem] font-bold text-white">NO ALT TEXT</span>}
                    </div>
                  </div>
                  <div className="p-3.5">
                    <p className="truncate font-semibold text-ink" title={a.filename}>
                      {a.filename}
                    </p>
                    <p className="text-[0.76rem] text-slate">
                      {a.width && a.height ? `${a.width}×${a.height} · ` : ""}
                      {kb(a.size_bytes)}
                      {a.credit && ` · ${a.credit}`}
                    </p>
                    {a.usage?.length > 0 && (
                      <p className="mt-1.5 text-[0.74rem] text-blue-deep">
                        <strong>Used in:</strong> {a.usage.join(", ")}
                      </p>
                    )}

                    {view === "deleted" ? (
                      <form action={restoreMedia} className="mt-3">
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="filename" value={a.filename} />
                        <button type="submit" className={ghostButtonClass}>
                          Restore
                        </button>
                      </form>
                    ) : (
                      <details className="group mt-3">
                        <summary className="cursor-pointer list-none text-[0.82rem] font-semibold text-blue [&::-webkit-details-marker]:hidden">Edit details ▾</summary>
                        <form action={updateMedia} className="mt-2 space-y-2">
                          <input type="hidden" name="id" value={a.id} />
                          <input type="hidden" name="filename" value={a.filename} />
                          <input type="hidden" name="view" value={view} />
                          <label className="block">
                            <span className="text-[0.74rem] font-semibold text-slate">Alt text (describe the image)</span>
                            <input name="alt" defaultValue={a.alt} maxLength={250} className={inputClass} />
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <label className="block">
                              <span className="text-[0.74rem] font-semibold text-slate">Credit</span>
                              <input name="credit" defaultValue={a.credit ?? ""} className={inputClass} />
                            </label>
                            <label className="block">
                              <span className="text-[0.74rem] font-semibold text-slate">Licence</span>
                              <input name="license" defaultValue={a.license ?? ""} className={inputClass} />
                            </label>
                          </div>
                          <label className="block">
                            <span className="text-[0.74rem] font-semibold text-slate">Credit link (https)</span>
                            <input name="credit_url" type="url" defaultValue={a.credit_url ?? ""} className={inputClass} />
                          </label>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button type="submit" className={`${buttonClass} h-9`}>
                              Save
                            </button>
                            <a href={a.public_url} target="_blank" rel="noopener noreferrer" className={ghostButtonClass}>
                              Open file
                            </a>
                          </div>
                        </form>
                        <form action={deleteMedia} className="mt-2">
                          <input type="hidden" name="id" value={a.id} />
                          <input type="hidden" name="view" value={view} />
                          <button type="submit" disabled={a.usage?.length > 0} title={a.usage?.length ? "Still used on the site" : undefined} className={`${ghostButtonClass} hover:border-red hover:text-red`}>
                            Delete
                          </button>
                        </form>
                      </details>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <AdminCard>
              <p className="text-slate">{view === "deleted" ? "Nothing in recently deleted." : "No images here yet — upload some on the left."}</p>
            </AdminCard>
          )}
        </div>
      </div>
    </>
  );
}
