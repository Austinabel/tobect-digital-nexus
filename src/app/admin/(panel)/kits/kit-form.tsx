"use client";

import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { buttonClass, ghostButtonClass, inputClass } from "@/components/admin/admin-ui";
import { ImagePicker, type PickerImage } from "@/components/admin/image-picker";
import { submitWithoutReset } from "@/components/admin/submit-without-reset";
import { FOCUS_OPTIONS } from "@/lib/admin/campaign-form";
import { KIT_SLOTS, MAX_ADDONS } from "@/lib/admin/kit-form";
import { formatNaira } from "@/lib/data/products";
import { saveKit } from "./actions";

export interface KitProductOption {
  slug: string;
  name: string;
  category: string;
  priceNgn: number;
  published: boolean;
}

export interface KitSlotValues {
  on: boolean;
  label: string;
  choices: string[];
  qmin: string;
  qdef: string;
  qmax: string;
}

export interface KitValues {
  slug: string;
  name: string;
  capacityLabel: string;
  tag: string;
  summary: string;
  applications: string;
  outline: string;
  imageUrl: string;
  imageAlt: string;
  imagePosition: string;
  purchasable: boolean;
  accessories: string;
  accessoriesPrice: string;
  installationNote: string;
  published: boolean;
  sortOrder: string;
  slots: Record<string, KitSlotValues>;
  addons: { label: string; description: string; price: string }[];
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

function Section({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-hair bg-white p-5">
      <h2 className="font-heading text-[1rem] font-bold text-ink">{title}</h2>
      {intro && <p className="mt-0.5 text-[0.8rem] text-slate">{intro}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

const textarea = cn(inputClass, "h-auto py-2");

export function KitForm({ mode, initial, products, library, canUpload }: { mode: "new" | "edit"; initial: KitValues; products: KitProductOption[]; library: PickerImage[]; canUpload: boolean }) {
  const [state, action, pending] = useActionState(saveKit, undefined);
  const e = state?.errors ?? {};
  const [slots, setSlots] = useState(initial.slots);
  const [purchasable, setPurchasable] = useState(initial.purchasable);
  const [accPrice, setAccPrice] = useState(initial.accessoriesPrice);
  const [focus, setFocus] = useState(initial.imagePosition);
  const bySlug = new Map(products.map((p) => [p.slug, p]));

  const patch = (key: string, p: Partial<KitSlotValues>) => setSlots((s) => ({ ...s, [key]: { ...s[key], ...p } }));

  // The same sum the shop does: first choice × standard quantity for each position, plus a priced accessory bundle.
  const lines = KIT_SLOTS.flatMap((d) => {
    const s = slots[d.key];
    const p = s.on ? bySlug.get(s.choices[0]) : undefined;
    const q = Number(s.qdef);
    return p && Number.isInteger(q) && q > 0 ? [{ label: s.label || d.label, name: p.name, qty: q, total: p.priceNgn * q, hidden: !p.published }] : [];
  });
  const acc = Number(accPrice.replace(/[,\s₦]/g, ""));
  const total = lines.reduce((t, l) => t + l.total, 0) + (accPrice && Number.isFinite(acc) ? acc : 0);
  const anyHidden = lines.some((l) => l.hidden);

  return (
    <form action={action} onSubmit={submitWithoutReset(action)} className="grid items-start gap-4 xl:grid-cols-[1fr_340px]">
      {mode === "edit" && <input type="hidden" name="existing_slug" value={initial.slug} />}
      <div className="space-y-4">
        {(e.form || Object.keys(e).length > 0) && (
          <p role="alert" className="rounded-xl border border-red/30 bg-red/5 px-4 py-3 text-[0.88rem] text-red-dark">
            {e.form ?? "Please fix the highlighted fields."}
          </p>
        )}

        <Section title="Kit details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Kit name *" error={e.name} className="sm:col-span-2">
              <input name="name" defaultValue={initial.name} required maxLength={120} className={inputClass} />
            </Field>
            {mode === "new" ? (
              <Field label="Web address" hint="Leave empty to create it from the name. Can't be changed later." error={e.slug} className="sm:col-span-2">
                <span className="flex items-center gap-1.5 text-[0.84rem] text-slate">
                  /shop/installation-kits/
                  <input name="slug" defaultValue={initial.slug} placeholder="5kva-complete-solar-kit" className={inputClass} />
                </span>
              </Field>
            ) : (
              <p className="text-[0.82rem] text-slate sm:col-span-2">
                Web address:{" "}
                <Link href={`/shop/installation-kits/${initial.slug}`} target="_blank" className="font-semibold text-blue hover:underline">
                  /shop/installation-kits/{initial.slug}
                </Link>
              </p>
            )}
            <Field label="System size *" hint="e.g. 5KVA" error={e.capacity_label}>
              <input name="capacity_label" defaultValue={initial.capacityLabel} required maxLength={20} className={inputClass} />
            </Field>
            <Field label="Tag on the photo" hint="e.g. Home Kit, Business Kit">
              <input name="tag" defaultValue={initial.tag} maxLength={30} className={inputClass} />
            </Field>
            <Field label="Summary *" hint="One sentence: who it's for and what it powers." error={e.summary} className="sm:col-span-2">
              <textarea name="summary" defaultValue={initial.summary} rows={2} maxLength={400} className={textarea} />
            </Field>
            <Field label="Suitable for" hint="One per line, e.g. Family homes" className="sm:col-span-2">
              <textarea name="applications" defaultValue={initial.applications} rows={3} className={textarea} />
            </Field>
            <Field label="Installation note" hint="Shown on the kit page under installation." className="sm:col-span-2">
              <textarea name="installation_note" defaultValue={initial.installationNote} rows={2} maxLength={600} className={textarea} />
            </Field>
          </div>
        </Section>

        <Section
          title="Components"
          intro="Choose the products that can fill each position. The first product is the standard choice; customers can switch to the others and change quantities within your limits. The kit price is always added up from these products' current prices."
        >
          <div className="space-y-4">
            {KIT_SLOTS.map((d) => {
              const s = slots[d.key];
              const err = e[`slot_${d.key}`];
              const options = [...products].sort((a, b) => Number(b.category === d.category) - Number(a.category === d.category) || a.name.localeCompare(b.name));
              return (
                <fieldset key={d.key} className={cn("rounded-xl border p-3.5", s.on ? "border-blue/40 bg-mist/30" : "border-hair")}>
                  <legend className="sr-only">{d.label}</legend>
                  <input type="hidden" name={`slot_${d.key}_choices`} value={JSON.stringify(s.choices)} />
                  <label className="flex items-center gap-2 font-heading text-[0.92rem] font-bold text-ink">
                    <input type="checkbox" name={`slot_${d.key}_on`} checked={s.on} onChange={(ev) => patch(d.key, { on: ev.target.checked })} className="size-4 accent-[var(--color-blue)]" />
                    {d.label}
                  </label>
                  {s.on && (
                    <div className="mt-3 space-y-3">
                      <Field label="Name shown to customers">
                        <input name={`slot_${d.key}_label`} value={s.label} onChange={(ev) => patch(d.key, { label: ev.target.value })} maxLength={60} className={inputClass} />
                      </Field>
                      <div>
                        <span className="mb-1 block text-[0.8rem] font-semibold text-ink">Products</span>
                        {s.choices.length > 0 && (
                          <ol className="mb-2 space-y-1.5">
                            {s.choices.map((slug, i) => {
                              const p = bySlug.get(slug);
                              return (
                                <li key={slug} className="flex flex-wrap items-center gap-2 rounded-lg border border-hair bg-white px-2.5 py-1.5 text-[0.84rem]">
                                  <span className="grow">
                                    {i === 0 && <span className="mr-1.5 rounded bg-blue px-1.5 text-[0.66rem] font-bold text-white">STANDARD</span>}
                                    {p?.name ?? slug}
                                    {p && <span className="text-slate"> · {formatNaira(p.priceNgn)}</span>}
                                    {p && !p.published && <span className="ml-1.5 text-[0.74rem] font-semibold text-red-dark">hidden from the shop</span>}
                                  </span>
                                  {i > 0 && (
                                    <button type="button" onClick={() => patch(d.key, { choices: [slug, ...s.choices.filter((c) => c !== slug)] })} className="text-[0.76rem] font-semibold text-blue hover:underline">
                                      Make standard
                                    </button>
                                  )}
                                  <button type="button" onClick={() => patch(d.key, { choices: s.choices.filter((c) => c !== slug) })} aria-label={`Remove ${p?.name ?? slug}`} className="text-[0.76rem] font-semibold text-slate hover:text-red">
                                    Remove
                                  </button>
                                </li>
                              );
                            })}
                          </ol>
                        )}
                        <select
                          value=""
                          onChange={(ev) => ev.target.value && patch(d.key, { choices: [...s.choices, ev.target.value] })}
                          aria-label={`Add a product to ${d.label}`}
                          className={inputClass}
                        >
                          <option value="">+ Add a product…</option>
                          {options
                            .filter((p) => !s.choices.includes(p.slug))
                            .map((p) => (
                              <option key={p.slug} value={p.slug}>
                                {p.name} — {formatNaira(p.priceNgn)}
                                {p.published ? "" : " (hidden)"}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(
                          [
                            ["qmin", "Fewest"],
                            ["qdef", "Standard"],
                            ["qmax", "Most"],
                          ] as const
                        ).map(([k, l]) => (
                          <Field key={k} label={`${l} qty`}>
                            <input name={`slot_${d.key}_${k}`} type="number" min={1} max={999} value={s[k]} onChange={(ev) => patch(d.key, { [k]: ev.target.value })} className={inputClass} />
                          </Field>
                        ))}
                      </div>
                      {err && <p className="text-[0.78rem] text-red-dark">{err}</p>}
                    </div>
                  )}
                </fieldset>
              );
            })}
          </div>
        </Section>

        <Section title="Included accessories" intro="Always included. One per line; add details after a dash, e.g. “DC cables — 6mm², 30m”.">
          <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
            <textarea name="accessories" defaultValue={initial.accessories} rows={6} aria-label="Included accessories" className={textarea} />
            <Field label="Price for all accessories" hint="Leave empty if it's agreed with each order — the shop then says so." error={e.accessories_price}>
              <input name="accessories_price" value={accPrice} onChange={(ev) => setAccPrice(ev.target.value)} inputMode="numeric" placeholder="₦" className={inputClass} />
            </Field>
          </div>
        </Section>

        <Section title="Optional extras" intro="Customers can tick these. Leave the price empty for “quoted after a site survey”.">
          <div className="space-y-3">
            {Array.from({ length: MAX_ADDONS }, (_, i) => {
              const a = initial.addons[i] ?? { label: "", description: "", price: "" };
              return (
                <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1.4fr_140px]">
                  <input name={`addon_${i}_label`} defaultValue={a.label} maxLength={100} placeholder="e.g. Professional installation" aria-label={`Extra ${i + 1} name`} className={inputClass} />
                  <input name={`addon_${i}_desc`} defaultValue={a.description} maxLength={240} placeholder="Short explanation" aria-label={`Extra ${i + 1} description`} className={inputClass} />
                  <input name={`addon_${i}_price`} defaultValue={a.price} inputMode="numeric" placeholder="₦ or empty" aria-label={`Extra ${i + 1} price`} className={inputClass} />
                  {e[`addon_${i}`] && <p className="text-[0.78rem] text-red-dark sm:col-span-3">{e[`addon_${i}`]}</p>}
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      <div className="space-y-4">
        <Section title="Selling">
          <div className="space-y-3">
            <label className="flex items-start gap-2 text-[0.88rem]">
              <input type="checkbox" name="published" defaultChecked={initial.published} className="mt-0.5 size-4 accent-[var(--color-blue)]" />
              <span>
                <strong>Show in the shop</strong>
              </span>
            </label>
            <label className="flex items-start gap-2 text-[0.88rem]">
              <input type="checkbox" name="purchasable" checked={purchasable} onChange={(ev) => setPurchasable(ev.target.checked)} className="mt-0.5 size-4 accent-[var(--color-blue)]" />
              <span>
                <strong>Sell online (Add to cart)</strong>
                <span className="block text-[0.76rem] text-slate">Off = “configured to order”: customers request a quote instead.</span>
              </span>
            </label>
            {e.purchasable && <p className="text-[0.78rem] text-red-dark">{e.purchasable}</p>}
            {purchasable ? (
              <div className="rounded-xl bg-field p-3 text-[0.82rem]">
                <p className="font-semibold text-ink">Standard kit price</p>
                {lines.length ? (
                  <>
                    <ul className="mt-1 space-y-0.5 text-slate">
                      {lines.map((l) => (
                        <li key={l.label} className="flex justify-between gap-2">
                          <span>
                            {l.qty} × {l.name}
                          </span>
                          <span className="tabular-nums">{formatNaira(l.total)}</span>
                        </li>
                      ))}
                      <li className="flex justify-between gap-2">
                        <span>Accessories</span>
                        <span>{accPrice ? formatNaira(acc || 0) : "agreed per order"}</span>
                      </li>
                    </ul>
                    <p className="mt-1.5 flex justify-between border-t border-hair pt-1.5 font-heading font-extrabold text-ink">
                      <span>Total</span>
                      <span className="tabular-nums">{formatNaira(total)}</span>
                    </p>
                    {anyHidden && <p className="mt-1 text-[0.76rem] text-red-dark">A standard product is hidden from the shop, so this kit will show as “configured to order” until it is published.</p>}
                  </>
                ) : (
                  <p className="mt-1 text-slate">Switch on a component and choose its products.</p>
                )}
              </div>
            ) : (
              <Field label="What it's built from" hint="One per line, shown instead of a parts list, e.g. “5kVA hybrid inverter”.">
                <textarea name="outline" defaultValue={initial.outline} rows={4} className={textarea} />
              </Field>
            )}
            {purchasable && <input type="hidden" name="outline" value={initial.outline} />}
            <Field label="Order in the list" hint="Lower numbers show first." error={e.sort_order}>
              <input name="sort_order" type="number" min={0} max={999} defaultValue={initial.sortOrder} className={inputClass} />
            </Field>
          </div>
          <button type="submit" disabled={pending} className={cn(buttonClass, "mt-4 w-full")}>
            {pending ? "Saving…" : mode === "new" ? "Create kit" : "Save kit"}
          </button>
        </Section>

        <Section title="Photo">
          <div className="space-y-3">
            <ImagePicker name="image_url" label="Card & page photo" initialUrl={initial.imageUrl} library={library} canUpload={canUpload} focus={focus} error={e.image_url} hint="Shown with an “Illustrative photo” label." />
            <Field label="Photo description">
              <input name="image_alt" defaultValue={initial.imageAlt} maxLength={200} className={inputClass} />
            </Field>
            <Field label="Focal point" error={e.image_position}>
              <select name="image_position" value={focus} onChange={(ev) => setFocus(ev.target.value)} className={inputClass}>
                {FOCUS_OPTIONS.map(([v, l]) => (
                  <option key={l} value={v}>
                    {l}
                  </option>
                ))}
                {focus && !FOCUS_OPTIONS.some(([v]) => v === focus) && <option value={focus}>Custom ({focus})</option>}
              </select>
            </Field>
          </div>
        </Section>
        {mode === "edit" && (
          <p className="text-[0.76rem] text-slate">
            To remove a kit, untick “Show in the shop” and save; a hidden kit can then be deleted from the{" "}
            <Link href="/admin/kits" className={cn(ghostButtonClass, "h-auto border-0 p-0 text-blue underline")}>
              kits list
            </Link>
            .
          </p>
        )}
      </div>
    </form>
  );
}
