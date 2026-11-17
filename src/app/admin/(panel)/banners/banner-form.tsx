"use client";

import { useActionState, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { buttonClass, inputClass } from "@/components/admin/admin-ui";
import { submitWithoutReset } from "@/components/admin/submit-without-reset";
import { ImagePicker, type PickerImage } from "@/components/admin/image-picker";
import { FOCUS_OPTIONS } from "@/lib/admin/campaign-form";
import { POSITIONS, THEMES } from "@/lib/admin/campaign-form";
import { saveBanner } from "./actions";

export interface BannerValues {
  id?: string;
  position: string;
  title: string;
  kicker: string;
  description: string;
  discountLabel: string;
  ctaText: string;
  ctaHref: string;
  desktopImage: string;
  mobileImage: string;
  imageAlt: string;
  imagePosition: string;
  designedBanner: boolean;
  theme: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  evergreen: boolean;
  priority: string;
}

function Field({ label, hint, error, children, className }: { label: string; hint?: ReactNode; error?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[0.8rem] font-semibold text-ink">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-[0.78rem] text-red-dark">{error}</span> : hint ? <span className="mt-1 block text-[0.74rem] text-slate">{hint}</span> : null}
    </label>
  );
}

function Section({ title, children, intro }: { title: string; children: ReactNode; intro?: string }) {
  return (
    <section className="rounded-2xl border border-hair bg-white p-5">
      <h2 className="font-heading text-[1rem] font-bold text-ink">{title}</h2>
      {intro && <p className="mt-0.5 text-[0.8rem] text-slate">{intro}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function BannerForm({ initial, library, canUpload }: { initial: BannerValues; library: PickerImage[]; canUpload: boolean }) {
  const [state, action, pending] = useActionState(saveBanner, undefined);
  const e = state?.errors ?? {};
  const [position, setPosition] = useState(initial.position);
  const [evergreen, setEvergreen] = useState(initial.evergreen);
  const [designed, setDesigned] = useState(initial.designedBanner);
  const [focus, setFocus] = useState(initial.imagePosition);
  const slot = POSITIONS.find((p) => p.value === position);

  return (
    <form action={action} onSubmit={submitWithoutReset(action)} className="grid items-start gap-4 xl:grid-cols-[1fr_360px]">
      {initial.id && <input type="hidden" name="id" value={initial.id} />}
      <div className="space-y-4">
        {e.form && (
          <p role="alert" className="rounded-xl border border-red/30 bg-red/5 px-4 py-3 text-[0.88rem] text-red-dark">
            {e.form}
          </p>
        )}
        {Object.keys(e).length > 0 && !e.form && (
          <p role="alert" className="rounded-xl border border-red/30 bg-red/5 px-4 py-3 text-[0.88rem] text-red-dark">
            Please fix the highlighted fields.
          </p>
        )}

        <Section title="Where it shows">
          <Field label="Banner position *" error={e.position} hint={slot?.hint}>
            <select name="position" value={position} onChange={(ev) => setPosition(ev.target.value)} className={inputClass}>
              {POSITIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
        </Section>

        <Section title="Words & button" intro={designed ? "For a designed banner these are used for the link and for screen readers; the artwork itself is shown." : undefined}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title *" error={e.title} className="sm:col-span-2">
              <input name="title" defaultValue={initial.title} required maxLength={120} className={inputClass} />
            </Field>
            <Field label="Small label above the title" hint="e.g. Limited Offer" error={e.kicker}>
              <input name="kicker" defaultValue={initial.kicker} maxLength={40} className={inputClass} />
            </Field>
            <Field label="Offer badge" hint="Only a real, approved offer, e.g. “FREE Power Bank”" error={e.discount_label}>
              <input name="discount_label" defaultValue={initial.discountLabel} maxLength={80} disabled={evergreen} className={cn(inputClass, "disabled:bg-field")} />
            </Field>
            <Field label="Description" hint="Several lines show as a ticked list." error={e.description} className="sm:col-span-2">
              <textarea name="description" defaultValue={initial.description} rows={3} maxLength={400} className={cn(inputClass, "h-auto py-2")} />
            </Field>
            <Field label="Button text *" error={e.cta_text}>
              <input name="cta_text" defaultValue={initial.ctaText} required maxLength={40} className={inputClass} />
            </Field>
            <Field label="Button link *" hint="A page on this site, e.g. /shop/inverters, or an https:// link" error={e.cta_href}>
              <input name="cta_href" defaultValue={initial.ctaHref} required maxLength={500} placeholder="/shop/installation-kits" className={inputClass} />
            </Field>
          </div>
        </Section>

        <Section title="Images">
          <div className="grid gap-5 sm:grid-cols-2">
            <ImagePicker name="desktop_image_url" label="Main image (desktop)" initialUrl={initial.desktopImage} library={library} canUpload={canUpload} focus={focus} error={e.desktop_image_url} />
            <ImagePicker
              name="mobile_image_url"
              label="Phone image (optional)"
              initialUrl={initial.mobileImage}
              library={library}
              canUpload={canUpload}
              aspect="aspect-square"
              focus={focus}
              error={e.mobile_image_url}
              hint="A squarer crop for phones. Leave empty to use the main image."
            />
            <Field label="Focal point" hint="The part of the photo to keep in view when it's cropped." error={e.image_position}>
              <select name="image_position" value={focus} onChange={(ev) => setFocus(ev.target.value)} className={inputClass}>
                {FOCUS_OPTIONS.map(([v, l]) => (
                  <option key={l} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={designed ? "What the banner says *" : "Image description"} hint={designed ? "Screen readers can't read text inside an image." : "Leave empty if the photo is only decoration."} error={e.image_alt}>
              <input name="image_alt" defaultValue={initial.imageAlt} maxLength={200} className={inputClass} />
            </Field>
            <label className="flex items-start gap-2 text-[0.86rem] sm:col-span-2">
              <input type="checkbox" name="designed_banner" checked={designed} onChange={(ev) => setDesigned(ev.target.checked)} className="mt-0.5 size-4 accent-[var(--color-blue)]" />
              <span>
                <strong>The image is a finished banner design</strong> (its text and offer are part of the artwork) — show it as-is instead of writing the title and button over it.
                {e.designed_banner && <span className="block text-[0.78rem] text-red-dark">{e.designed_banner}</span>}
              </span>
            </label>
            <Field label="Colour (when there's no image)">
              <select name="theme" defaultValue={initial.theme} className={inputClass}>
                <option value="">Default</option>
                {THEMES.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t[0].toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Section>
      </div>

      <div className="space-y-4 xl:sticky xl:top-4">
        <Section title="Publishing">
          <div className="space-y-3">
            <label className="flex items-start gap-2 text-[0.88rem]">
              <input type="checkbox" name="active" defaultChecked={initial.active} className="mt-0.5 size-4 accent-[var(--color-blue)]" />
              <span>
                <strong>Switched on</strong>
                <span className="block text-[0.76rem] text-slate">Off = saved as a draft, not shown.</span>
              </span>
            </label>
            <label className="flex items-start gap-2 text-[0.88rem]">
              <input type="checkbox" name="evergreen" checked={evergreen} onChange={(ev) => setEvergreen(ev.target.checked)} className="mt-0.5 size-4 accent-[var(--color-blue)]" />
              <span>
                <strong>Always-on banner</strong>
                <span className="block text-[0.76rem] text-slate">No offer and no dates. Fills the position whenever no promotion is running.</span>
              </span>
            </label>
            {!evergreen && (
              <>
                <Field label="Starts (Lagos time)" hint="Empty = straight away" error={e.starts_at}>
                  <input type="datetime-local" name="starts_at" defaultValue={initial.startsAt} className={inputClass} />
                </Field>
                <Field label="Ends (Lagos time)" hint="Empty = until you switch it off. It disappears by itself at the end." error={e.ends_at}>
                  <input type="datetime-local" name="ends_at" defaultValue={initial.endsAt} className={inputClass} />
                </Field>
              </>
            )}
            {evergreen && (
              <p className="rounded-lg bg-mist px-3 py-2 text-[0.76rem] text-ink">
                Always-on banners run without dates and without an offer badge — saving clears any you entered.
              </p>
            )}
            {evergreen && e.ends_at && <p className="text-[0.78rem] text-red-dark">{e.ends_at}</p>}
            <Field label="Priority" hint="Higher shows first when several share a position." error={e.priority}>
              <input name="priority" type="number" min={-100} max={100} step={1} defaultValue={initial.priority} className={inputClass} />
            </Field>
          </div>
          <button type="submit" disabled={pending} className={cn(buttonClass, "mt-4 w-full")}>
            {pending ? "Saving…" : "Save banner"}
          </button>
        </Section>
      </div>
    </form>
  );
}
