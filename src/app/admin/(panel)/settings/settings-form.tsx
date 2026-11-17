"use client";

import { useActionState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { buttonClass, inputClass } from "@/components/admin/admin-ui";
import { ImagePicker, type PickerImage } from "@/components/admin/image-picker";
import { submitWithoutReset } from "@/components/admin/submit-without-reset";
import { SOCIAL_LABELS, type SiteSettings } from "@/lib/site";
import { saveSettings } from "./actions";

function Field({ label, hint, error, children, className }: { label: string; hint?: ReactNode; error?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[0.8rem] font-semibold text-ink">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-[0.78rem] text-red-dark">{error}</span> : hint ? <span className="mt-1 block text-[0.74rem] text-slate">{hint}</span> : null}
    </label>
  );
}

function Section({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-hair bg-white p-5">
      <h2 className="font-heading text-[1rem] font-bold text-ink">{title}</h2>
      {intro && <p className="mt-0.5 text-[0.8rem] text-slate">{intro}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function SettingsForm({ site, library, canUpload }: { site: SiteSettings; library: PickerImage[]; canUpload: boolean }) {
  const [state, action, pending] = useActionState(saveSettings, undefined);
  const e = state?.errors ?? {};
  const social = new Map(site.social.map((s) => [s.label, s.href]));

  return (
    <form action={action} onSubmit={submitWithoutReset(action)} className="space-y-4">
      {state?.saved && (
        <p role="status" className="rounded-xl border border-[#bfe4cd] bg-[#effaf3] px-4 py-3 text-[0.88rem] text-[#17733b]">
          Saved. The whole website now uses these details.
        </p>
      )}
      {Object.keys(e).length > 0 && (
        <p role="alert" className="rounded-xl border border-red/30 bg-red/5 px-4 py-3 text-[0.88rem] text-red-dark">
          {e.form ?? "Please fix the highlighted fields."}
        </p>
      )}

      <Section title="Business" intro="Used in the header, footer, page titles, invoices and search results.">
        <Field label="Business name *" error={e.name} hint="e.g. Tobecat Technologies">
          <input name="name" defaultValue={site.name} maxLength={80} className={inputClass} />
        </Field>
        <Field label="Short name *" error={e.shortName} hint="What customers call you — used in greetings like “Hello Tobecat, …”">
          <input name="shortName" defaultValue={site.shortName} maxLength={40} className={inputClass} />
        </Field>
        <Field label="Registered (legal) name *" error={e.legalName} className="sm:col-span-2">
          <input name="legalName" defaultValue={site.legalName} maxLength={120} className={inputClass} />
        </Field>
        <Field label="Slogan *" error={e.tagline} hint="The home page title is “Business name | Slogan”.">
          <input name="tagline" defaultValue={site.tagline} maxLength={160} className={inputClass} />
        </Field>
        <Field label="Website address *" error={e.url} hint="Used for links in search results and shared pages.">
          <input name="url" defaultValue={site.url} maxLength={200} inputMode="url" className={inputClass} />
        </Field>
        <Field label="Description for search engines *" error={e.description} className="sm:col-span-2" hint="One or two sentences about what you do and where.">
          <textarea name="description" defaultValue={site.description} rows={3} maxLength={300} className={cn(inputClass, "h-auto py-2")} />
        </Field>
      </Section>

      <Section title="Contact" intro="Every phone, WhatsApp and email button on the site uses these.">
        <Field label="Phone *" error={e.phone}>
          <input name="phone" defaultValue={site.phone} maxLength={20} inputMode="tel" className={inputClass} />
        </Field>
        <Field label="WhatsApp number *" error={e.whatsapp} hint="Orders and quote requests open a chat with this number.">
          <input name="whatsapp" defaultValue={site.whatsapp} maxLength={20} inputMode="tel" className={inputClass} />
        </Field>
        <Field label="Email *" error={e.email}>
          <input name="email" type="email" defaultValue={site.email} maxLength={120} className={inputClass} />
        </Field>
        <Field label="Opening hours *" error={e.hours} hint="e.g. Mon – Sat: 8AM – 6PM">
          <input name="hours" defaultValue={site.hours} maxLength={80} className={inputClass} />
        </Field>
      </Section>

      <Section title="Address">
        <Field label="Head office street *" error={e.street} className="sm:col-span-2">
          <input name="street" defaultValue={site.address.street} maxLength={120} className={inputClass} />
        </Field>
        <Field label="City *" error={e.city}>
          <input name="city" defaultValue={site.address.city} maxLength={60} className={inputClass} />
        </Field>
        <Field label="Country *" error={e.country}>
          <input name="country" defaultValue={site.address.country} maxLength={60} className={inputClass} />
        </Field>
        <Field label="Branches" hint="Cities, separated by commas, e.g. Abuja, Awka" className="sm:col-span-2">
          <input name="branches" defaultValue={site.branches.join(", ")} maxLength={300} className={inputClass} />
        </Field>
      </Section>

      <Section title="Social media" intro="Full links to your profiles. Empty ones are simply not shown.">
        {SOCIAL_LABELS.map((label) => (
          <Field key={label} label={label} error={e[`social_${label}`]}>
            <input name={`social_${label}`} defaultValue={social.get(label) ?? ""} maxLength={300} inputMode="url" placeholder="https://" className={inputClass} />
          </Field>
        ))}
      </Section>

      <Section title="Logo" intro="Upload your logo as a PNG with a transparent background. Leave a logo empty to show the logo word instead.">
        <ImagePicker
          name="logoHeaderUrl"
          label="Header logo"
          initialUrl={site.brand.logoHeaderUrl}
          library={library}
          canUpload={canUpload}
          aspect="aspect-[4/1] bg-white [&_img]:!object-contain"
          error={e.logoHeaderUrl}
          hint="Wide version without the slogan — it's shown small at the top of every page."
        />
        <ImagePicker
          name="logoFooterUrl"
          label="Footer logo"
          initialUrl={site.brand.logoFooterUrl}
          library={library}
          canUpload={canUpload}
          aspect="aspect-[4/1] bg-white [&_img]:!object-contain"
          error={e.logoFooterUrl}
          hint="Full logo (slogan and RC number are fine). Shown on a white panel in the footer."
        />
      </Section>

      <Section title="Logo word & footer">
        <Field label="Logo word *" error={e.wordmark} hint="The big word in the logo, e.g. TOBECAT">
          <input name="wordmark" defaultValue={site.brand.wordmark} maxLength={24} className={inputClass} />
        </Field>
        <Field label="Logo small line" hint="e.g. TECHNOLOGIES NIG LTD (optional)">
          <input name="wordmarkSub" defaultValue={site.brand.wordmarkSub} maxLength={40} className={inputClass} />
        </Field>
        <div>
          <ImagePicker
            name="logoUrl"
            label="Logo image (optional)"
            initialUrl={site.brand.logoUrl}
            library={library}
            canUpload={canUpload}
            aspect="aspect-square max-w-[120px]"
            error={e.logoUrl}
            hint="A square logo mark shown beside the logo word. Empty = the blue lightning badge."
          />
        </div>
        <Field label="Footer description" hint="Shown after your legal name in the footer.">
          <textarea name="footerBlurb" defaultValue={site.footerBlurb} rows={4} maxLength={300} className={cn(inputClass, "h-auto py-2")} />
        </Field>
      </Section>

      <div className="sticky bottom-0 -mx-1 flex justify-end bg-gradient-to-t from-field via-field/90 px-1 py-3">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
