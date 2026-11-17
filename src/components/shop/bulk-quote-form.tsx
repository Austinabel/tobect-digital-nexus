"use client";

import { useId, useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { useCatalog } from "@/components/catalog-provider";
import { findProduct } from "@/lib/catalog";
import { findKit } from "@/lib/data/kits";
import { useSiteLinks } from "@/components/site-provider";
import { IconWhatsApp, IconMail, IconInfo, IconPlus, IconTrash, IconCart } from "@/components/icons";
import { saveQuoteRequest } from "@/app/(marketing)/quote/actions";

const CUSTOMER_TYPES = ["Solar installer", "Electrical contractor", "Dealer / reseller", "Commercial / industrial", "Other"] as const;
const MAX_ROWS = 30;

const input =
  "h-12 w-full rounded-xl border border-hair bg-white px-3.5 text-[0.95rem] text-ink outline-none transition-colors focus:border-blue focus:ring-3 focus:ring-blue/15 aria-invalid:border-red";
const labelText = "mb-1.5 block text-[0.82rem] font-semibold text-ink";

interface Row {
  id: number;
  product: string;
  quantity: string;
}

/**
 * Bulk / commercial quotation request with any number of product lines.
 * Until the quotations inbox exists (see supabase/migrations), a valid
 * request is handed to WhatsApp or email, fully written out.
 */
export function BulkQuoteForm() {
  const { whatsappHref, mailtoHref } = useSiteLinks();
  const catalog = useCatalog();
  const getProduct = (slug: string) => findProduct(catalog, slug);
  const listId = useId();
  const { lines } = useCart();
  const [v, setV] = useState({ name: "", business: "", phone: "", email: "", type: "Solar installer", location: "", project: "" });
  const [rows, setRows] = useState<Row[]>([{ id: 1, product: "", quantity: "" }]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [composed, setComposed] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [trap, setTrap] = useState("");

  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((s) => ({ ...s, [k]: e.target.value }));
  const setRow = (id: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const nextId = () => Math.max(0, ...rows.map((r) => r.id)) + 1;

  const filledRows = rows.filter((r) => r.product.trim());

  function importCart() {
    const fromCart = lines.flatMap((l) => {
      const name = l.kit ? findKit(catalog.kits, l.slug)?.name : getProduct(l.slug)?.name;
      return name ? [{ product: name, quantity: String(l.quantity) }] : [];
    });
    if (!fromCart.length) return;
    let id = nextId();
    setRows([...filledRows, ...fromCart.map((r) => ({ ...r, id: id++ }))].slice(0, MAX_ROWS));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (v.name.trim().length < 2) e.name = "Please enter your name.";
    if (v.phone.replace(/\D/g, "").length < 10) e.phone = "Please enter a valid phone number.";
    if (v.email && !/^\S+@\S+\.\S+$/.test(v.email)) e.email = "That email address doesn't look right.";
    if (!v.location.trim()) e.location = "Please enter the delivery location.";
    if (!filledRows.length) e.items = "Add at least one product.";
    for (const r of filledRows) {
      const q = Number(r.quantity);
      if (!Number.isInteger(q) || q < 1 || q > 100_000) e[`qty-${r.id}`] = "Enter a whole number.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function compose() {
    return [
      "BULK / COMMERCIAL QUOTE REQUEST — tobecat.com",
      "",
      `Name: ${v.name.trim()}`,
      ...(v.business.trim() ? [`Business: ${v.business.trim()}`] : []),
      `Customer type: ${v.type}`,
      `Phone: ${v.phone.trim()}`,
      ...(v.email.trim() ? [`Email: ${v.email.trim()}`] : []),
      `Delivery location: ${v.location.trim()}`,
      "",
      "Products required:",
      ...filledRows.map((r) => `- ${r.quantity} × ${r.product.trim()}`),
      ...(v.project.trim() ? ["", "Project description:", v.project.trim()] : []),
    ].join("\n");
  }

  /** Save for the admin inbox (alongside WhatsApp/email — never blocks them). */
  function store() {
    saveQuoteRequest({
      kind: "bulk",
      name: v.name,
      phone: v.phone,
      email: v.email,
      location: v.location,
      customerType: v.type,
      businessName: v.business,
      message: v.project,
      items: filledRows.map((r) => ({ product: r.product.trim(), quantity: Number(r.quantity) })),
      website: trap,
    })
      .then((r) => setSaved(r.reference ?? null))
      .catch(() => {});
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) {
      e.currentTarget.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    const text = compose();
    setComposed(text);
    window.open(whatsappHref(text), "_blank", "noopener,noreferrer");
    store();
  }

  const field = (k: "name" | "business" | "phone" | "email" | "location", label: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <span className={labelText}>{label}</span>
      <input value={v[k]} onChange={set(k)} aria-invalid={Boolean(errors[k])} aria-describedby={errors[k] ? `err-${k}` : undefined} className={input} {...extra} />
      {errors[k] && (
        <span id={`err-${k}`} className="mt-1 block text-[0.78rem] text-red-dark">
          {errors[k]}
        </span>
      )}
    </label>
  );

  return (
    <form onSubmit={submit} noValidate className="relative rounded-3xl border border-hair bg-white p-5 shadow-[0_30px_60px_-40px_rgba(13,27,47,0.35)] sm:p-8">
      {/* spam trap: hidden from people, filled in by bots */}
      <input type="text" name="website" value={trap} onChange={(e) => setTrap(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <div className="grid gap-4 sm:grid-cols-2">
        {field("name", "Full name *", { autoComplete: "name" })}
        {field("business", "Business name", { autoComplete: "organization" })}
        {field("phone", "Phone / WhatsApp *", { type: "tel", inputMode: "tel", autoComplete: "tel" })}
        {field("email", "Email", { type: "email", autoComplete: "email" })}
      </div>

      <fieldset className="mt-5">
        <legend className={labelText}>You are a…</legend>
        <div className="flex flex-wrap gap-2">
          {CUSTOMER_TYPES.map((t) => (
            <label
              key={t}
              className={cn(
                "flex h-10 cursor-pointer items-center rounded-full border-[1.5px] px-4 font-heading text-[0.84rem] font-semibold transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-blue/25",
                v.type === t ? "border-blue bg-blue text-white" : "border-hair text-slate hover:border-blue",
              )}
            >
              <input type="radio" name="type" value={t} checked={v.type === t} onChange={set("type")} className="sr-only" />
              {t}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <legend className="font-heading text-[0.95rem] font-bold text-ink">Products required *</legend>
          {lines.length > 0 && (
            <button type="button" onClick={importCart} className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-blue hover:underline">
              <IconCart className="size-4" /> Add items from my cart
            </button>
          )}
        </div>
        <datalist id={listId}>
          {catalog.products.map((p) => (
            <option key={p.slug} value={p.name} />
          ))}
          {catalog.kits.map((k) => (
            <option key={k.slug} value={k.name} />
          ))}
        </datalist>
        <ul className="mt-3 space-y-2">
          {rows.map((r, i) => (
            <li key={r.id} className="grid grid-cols-[1fr_92px_40px] items-start gap-2">
              <label>
                <span className="sr-only">Product {i + 1}</span>
                <input list={listId} value={r.product} onChange={(e) => setRow(r.id, { product: e.target.value })} placeholder="Product, brand or model" className={input} />
              </label>
              <label>
                <span className="sr-only">Quantity for product {i + 1}</span>
                <input
                  value={r.quantity}
                  onChange={(e) => setRow(r.id, { quantity: e.target.value.replace(/\D/g, "") })}
                  inputMode="numeric"
                  placeholder="Qty"
                  aria-invalid={Boolean(errors[`qty-${r.id}`])}
                  className={cn(input, "text-center tabular-nums")}
                />
              </label>
              <button
                type="button"
                onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((x) => x.id !== r.id) : [{ id: r.id, product: "", quantity: "" }]))}
                aria-label={`Remove product ${i + 1}`}
                className="grid size-12 place-items-center rounded-xl text-slate hover:bg-field hover:text-red"
              >
                <IconTrash className="size-4" />
              </button>
            </li>
          ))}
        </ul>
        {errors.items && <p className="mt-1.5 text-[0.78rem] text-red-dark">{errors.items}</p>}
        {Object.keys(errors).some((k) => k.startsWith("qty-")) && <p className="mt-1.5 text-[0.78rem] text-red-dark">Each product needs a quantity (whole number).</p>}
        {rows.length < MAX_ROWS && (
          <button
            type="button"
            onClick={() => setRows((rs) => [...rs, { id: nextId(), product: "", quantity: "" }])}
            className="mt-2.5 inline-flex h-10 items-center gap-1.5 rounded-full border-[1.5px] border-dashed border-[#c9d8f2] px-4 font-heading text-[0.84rem] font-semibold text-blue hover:border-blue"
          >
            <IconPlus className="size-4" /> Add another product
          </button>
        )}
      </fieldset>

      <div className="mt-6 grid gap-4">
        {field("location", "Delivery location (city / state) *", { autoComplete: "address-level2", placeholder: "e.g. Ikeja, Lagos" })}
        <label className="block">
          <span className={labelText}>Project description</span>
          <textarea
            value={v.project}
            onChange={set("project")}
            rows={4}
            placeholder="Site type, timeline, installation needs, anything that helps us price accurately"
            className="w-full rounded-xl border border-hair bg-white px-3.5 py-3 text-[0.92rem] text-ink outline-none focus:border-blue focus:ring-3 focus:ring-blue/15"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-whatsapp px-7 font-heading text-[0.95rem] font-semibold text-white transition-transform hover:-translate-y-0.5">
          <IconWhatsApp className="size-[18px]" /> Send Bulk Request on WhatsApp
        </button>
        <button
          type="button"
          onClick={() => {
            if (!validate()) return;
            const text = compose();
            setComposed(text);
            store();
            window.location.href = mailtoHref(`Bulk quote request — ${v.business.trim() || v.name.trim()}`, text);
          }}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#c9d8f2] px-7 font-heading text-[0.92rem] font-semibold text-blue transition-colors hover:border-blue"
        >
          <IconMail className="size-4" /> Send by Email Instead
        </button>
      </div>
      <p className="mt-4 flex gap-2 text-[0.78rem] leading-snug text-slate">
        <IconInfo className="mt-px size-4 shrink-0" />
        Your request opens in WhatsApp (or your email app) ready to send, and we keep a copy for our sales team. Trade pricing is shared directly with you.
      </p>
      {composed && (
        <div role="status" className="mt-4 rounded-xl border border-[#bfe4cd] bg-[#effaf3] px-4 py-3 text-[0.86rem] text-[#17733b]">
          Your request is ready. If WhatsApp didn&rsquo;t open,{" "}
          <a href={whatsappHref(composed)} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
            tap here to send it
          </a>
          .
          {saved && <span className="mt-1 block font-semibold">Saved as {saved} — our team has a copy too.</span>}
        </div>
      )}
    </form>
  );
}
