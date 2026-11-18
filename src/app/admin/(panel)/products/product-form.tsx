"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useCallback, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";
import { buttonClass, ghostButtonClass, inputClass } from "@/components/admin/admin-ui";
import { submitWithoutReset } from "@/components/admin/submit-without-reset";
import { fieldsFor, numberPart, productTypeFor, type ProductField } from "@/lib/shop/product-fields";
import { MAX_IMAGES } from "@/lib/admin/product-form";
import type { DuplicateMatch } from "@/lib/admin/product-dedupe";
import { saveProduct } from "./actions";
import { addImageFromUrl, checkDuplicates, scanProduct } from "./listing-actions";
import { uploadMedia } from "../media/actions";

export interface LibraryImage {
  id: string;
  url: string;
  alt: string;
  filename: string;
}

export interface ProductFormValues {
  slug: string;
  name: string;
  brand: string;
  model: string;
  sku: string;
  barcode: string;
  category: string;
  price: string;
  compareAt: string;
  availability: string;
  stock: string;
  specs: string;
  attributes: Record<string, string>;
  description: string;
  seoTitle: string;
  seoDescription: string;
  invBatteryV: string;
  invMaxPv: string;
  invMpptMin: string;
  featured: boolean;
  published: boolean;
  imageIds: string[];
}

export interface FormCategory {
  slug: string;
  name: string;
  parent_slug: string | null;
}

/* Chrome on Android (and some desktops) can read barcodes from a photo. */
interface DetectedBarcode {
  rawValue: string;
}
declare global {
  interface Window {
    BarcodeDetector?: new (opts?: { formats?: string[] }) => { detect(source: ImageBitmapSource): Promise<DetectedBarcode[]> };
  }
}

