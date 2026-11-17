import Image from "next/image";
import Link from "next/link";
import { AdminCard, AdminHeader, NoAccess, buttonClass, ghostButtonClass, inputClass } from "@/components/admin/admin-ui";
import { FOCUS_OPTIONS } from "@/lib/admin/campaign-form";
import { can, getStaff } from "@/lib/admin/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { libraryImages } from "@/lib/admin/media-library";
import { addHomeSlide, deleteHomeSlide, moveHomeSlide, updateHomeSlide } from "../actions";
import { BannerTabs } from "../banner-tabs";
import { AddSlideForm } from "./add-slide-form";

export const metadata = { title: "Homepage slideshow" };

export default async function HomeSlidesPage(props: PageProps<"/admin/banners/home-slides">) {
  const { staff } = await getStaff();
  if (!can(staff, "content.manage")) return <NoAccess reason="permission" />;
  const { notice } = await props.searchParams;
  const [{ data: slides }, library] = await Promise.all([supabaseAdmin().from("hero_slides").select("*").order("sort_order").order("created_at"), libraryImages()]);

  return (
    <>
      <AdminHeader
        title="Banners & slides"
        intro={
          <>
            The photos behind the homepage headline, shown in this order and changing every few seconds. They are background only — the headline and buttons stay on top.{" "}
            <Link href="/" target="_blank" className="font-semibold text-blue hover:underline">
              View homepage ↗
            </Link>
          </>
        }
      />
      <BannerTabs current="slides" />
      {typeof notice === "string" && (
        <p role="status" className="mb-4 rounded-xl border border-hair bg-white px-4 py-3 text-[0.88rem] text-ink">
          {notice.slice(0, 200)}
        </p>
      )}
      <div className="grid items-start gap-4 xl:grid-cols-[1fr_360px]">
        <AdminCard title={`Slides (${slides?.length ?? 0})`} className="p-0 [&>h2]:px-5 [&>h2]:pt-4">
          <ol className="divide-y divide-hair">
            {(slides ?? []).map((s, i) => (
              <li key={s.id} className="flex flex-wrap gap-4 px-4 py-4 sm:flex-nowrap">
                <span className="relative block aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl bg-field sm:w-44">
                  <Image src={s.image_url} alt="" fill sizes="176px" className="object-cover" style={{ objectPosition: s.image_position ?? "50% 50%" }} />
                  <span className="absolute left-1.5 top-1.5 rounded bg-ink/80 px-1.5 text-[0.7rem] font-bold text-white">{i + 1}</span>
                  {!s.active && <span className="absolute right-1.5 top-1.5 rounded bg-white/90 px-1.5 text-[0.7rem] font-bold text-slate">Hidden</span>}
                </span>
                <div className="min-w-0 grow">
                  <form action={updateHomeSlide} className="grid gap-2 sm:grid-cols-[1fr_140px]">
                    <input type="hidden" name="id" value={s.id} />
                    <label className="block sm:col-span-2">
                      <span className="mb-1 block text-[0.76rem] font-semibold text-ink">Description (for screen readers)</span>
                      <input name="alt" defaultValue={s.alt} required minLength={5} maxLength={200} className={inputClass} />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[0.76rem] font-semibold text-ink">Focal point</span>
                      <select name="image_position" defaultValue={s.image_position ?? ""} className={inputClass}>
                        {FOCUS_OPTIONS.map(([v, l]) => (
                          <option key={l} value={v}>
                            {l}
                          </option>
                        ))}
                        {s.image_position && !FOCUS_OPTIONS.some(([v]) => v === s.image_position) && <option value={s.image_position}>Custom ({s.image_position})</option>}
                      </select>
                    </label>
                    <label className="flex items-center gap-2 self-end pb-2 text-[0.84rem]">
                      <input type="checkbox" name="active" defaultChecked={s.active} className="size-4 accent-[var(--color-blue)]" />
                      Visible
                    </label>
                    <div className="flex flex-wrap gap-2 sm:col-span-2">
                      <button className={ghostButtonClass}>Save</button>
                    </div>
                  </form>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <form action={moveHomeSlide}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="dir" value="up" />
                      <button disabled={i === 0} className={ghostButtonClass} aria-label={`Move slide ${i + 1} earlier`}>
                        ↑ Earlier
                      </button>
                    </form>
                    <form action={moveHomeSlide}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="dir" value="down" />
                      <button disabled={i === (slides?.length ?? 0) - 1} className={ghostButtonClass} aria-label={`Move slide ${i + 1} later`}>
                        ↓ Later
                      </button>
                    </form>
                    <form action={deleteHomeSlide}>
                      <input type="hidden" name="id" value={s.id} />
                      <button className={`${ghostButtonClass} hover:border-red hover:text-red`} aria-label={`Remove slide ${i + 1}`}>
                        Remove
                      </button>
                    </form>
                  </div>
                  {s.credit_name && <p className="mt-1.5 text-[0.72rem] text-slate-light">Photo: {s.credit_name}{s.is_sample ? " · stock photo (sample)" : ""}</p>}
                </div>
              </li>
            ))}
          </ol>
        </AdminCard>
        <AdminCard title="Add a slide">
          <AddSlideForm action={addHomeSlide} library={library} canUpload={can(staff, "media.manage")} submitClass={buttonClass} />
          <p className="mt-3 text-[0.76rem] text-slate">Wide landscape photos work best (at least 1920 px wide). Use your own project photos where you can — stock photos must not be presented as Tobecat installations.</p>
        </AdminCard>
      </div>
    </>
  );
}