async function readBarcode(files: File[]): Promise<string | null> {
  if (typeof window === "undefined" || !window.BarcodeDetector) return null;
  try {
    const detector = new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"] });
    for (const f of files) {
      const bitmap = await createImageBitmap(f);
      const codes = await detector.detect(bitmap);
      bitmap.close();
      const digits = codes.map((c) => c.rawValue.replace(/\D/g, "")).find((d) => d.length >= 6 && d.length <= 14);
      if (digits) return digits;
    }
  } catch {
    /* not supported for this image — fine */
  }
  return null;
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

function Section({ title, intro, children, id }: { title: string; intro?: ReactNode; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-20 rounded-2xl border border-hair bg-white p-4 sm:p-5">
      <h2 className="font-heading text-[1rem] font-bold text-ink">{title}</h2>
      {intro && <p className="mt-0.5 text-[0.8rem] text-slate">{intro}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

const chipClass = (on: boolean) =>
  cn(
    "inline-flex min-h-10 items-center rounded-full border px-3.5 text-[0.86rem] font-semibold transition-colors",
    on ? "border-blue bg-blue text-white" : "border-hair bg-white text-ink hover:border-blue hover:text-blue",
  );

/** Category as big tap targets: main categories, then the chosen one's subcategories. */
function CategoryPicker({ categories, value, onChange, error, highlight }: { categories: FormCategory[]; value: string; onChange: (slug: string) => void; error?: string; highlight?: boolean }) {
  const top = categories.filter((c) => !c.parent_slug);
  const current = categories.find((c) => c.slug === value);
  const chosenTop = current?.parent_slug ?? (current ? current.slug : "");
  const subs = categories.filter((c) => c.parent_slug === chosenTop);
  return (
    <fieldset className={cn("rounded-xl", highlight && "ring-2 ring-gold/70")}>
      <legend className="mb-1.5 block text-[0.8rem] font-semibold text-ink">Category *</legend>
      <input type="hidden" name="category" value={value} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {top.map((t) => {
          const on = chosenTop === t.slug;
          return (
            <button
              key={t.slug}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(t.slug)}
              className={cn(
                "min-h-12 rounded-xl border px-3 py-2 text-left text-[0.86rem] font-semibold leading-tight transition-colors",
                on ? "border-blue bg-blue text-white" : "border-hair bg-white text-ink hover:border-blue",
              )}
            >
              {t.name}
            </button>
          );
        })}
      </div>
      {subs.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-[0.76rem] font-semibold text-slate">Type (optional)</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" aria-pressed={value === chosenTop} onClick={() => onChange(chosenTop)} className={chipClass(value === chosenTop)}>
              Any {categories.find((c) => c.slug === chosenTop)?.name}
            </button>
            {subs.map((s) => (
              <button key={s.slug} type="button" aria-pressed={value === s.slug} onClick={() => onChange(s.slug)} className={chipClass(value === s.slug)}>
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}
      {error && <span className="mt-1 block text-[0.78rem] text-red-dark">{error}</span>}
    </fieldset>
  );
}

/** One product-detail field: tap-to-choose buttons, or a number box with its unit and one-tap common values. */
function DetailField({ field, value, onChange, error, highlight }: { field: ProductField; value: string; onChange: (v: string) => void; error?: string; highlight?: boolean }) {
  const inputId = useId();
  const isOption = field.options?.includes(value) ?? false;
  const [otherOpen, setOtherOpen] = useState(Boolean(value) && !isOption);
  const showOther = otherOpen || (Boolean(value) && !isOption);

  if (field.kind === "choice") {
    return (
      <fieldset className={cn("sm:col-span-2", highlight && "rounded-xl ring-2 ring-gold/70")}>
        <legend className="mb-1.5 block text-[0.8rem] font-semibold text-ink">{field.label}</legend>
        <input type="hidden" name={`attr_${field.key}`} value={value} />
        <div className="flex flex-wrap gap-2">
          {field.options!.map((o) => (
            <button
              key={o}
              type="button"
              aria-pressed={value === o}
              onClick={() => {
                setOtherOpen(false);
                onChange(value === o ? "" : o); // tap again to clear
              }}
              className={chipClass(value === o)}
            >
              {o}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={showOther}
            onClick={() => {
              if (showOther) {
                setOtherOpen(false);
                if (!isOption) onChange("");
              } else {
                setOtherOpen(true);
                if (isOption) onChange("");
              }
            }}
            className={chipClass(showOther)}
          >
            Other…
          </button>
        </div>
        {showOther && (
          <input
            aria-label={`${field.label} (other)`}
            value={isOption ? "" : value}
            onChange={(ev) => onChange(ev.target.value)}
            maxLength={40}
            placeholder="Type it"
            autoFocus={otherOpen && !value}
            className={cn(inputClass, "mt-2 max-w-sm")}
          />
        )}
        {error && <span className="mt-1 block text-[0.78rem] text-red-dark">{error}</span>}
      </fieldset>
    );
  }

  return (
    <div className={cn(highlight && "rounded-xl ring-2 ring-gold/70")}>
      <label htmlFor={inputId} className="mb-1 block text-[0.8rem] font-semibold text-ink">
        {field.label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          name={`attr_${field.key}`}
          value={value}
          onChange={(ev) => onChange(ev.target.value)}
          inputMode={field.kind === "number" ? "decimal" : undefined}
          maxLength={40}
          autoComplete="off"
          className={cn(inputClass, field.unit && "pr-16")}
        />
        {field.unit && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.82rem] font-semibold text-slate">{field.unit}</span>}
      </div>
      {field.quick && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {field.quick.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onChange(value === String(q) ? "" : String(q))}
              aria-pressed={value === String(q)}
              className={cn(
                "inline-flex h-9 items-center rounded-lg border px-2.5 text-[0.8rem] font-semibold tabular-nums",
                value === String(q) ? "border-blue bg-blue text-white" : "border-hair bg-field text-ink hover:border-blue",
              )}
            >
              {q}
              {field.unit && field.unit.length <= 3 ? ` ${field.unit}` : ""}
            </button>
          ))}
        </div>
      )}
      {error ? <span className="mt-1 block text-[0.78rem] text-red-dark">{error}</span> : field.hint ? <span className="mt-1 block text-[0.74rem] text-slate">{field.hint}</span> : null}
    </div>
  );
}

function DuplicatePanel({ matches, mustConfirm }: { matches: DuplicateMatch[]; mustConfirm: boolean }) {
  if (!matches.length) return null;
  const certain = matches.some((m) => m.strength === "certain");
  return (
    <div role="status" className={cn("rounded-2xl border p-4", certain ? "border-red/40 bg-red/5" : "border-gold/60 bg-gold/10")}>
      <p className="font-heading text-[0.92rem] font-bold text-ink">{certain ? "Already listed" : "Possibly already listed"}</p>
      <p className="text-[0.78rem] text-slate">{certain ? "Update the existing product instead of listing it again." : "Check these before adding a new product."}</p>
      <ul className="mt-2 space-y-1.5">
        {matches.map((m) => (
          <li key={m.slug} className="rounded-xl bg-white px-3 py-2 text-[0.84rem]">
            <span className="font-semibold text-ink">{m.name}</span>
            <span className="block text-[0.74rem] text-slate">
              {m.reason}
              {m.deleted ? " · in the trash" : m.published ? " · live" : " · draft"}
            </span>
            <span className="mt-1 flex flex-wrap gap-3 text-[0.78rem] font-semibold">
              <Link href={`/admin/products/${m.slug}`} target="_blank" className="text-blue hover:underline">
                Open it ↗
              </Link>
              {m.deleted && (
                <Link href="/admin/products?status=trash" target="_blank" className="text-blue hover:underline">
                  Restore from trash ↗
                </Link>
              )}
            </span>
          </li>
        ))}
      </ul>
      {!certain && mustConfirm && (
        <label className="mt-3 flex items-start gap-2 text-[0.84rem] font-semibold text-ink">
          <input type="checkbox" name="confirm_different" className="mt-0.5 size-4 accent-[var(--color-blue)]" />
          This is a different product — list it anyway
        </label>
      )}
    </div>
  );
}

export function ProductForm({
  mode,
  initial,
  categories,
  brands,
  library: initialLibrary,
  isSample,
  canScan,
}: {
  mode: "new" | "edit";
  initial: ProductFormValues;
  categories: FormCategory[];
  brands: string[];
  library: LibraryImage[];
  isSample?: boolean;
  /** AI scanning is set up on the server */
  canScan: boolean;
}) {
  const [state, action, pending] = useActionState(saveProduct, undefined);
  const e = state?.errors ?? {};
  const formRef = useRef<HTMLFormElement>(null);
  const [category, setCategory] = useState(initial.category);
  const [imageIds, setImageIds] = useState<string[]>(initial.imageIds);
  const [library, setLibrary] = useState<LibraryImage[]>(initialLibrary);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);
  const [filled, setFilled] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [link, setLink] = useState("");
  const hasBarcodeReader = useSyncExternalStore(
    () => () => {},
    () => Boolean(window.BarcodeDetector),
    () => false,
  );
  const brandList = useId();
  const byId = new Map(library.map((m) => [m.id, m]));
  const parentOf = new Map(categories.map((c) => [c.slug, c.parent_slug]));
  const productType = category ? productTypeFor(category, parentOf.get(category)) : undefined;
  // Product details are controlled: number fields hold just the number ("48"), the unit is added on save.
  const [attrs, setAttrs] = useState<Record<string, string>>(() => {
    const numeric = new Set(fieldsFor(initial.category, categories.find((c) => c.slug === initial.category)?.parent_slug).filter((f) => f.kind === "number").map((f) => f.key));
    const start: Record<string, string> = {};
    for (const [k, v] of Object.entries(initial.attributes)) start[k] = numeric.has(k) ? numberPart(v) || v : v;
    // most stock is new: preselect it for a new listing
    if (mode === "new" && !start.condition) start.condition = "New";
    return start;
  });
  const setAttr = (key: string, v: string) => setAttrs((a) => ({ ...a, [key]: v }));
  const shownDuplicates = state?.duplicates ?? duplicates;

  /* ---------- reading / filling the uncontrolled fields ---------- */
  const field = (name: string) => formRef.current?.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
  const valueOf = (name: string) => field(name)?.value ?? "";
  /** Fill a field only if staff haven't typed anything there yet. */
  const fillIfEmpty = (name: string, value: string | null | undefined) => {
    const el = field(name);
    if (!el || !value || el.value.trim()) return false;
    el.value = value;
    return true;
  };

  /* ---------- live duplicate check ---------- */
  const dupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runDuplicateCheck = useCallback(() => {
    if (dupTimer.current) clearTimeout(dupTimer.current);
    dupTimer.current = setTimeout(async () => {
      const name = valueOf("name");
      const candidate = { slug: mode === "edit" ? initial.slug : undefined, name, brand: valueOf("brand"), model: valueOf("model"), sku: valueOf("sku"), barcode: valueOf("barcode") };
      if (name.trim().length < 3 && !candidate.model && !candidate.sku && !candidate.barcode) return setDuplicates([]);
      try {
        setDuplicates(await checkDuplicates(candidate));
      } catch {
        /* the check is a convenience — saving checks again */
      }
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initial.slug]);

  /* ---------- photos ---------- */
  const move = (i: number, d: -1 | 1) =>
    setImageIds((ids) => {
      const n = [...ids];
      const j = i + d;
      if (j < 0 || j >= n.length) return ids;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  const toggle = (id: string) => setImageIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : ids.length >= MAX_IMAGES ? ids : [...ids, id]));

  const addPhotos = async (files: File[]) => {
    const fd = new FormData();
    files.slice(0, MAX_IMAGES).forEach((f) => fd.append("files", f));
    const res = await uploadMedia(undefined, fd);
    const created = res?.created ?? [];
    setLibrary((l) => [...created.filter((c) => !l.some((x) => x.id === c.id)), ...l]);
    setImageIds((ids) => [...ids, ...created.map((c) => c.id).filter((id) => !ids.includes(id))].slice(0, MAX_IMAGES));
    return res;
  };

  const uploadOnly = async (list: FileList | null) => {
    const files = [...(list ?? [])];
    if (!files.length) return;
    setBusy("Saving photos…");
    setNotice(null);
    try {
      const res = await addPhotos(files);
      setNotice(res?.errors?.length ? { tone: "warn", text: res.errors.join(" ") } : res?.ok ? { tone: "ok", text: res.ok } : null);
    } catch {
      setNotice({ tone: "warn", text: "Upload failed — please try again." });
    } finally {
      setBusy(null);
    }
  };

  /** Scan: save the photos, read a barcode, ask the AI for details, then check for duplicates. */
  const scan = async (list: FileList | null) => {
    const files = [...(list ?? [])].slice(0, 3);
    if (!files.length) return;
    setNotice(null);
    setFilled([]);
    const got: string[] = [];
    try {
      setBusy("Saving photos…");
      const upload = addPhotos(files);
      setBusy("Looking for a barcode…");
      const code = await readBarcode(files);
      if (code && fillIfEmpty("barcode", code)) got.push("Barcode");

      let scanNote = "";
      if (canScan) {
        setBusy("Reading the label…");
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        const res = await scanProduct(fd);
        if (res.error) scanNote = res.error;
        const r = res.result;
        if (r) {
          if (!r.recognised) scanNote = r.notes || "The product couldn't be identified from these photos.";
          if (fillIfEmpty("name", r.name)) got.push("Name");
          if (fillIfEmpty("brand", r.brand)) got.push("Brand");
          if (fillIfEmpty("model", r.model)) got.push("Model");
          if (!code && fillIfEmpty("barcode", r.barcode?.replace(/\D/g, "") || null)) got.push("Barcode");
          if (r.key_specs.length && fillIfEmpty("specs", r.key_specs.slice(0, 8).join(", "))) got.push("Key specs");
          if (fillIfEmpty("description", r.description)) got.push("Description");
          const chosen = category || r.category || "";
          if (!category && r.category) {
            // render the category's spec fields now, so they can be filled below
            flushSync(() => setCategory(r.category!));
            got.push("Category");
          }
          const chosenType = chosen ? productTypeFor(chosen, parentOf.get(chosen)) : undefined;
          const found: Record<string, string> = {};
          for (const a of r.attributes) {
            const spec = chosenType?.fields.find((x) => x.key === a.key);
            const v = spec ? (spec.kind === "number" ? numberPart(a.value) : a.value.trim().slice(0, 40)) : "";
            if (spec && v && !attrs[a.key]?.trim()) {
              found[a.key] = v;
              got.push(spec.label);
            }
          }
          // only fill details staff haven't set yet
          setAttrs((prev) => ({ ...prev, ...Object.fromEntries(Object.entries(found).filter(([k]) => !prev[k]?.trim())) }));
          if (chosenType?.id === "inverter") {
            if (r.inverter_battery_v && [12, 24, 48].includes(r.inverter_battery_v) && fillIfEmpty("inv_battery_v", String(r.inverter_battery_v))) got.push("Battery voltage");
            if (fillIfEmpty("inv_max_pv_v", r.inverter_max_pv_v ? String(r.inverter_max_pv_v) : null)) got.push("Max PV voltage");
            if (fillIfEmpty("inv_mppt_min_v", r.inverter_mppt_min_v ? String(r.inverter_mppt_min_v) : null)) got.push("MPPT minimum");
          }
          if (r.notes && r.recognised) scanNote = r.notes;
          if (res.duplicates) setDuplicates(res.duplicates);
        }
      }
      const up = await upload;
      setFilled(got);
      const parts = [
        up?.created?.length ? `${up.created.length} photo${up.created.length > 1 ? "s" : ""} added${up.reused ? ` (${up.reused} already in the library)` : ""}.` : up?.errors?.join(" ") ?? "",
        got.length ? "Filled in from the photos — please check every highlighted field before saving." : canScan ? "" : code ? "" : "Fill in the details below.",
        scanNote,
      ].filter(Boolean);
      setNotice({ tone: got.length || up?.created?.length ? "ok" : "warn", text: parts.join(" ") });
      runDuplicateCheck();
    } catch {
      setNotice({ tone: "warn", text: "Something went wrong while scanning — please try again or fill in the details by hand." });
    } finally {
      setBusy(null);
    }
  };

  const scanBarcode = async (list: FileList | null) => {
    const files = [...(list ?? [])];
    if (!files.length) return;
    setBusy("Reading the barcode…");
    const code = await readBarcode(files);
    setBusy(null);
    if (code) {
      const el = field("barcode");
      if (el) el.value = code;
      setNotice({ tone: "ok", text: `Barcode ${code} read.` });
      runDuplicateCheck();
    } else setNotice({ tone: "warn", text: "No barcode found — hold the camera closer and keep the bars sharp, or type the digits." });
  };

  /** Download an image from a link into the library and add it to this product. */
  const addFromLink = async () => {
    const url = link.trim();
    if (!url) return;
    if (imageIds.length >= MAX_IMAGES) return setNotice({ tone: "warn", text: `A product can have up to ${MAX_IMAGES} photos.` });
    setBusy("Downloading image…");
    setNotice(null);
    try {
      const res = await addImageFromUrl(url);
      if (res.image) {
        const img = res.image;
        setLibrary((l) => (l.some((x) => x.id === img.id) ? l : [img, ...l]));
        setImageIds((ids) => (ids.includes(img.id) ? ids : [...ids, img.id]));
        setLink("");
        setNotice({ tone: "ok", text: res.reused ? "That image was already in the library — added it to this product." : "Image downloaded and added." });
      } else setNotice({ tone: "warn", text: res.error ?? "Couldn't add that image." });
    } catch {
      setNotice({ tone: "warn", text: "Couldn't download that image — please try again." });
    } finally {
      setBusy(null);
    }
  };

  const hl = (label: string) => (filled.includes(label) ? "ring-2 ring-gold/70" : "");
  const busyNow = Boolean(busy) || pending;

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={submitWithoutReset(action)}
      onInput={(ev) => {
        const n = (ev.target as HTMLInputElement).name;
        if (["name", "brand", "model", "sku", "barcode"].includes(n)) runDuplicateCheck();
      }}
      className="grid items-start gap-4 pb-24 xl:grid-cols-[1fr_340px] xl:pb-0"
    >
      {mode === "edit" && <input type="hidden" name="existing_slug" value={initial.slug} />}
      <input type="hidden" name="images" value={JSON.stringify(imageIds)} />

      <div className="min-w-0 space-y-4">
        {e.form && <p role="alert" className="rounded-xl border border-red/30 bg-red/5 px-4 py-3 text-[0.88rem] text-red-dark">{e.form}</p>}
        {e.duplicates && <p role="alert" className="rounded-xl border border-red/30 bg-red/5 px-4 py-3 text-[0.88rem] text-red-dark">{e.duplicates}</p>}

        {/* ---------- 1. scan & photos ---------- */}
        <Section
          id="photos"
          title={mode === "new" ? "1. Scan or add photos" : `Photos (${imageIds.length}/${MAX_IMAGES})`}
          intro={
            mode === "new"
              ? canScan
                ? "Photograph the product and its rating label or box. The photos are saved, any barcode is read, and the details are filled in for you to check."
                : "Photograph the product (and its label or box). Any barcode is read automatically."
              : undefined
          }
        >
          <div className="grid gap-2 sm:grid-cols-2">
            <label className={cn(buttonClass, "h-12 cursor-pointer text-[0.95rem]", busyNow && "pointer-events-none opacity-60")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5" aria-hidden>
                <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
              {canScan ? "Scan product with camera" : "Take photos"}
              <input type="file" accept="image/*" capture="environment" multiple className="sr-only" disabled={busyNow} onChange={(ev) => { scan(ev.target.files); ev.target.value = ""; }} />
            </label>
            <label className={cn(ghostButtonClass, "h-12 cursor-pointer text-[0.9rem]", busyNow && "pointer-events-none opacity-60")}>
              {canScan ? "Scan photos from your device" : "Choose photos"}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple className="sr-only" disabled={busyNow} onChange={(ev) => { scan(ev.target.files); ev.target.value = ""; }} />
            </label>
          </div>
          {!canScan && mode === "new" && <p className="mt-2 text-[0.74rem] text-slate">Automatic reading of labels is available once the site owner turns on scanning (see ADMIN.md).</p>}
          {busy && (
            <p role="status" className="mt-3 flex items-center gap-2 text-[0.84rem] font-semibold text-blue">
              <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-blue/30 border-t-blue" />
              {busy}
            </p>
          )}
          {notice && !busy && (
            <p role="status" className={cn("mt-3 rounded-xl px-3 py-2 text-[0.82rem]", notice.tone === "ok" ? "bg-[#effaf3] text-[#17733b]" : "bg-gold/15 text-ink")}>
              {notice.text}
            </p>
          )}

          <div className="mt-4">
            {imageIds.length > 0 ? (
              <ol className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {imageIds.map((id, i) => {
                  const m = byId.get(id);
                  return (
                    <li key={id} className="relative overflow-hidden rounded-xl border border-hair bg-field">
                      <div className="relative aspect-square">{m && <Image src={m.url} alt={m.alt} fill sizes="140px" className="object-cover" />}</div>
                      {i === 0 && <span className="absolute left-1 top-1 rounded bg-blue px-1.5 text-[0.62rem] font-bold text-white">MAIN</span>}
                      <div className="flex justify-between bg-white text-[1rem]">
                        <button type="button" aria-label="Move earlier" onClick={() => move(i, -1)} disabled={i === 0} className="grid h-9 grow place-items-center text-slate disabled:opacity-30">
                          ←
                        </button>
                        <button type="button" aria-label="Remove photo" onClick={() => toggle(id)} className="grid h-9 grow place-items-center text-red">
                          ×
                        </button>
                        <button type="button" aria-label="Move later" onClick={() => move(i, 1)} disabled={i === imageIds.length - 1} className="grid h-9 grow place-items-center text-slate disabled:opacity-30">
                          →
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-[0.82rem] text-slate">No photos yet — the shop shows a “photo coming soon” placeholder. The first photo is the main one.</p>
            )}
            {e.imageIds && <p className="mt-2 text-[0.78rem] text-red-dark">{e.imageIds}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <label className={cn(ghostButtonClass, "cursor-pointer")}>
                Add photos without scanning
                <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" disabled={busyNow} onChange={(ev) => { uploadOnly(ev.target.files); ev.target.value = ""; }} />
              </label>
              <button type="button" onClick={() => setPickerOpen((o) => !o)} className={ghostButtonClass} aria-expanded={pickerOpen}>
                {pickerOpen ? "Close library" : "Choose from library"}
              </button>
            </div>
            <div className="mt-3">
              <label htmlFor="image-link" className="mb-1 block text-[0.8rem] font-semibold text-ink">
                Add an image from a link
              </label>
              <div className="flex gap-2">
                <input
                  id="image-link"
                  type="url"
                  inputMode="url"
                  value={link}
                  onChange={(ev) => setLink(ev.target.value)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter") {
                      ev.preventDefault(); // don't submit the product form
                      addFromLink();
                    }
                  }}
                  placeholder="https://… (right-click a picture → Copy image address)"
                  className={inputClass}
                />
                <button type="button" onClick={addFromLink} disabled={!link.trim() || busyNow} className={cn(ghostButtonClass, "h-10 shrink-0")}>
                  Add
                </button>
              </div>
              <p className="mt-1 text-[0.72rem] text-slate">Use images you&rsquo;re allowed to use (e.g. the manufacturer&rsquo;s product photos). The image is copied into your media library.</p>
            </div>
            {pickerOpen && (
              <ul className="results-scroll mt-3 grid max-h-[320px] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-5">
                {library.map((m) => {
                  const on = imageIds.includes(m.id);
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => toggle(m.id)}
                        aria-pressed={on}
                        title={m.filename}
                        className={cn("relative block aspect-square w-full overflow-hidden rounded-lg border-2", on ? "border-blue" : "border-transparent hover:border-hair")}
                      >
                        <Image src={m.url} alt={m.alt} fill sizes="100px" className="object-cover" />
                        {on && <span className="absolute right-1 top-1 rounded bg-blue px-1 text-[0.62rem] font-bold text-white">{imageIds.indexOf(m.id) + 1}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Section>

        {/* duplicates also show here on phones, right under the photos */}
        <div className="xl:hidden">
          <DuplicatePanel matches={shownDuplicates} mustConfirm />
        </div>

        {/* ---------- 2. details ---------- */}
        <Section title={mode === "new" ? "2. Product details" : "Product details"}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <CategoryPicker categories={categories} value={category} onChange={setCategory} error={e.category_slug} highlight={filled.includes("Category")} />
            </div>
            <Field label="Product name *" error={e.name} hint="e.g. Deye 8kW Hybrid Inverter — brand, type and main rating" className="sm:col-span-2">
              <input name="name" defaultValue={initial.name} required maxLength={120} autoComplete="off" className={cn(inputClass, hl("Name"))} />
            </Field>
            <Field label="Brand" error={e.brand}>
              <input name="brand" list={brandList} defaultValue={initial.brand} maxLength={60} autoComplete="off" className={cn(inputClass, hl("Brand"))} />
              <datalist id={brandList}>
                {brands.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </Field>
            <Field label="Model number" error={e.model} hint="Exactly as on the label">
              <input name="model" defaultValue={initial.model} maxLength={60} autoComplete="off" className={cn(inputClass, hl("Model"))} />
            </Field>
            <Field label="SKU (your shop code)" error={e.sku} hint="Optional — must be unique">
              <input name="sku" defaultValue={initial.sku} maxLength={40} autoComplete="off" autoCapitalize="characters" className={inputClass} />
            </Field>
            <Field label="Barcode" error={e.barcode} hint="EAN/UPC digits under the bars — prevents listing the same item twice">
              <span className="flex gap-2">
                <input name="barcode" defaultValue={initial.barcode} inputMode="numeric" maxLength={20} autoComplete="off" className={cn(inputClass, hl("Barcode"))} />
                {hasBarcodeReader && (
                  <label className={cn(ghostButtonClass, "h-10 shrink-0 cursor-pointer")} title="Scan barcode with the camera">
                    Scan
                    <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(ev) => { scanBarcode(ev.target.files); ev.target.value = ""; }} />
                  </label>
                )}
              </span>
            </Field>
            {mode === "new" ? (
              <Field label="Web address" hint="Leave empty to create it from the name. Can't be changed later." error={e.slug} className="sm:col-span-2">
                <span className="flex items-center gap-1.5 text-[0.84rem] text-slate">
                  /product/
                  <input name="slug" defaultValue={initial.slug} placeholder="deye-8kw-hybrid-inverter" autoComplete="off" className={inputClass} />
                </span>
              </Field>
            ) : (
              <p className="text-[0.82rem] text-slate sm:col-span-2">
                Web address:{" "}
                <Link href={`/product/${initial.slug}`} target="_blank" className="font-semibold text-blue hover:underline">
                  /product/{initial.slug}
                </Link>
              </p>
            )}
          </div>
        </Section>

        {/* ---------- 3. details for this kind of product ---------- */}
        <Section
          id="details"
          title={`${mode === "new" ? "3. " : ""}${productType?.label ?? "Specifications"}`}
          intro={productType ? "Tap to choose, or type a number — the unit is added for you. Leave anything you don't know empty." : "Choose a category above and the right details for that product appear here."}
        >
          {productType && (
            <div className="grid gap-4 sm:grid-cols-2">
              {productType.fields.map((f) => (
                <DetailField key={`${productType.id}-${f.key}`} field={f} value={attrs[f.key] ?? ""} onChange={(v) => setAttr(f.key, v)} error={e[`attr_${f.key}`]} highlight={filled.includes(f.label)} />
              ))}
            </div>
          )}
          {productType?.id === "inverter" && (
            <div className="mt-4 rounded-xl bg-mist/60 p-4">
              <p className="text-[0.8rem] font-semibold text-ink">Datasheet values (used by the solar calculator)</p>
              <p className="mb-3 text-[0.74rem] text-slate">Copy from the manufacturer&rsquo;s datasheet or label. Leave empty if you&rsquo;re not sure — the calculator then asks the customer.</p>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Battery voltage">
                  <select name="inv_battery_v" defaultValue={initial.invBatteryV} className={cn(inputClass, hl("Battery voltage"))}>
                    <option value="">Not set</option>
                    <option value="12">12 V</option>
                    <option value="24">24 V</option>
                    <option value="48">48 V</option>
                  </select>
                </Field>
                <Field label="Max PV input (V)">
                  <input name="inv_max_pv_v" inputMode="numeric" defaultValue={initial.invMaxPv} className={cn(inputClass, hl("Max PV voltage"))} />
                </Field>
                <Field label="MPPT minimum (V)">
                  <input name="inv_mppt_min_v" inputMode="numeric" defaultValue={initial.invMpptMin} className={cn(inputClass, hl("MPPT minimum"))} />
                </Field>
              </div>
              {e.inverter_spec && <p className="mt-2 text-[0.78rem] text-red-dark">{e.inverter_spec}</p>}
            </div>
          )}
          <Field label="Key specs (chips on the product card)" hint="Optional — leave empty and they're made from the details above. Up to 8, separated by commas." error={e.specs} className="mt-5">
            <textarea name="specs" rows={2} defaultValue={initial.specs} className={cn(inputClass, "h-auto py-2", hl("Key specs"))} />
          </Field>
        </Section>

        {/* ---------- 4. price & stock ---------- */}
        <Section title={mode === "new" ? "4. Price & stock" : "Price & stock"}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price (₦) *" error={e.price_ngn}>
              <input name="price" inputMode="numeric" defaultValue={initial.price} required className={inputClass} />
            </Field>
            <Field label="Previous price (₦)" hint="Only for a genuine reduction — shows the product in Sale & Deals." error={e.compare_at_price_ngn}>
              <input name="compare_at_price" inputMode="numeric" defaultValue={initial.compareAt} className={inputClass} />
            </Field>
            <Field label="Availability" error={e.availability}>
              <select name="availability" defaultValue={initial.availability} className={inputClass}>
                <option value="">Not tracked — customer asks to confirm</option>
                <option value="in-stock">In stock</option>
                <option value="pre-order">Pre-order</option>
                <option value="out-of-stock">Out of stock</option>
              </select>
            </Field>
            <Field label="Units in stock" hint="Leave empty if you don't track stock. Orders can't exceed it when set." error={e.stock_quantity}>
              <input name="stock_quantity" inputMode="numeric" defaultValue={initial.stock} className={inputClass} />
            </Field>
          </div>
        </Section>

        {/* ---------- 5. description ---------- */}
        <Section title={mode === "new" ? "5. Description & search engines" : "Description & search engines"}>
          <Field label="Description" hint="Shown on the product page. Leave a blank line between paragraphs." error={e.description}>
            <textarea name="description" rows={6} maxLength={4000} defaultValue={initial.description} className={cn(inputClass, "h-auto py-2", hl("Description"))} />
          </Field>
          <details className="group mt-4">
            <summary className="cursor-pointer text-[0.84rem] font-semibold text-blue">Search engine title & description (optional)</summary>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field label="Search title" hint="Up to 70 characters. Empty = product name." error={e.seo_title}>
                <input name="seo_title" maxLength={70} defaultValue={initial.seoTitle} className={inputClass} />
              </Field>
              <Field label="Search description" hint="Up to 170 characters." error={e.seo_description}>
                <input name="seo_description" maxLength={170} defaultValue={initial.seoDescription} className={inputClass} />
              </Field>
            </div>
          </details>
        </Section>
      </div>

      {/* ---------- right column (desktop) ---------- */}
      <div className="space-y-4 xl:sticky xl:top-6">
        <section className="rounded-2xl border border-hair bg-white p-4 sm:p-5">
          <h2 className="font-heading text-[1rem] font-bold text-ink">Publish</h2>
          {isSample && <p className="mt-2 rounded-lg bg-gold/15 px-3 py-2 text-[0.78rem] text-ink">This is a starter sample product.</p>}
          <label className="mt-3 flex items-center gap-2.5 text-[0.88rem] font-semibold text-ink">
            <input type="checkbox" name="published" defaultChecked={initial.published} className="size-4 accent-[var(--color-blue)]" /> Live in the shop
          </label>
          <p className="ml-6 text-[0.74rem] text-slate">Untick to keep it as a draft.</p>
          <label className="mt-3 flex items-center gap-2.5 text-[0.88rem] font-semibold text-ink">
            <input type="checkbox" name="featured" defaultChecked={initial.featured} className="size-4 accent-[var(--color-blue)]" /> Featured on the homepage
          </label>
          <button type="submit" disabled={busyNow} className={`${buttonClass} mt-5 hidden h-11 w-full xl:inline-flex`}>
            {pending ? "Saving…" : mode === "new" ? "Add product" : "Save changes"}
          </button>
        </section>
        <div className="hidden xl:block">
          <DuplicatePanel matches={shownDuplicates} mustConfirm />
        </div>
      </div>

      {/* ---------- save bar (phones & tablets) ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hair bg-white/95 px-4 py-3 backdrop-blur xl:hidden">
        <button type="submit" disabled={busyNow} className={`${buttonClass} h-12 w-full text-[0.95rem]`}>
          {pending ? "Saving…" : busy ? busy : mode === "new" ? "Add product" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
