"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { buttonClass, ghostButtonClass, inputClass } from "@/components/admin/admin-ui";
import { formatNaira } from "@/lib/data/products";
import { detailsFromTitle, jijiLinksIn } from "@/lib/admin/jiji-import";
import { PRODUCT_TYPES, productTypeFor } from "@/lib/shop/product-fields";
import { importBatch, type BatchResult } from "../actions";
import { readJijiListings, readJijiSellerPage, type JijiRow } from "./actions";

type Category = { slug: string; name: string; parent: string | null };

/** A listing in the review list, with the staff's choices. */
interface Item extends JijiRow {
  key: number;
  include: boolean;
  category: string;
  priceText: string;
  /** another listing in this import has the same title */
  repeatOf?: string;
}

const READ_BATCH = 5;
const IMPORT_BATCH = 3;
const MAX_SELLER_PAGES = 30;

const BADGE: Record<string, { label: string; cls: string }> = {
  ready: { label: "Ready", cls: "bg-[#e6f6ec] text-[#17733b]" },
  "needs-category": { label: "Choose a category", cls: "bg-gold/25 text-ink" },
  "needs-price": { label: "Add a price", cls: "bg-gold/25 text-ink" },
  "possible-duplicate": { label: "Possibly in shop", cls: "bg-gold/25 text-ink" },
  duplicate: { label: "Already in shop", cls: "bg-field text-slate" },
  repeat: { label: "Repeated advert", cls: "bg-field text-slate" },
  service: { label: "Not a product", cls: "bg-field text-slate" },
  unreadable: { label: "Couldn't read", cls: "bg-red/10 text-red-dark" },
};

function stateOf(it: Item): keyof typeof BADGE {
  if (it.status === "unreadable" || it.status === "service" || it.status === "duplicate") return it.status;
  if (it.repeatOf) return "repeat";
  if (!it.category) return "needs-category";
  if (!(Number(it.priceText.replace(/[,\s₦]/g, "")) > 0)) return "needs-price";
  return it.status === "possible-duplicate" ? "possible-duplicate" : "ready";
}
const importable = (it: Item) => ["ready", "possible-duplicate"].includes(stateOf(it));

/** Details shown under the title, e.g. "48 V · 15 kWh · Lithium". */
function detailSummary(fields: Record<string, string>, category: string, categories: Category[]): string {
  const c = categories.find((x) => x.slug === category);
  const type = productTypeFor(category, c?.parent);
  return type.fields
    .filter((f) => fields[`attr_${f.key}`])
    .map((f) => `${fields[`attr_${f.key}`]}${f.kind === "number" && f.unit ? ` ${f.unit}` : ""}`)
    .join(" · ");
}

export function JijiImportClient({ categories, canAddImages }: { categories: Category[]; canAddImages: boolean }) {
  const [text, setText] = useState("");
  const [publish, setPublish] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "import" | "attention" | "skip">("all");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [results, setResults] = useState<BatchResult[] | null>(null);
  const stop = useRef(false);

  const typeOfCategory = (slug: string) => productTypeFor(slug, categories.find((c) => c.slug === slug)?.parent).id;

  /* ---------------- step 1: find & read listings ---------------- */
  const find = async () => {
    setError(null);
    const { links, ignored } = jijiLinksIn(text);
    if (!links.length) {
      setError(ignored.length ? "Those aren't Jiji links. Open your advert (or your shop page) on jiji.ng and copy the address." : "Paste at least one Jiji link.");
      return;
    }
    stop.current = false;
    setItems([]);
    setResults(null);
    const urls: string[] = [];
    try {
      for (const l of links) {
        if (l.kind === "listing") {
          if (!urls.includes(l.url)) urls.push(l.url);
          continue;
        }
        for (let page = 1; page <= MAX_SELLER_PAGES && !stop.current; page++) {
          setBusy(`Reading your Jiji shop… page ${page} (${urls.length} adverts so far)`);
          const got = await readJijiSellerPage(l.url, page);
          if ("error" in got) {
            if (page === 1) throw new Error(got.error);
            break;
          }
          const fresh = got.links.filter((u) => !urls.includes(u));
          if (!fresh.length) break;
          urls.push(...fresh);
        }
      }
      const read: Item[] = [];
      for (let i = 0; i < urls.length && !stop.current; i += READ_BATCH) {
        setBusy(`Reading adverts… ${Math.min(i + READ_BATCH, urls.length)} of ${urls.length}`);
        const rows = await readJijiListings(urls.slice(i, i + READ_BATCH));
        for (const r of rows) {
          const seen = read.find((x) => x.title && x.title.toLowerCase() === r.title.toLowerCase());
          const it: Item = { ...r, key: read.length, category: r.fields.category ?? "", priceText: r.price ? String(r.price) : "", include: false, repeatOf: seen?.title };
          it.include = stateOf(it) === "ready";
          read.push(it);
        }
        setItems([...read]);
      }
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Couldn't reach Jiji — check the link and try again.");
    } finally {
      setBusy(null);
    }
  };

  const update = (key: number, change: (it: Item) => Partial<Item>) =>
    setItems((list) =>
      list.map((it) => {
        if (it.key !== key) return it;
        const next = { ...it, ...change(it) };
        const wasOk = importable(it);
        // fixing a row (category / price) ticks it; breaking one unticks it
        if (importable(next) !== wasOk) next.include = importable(next) && next.status !== "possible-duplicate";
        return next;
      }),
    );

  const changeCategory = (it: Item, slug: string): Partial<Item> => {
    // details belong to the product type: read them again from the title for the new category
    const kept = Object.fromEntries(Object.entries(it.fields).filter(([k]) => !k.startsWith("attr_") && k !== "inv_battery_v"));
    const cond = it.fields.attr_condition;
    const fields = { ...kept, category: slug, ...(slug ? detailsFromTitle(typeOfCategory(slug), it.title) : {}), ...(cond ? { attr_condition: cond } : {}) };
    return { category: slug, fields };
  };

  /* ---------------- step 2: import ---------------- */
  const chosen = items.filter((it) => it.include && importable(it));
  const run = async () => {
    if (!chosen.length) return;
    setProgress({ done: 0, total: chosen.length });
    const all: BatchResult[] = [];
    const payload = (it: Item) => ({
      line: it.key + 1,
      fields: { ...it.fields, category: it.category, price: it.priceText.replace(/[,\s₦]/g, ""), published: publish ? "on" : "" },
      imageUrls: canAddImages ? it.imageUrls : [],
    });
    // possible duplicates were ticked one by one, so the server is told to let those through
    const groups = [chosen.filter((it) => it.status !== "possible-duplicate"), chosen.filter((it) => it.status === "possible-duplicate")];
    let done = 0;
    for (const [g, group] of groups.entries()) {
      for (let i = 0; i < group.length; i += IMPORT_BATCH) {
        const slice = group.slice(i, i + IMPORT_BATCH);
        try {
          all.push(...(await importBatch(slice.map(payload), { includePossible: g === 1 })));
        } catch {
          all.push(...slice.map((it) => ({ line: it.key + 1, name: it.title, status: "failed" as const, message: "Connection problem — not imported. Run the import again; products already added are skipped.", imageNotes: [] })));
        }
        done += slice.length;
        setProgress({ done, total: chosen.length });
      }
    }
    setResults(all);
    setProgress(null);
  };

  const counts = useMemo(() => {
    const c = { all: items.length, import: 0, attention: 0, skip: 0 };
    for (const it of items) {
      const s = stateOf(it);
      if (it.include && importable(it)) c.import++;
      else if (s === "needs-category" || s === "needs-price" || s === "possible-duplicate") c.attention++;
      else c.skip++;
    }
    return c;
  }, [items]);
  const shown = items.filter((it) => {
    if (filter === "all") return true;
    const s = stateOf(it);
    if (filter === "import") return it.include && importable(it);
    if (filter === "attention") return !(it.include && importable(it)) && (s === "needs-category" || s === "needs-price" || s === "possible-duplicate");
    return !(it.include && importable(it)) && !(s === "needs-category" || s === "needs-price" || s === "possible-duplicate");
  });

  /* ---------------- results ---------------- */
  if (results) {
    const ok = results.filter((r) => r.status === "imported");
    return (
      <div className="space-y-4">
        <div role="status" className="rounded-2xl border border-[#bfe4cd] bg-[#effaf3] p-5">
          <p className="font-heading text-[1.1rem] font-bold text-[#17733b]">
            {ok.length} product{ok.length === 1 ? "" : "s"} imported from Jiji
          </p>
          <p className="text-[0.86rem] text-ink">
            {results.length - ok.length > 0 && `${results.length - ok.length} not imported (see below). `}
            {publish ? "They're live in the shop." : "They were saved as drafts — open each one, check the details, then switch it live."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={publish ? "/admin/products" : "/admin/products?status=draft"} className={buttonClass}>
              View products
            </Link>
            <button type="button" onClick={() => { setResults(null); setItems([]); }} className={ghostButtonClass}>
              Import more
            </button>
          </div>
        </div>
        <ul className="divide-y divide-hair rounded-2xl border border-hair bg-white">
          {results.map((r) => (
            <li key={`${r.line}-${r.slug ?? r.name}`} className="px-4 py-2.5 text-[0.86rem]">
              {r.slug ? (
                <Link href={`/admin/products/${r.slug}`} className="font-semibold text-blue hover:underline">
                  {r.name}
                </Link>
              ) : (
                <span className="font-semibold text-ink">{r.name || "—"}</span>
              )}
              <span className={cn("ml-2", r.status === "imported" ? "text-[#17733b]" : r.status === "failed" ? "text-red-dark" : "text-slate")}>{r.message}</span>
              {r.imageNotes.map((n) => (
                <span key={n} className="block text-[0.76rem] text-[#8a5a00]">
                  Photo: {n}
                </span>
              ))}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ---------------- paste links ---------------- */}
      <section className="rounded-2xl border border-hair bg-white p-4 sm:p-5">
        <h2 className="font-heading text-[1rem] font-bold text-ink">1. Paste your Jiji links</h2>
        <p className="mt-1 text-[0.86rem] text-slate">
          One advert per line, or your <strong>shop page</strong> link (on Jiji: open your profile → Share) to bring in all your adverts.
        </p>
        <label htmlFor="jiji-links" className="sr-only">
          Jiji links
        </label>
        <textarea
          id="jiji-links"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder={"https://jiji.ng/lagos/power-equipments/…html\nhttps://jiji.ng/sellerpage-…"}
          className={cn(inputClass, "mt-3 h-auto py-2.5 font-mono text-[14px] sm:text-[0.82rem]")}
        />
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-[0.86rem] font-semibold text-ink">
            <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} className="size-5 accent-[var(--color-blue)]" />
            Make them live straight away
          </label>
          {busy ? (
            <button type="button" onClick={() => (stop.current = true)} className={cn(ghostButtonClass, "h-11 sm:ml-auto")}>
              Stop
            </button>
          ) : (
            <button type="button" onClick={find} disabled={!text.trim()} className={cn(buttonClass, "h-11 sm:ml-auto")}>
              Find products
            </button>
          )}
        </div>
        <p className="mt-2 text-[0.76rem] text-slate">Unticked = saved as drafts so you can check them first. Only import your own adverts and photos.</p>
        {!canAddImages && <p className="mt-1 text-[0.76rem] text-[#8a5a00]">Your role can&rsquo;t add images to the media library, so photos will be skipped.</p>}
        {busy && (
          <p role="status" aria-live="polite" className="mt-3 flex items-center gap-2 text-[0.86rem] font-semibold text-blue">
            <span className="size-4 animate-spin rounded-full border-2 border-blue/30 border-t-blue" aria-hidden />
            {busy}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-3 rounded-xl border border-red/30 bg-red/5 px-4 py-3 text-[0.86rem] text-red-dark">
            {error}
          </p>
        )}
      </section>

      {/* ---------------- review ---------------- */}
      {items.length > 0 && (
        <section className="rounded-2xl border border-hair bg-white p-3 sm:p-5">
          <h2 className="px-1 font-heading text-[1rem] font-bold text-ink">2. Check and import</h2>
          <p className="mt-1 px-1 text-[0.82rem] text-slate">Change a category or price if needed. Details like volts, kWh and wattage were read from each title — you can add the rest after importing.</p>
          <nav aria-label="Filter adverts" className="mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {(
              [
                ["all", "All"],
                ["import", "To import"],
                ["attention", "Needs you"],
                ["skip", "Skipped"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => setFilter(k)}
                aria-pressed={filter === k}
                className={cn("h-9 shrink-0 rounded-full border px-3.5 text-[0.82rem] font-semibold", filter === k ? "border-blue bg-blue text-white" : "border-hair bg-white text-slate hover:border-blue")}
              >
                {label} · {counts[k]}
              </button>
            ))}
          </nav>

          <ul className="mt-2 divide-y divide-hair">
            {shown.map((it) => {
              const s = stateOf(it);
              const canPick = importable(it);
              const summary = it.category ? detailSummary(it.fields, it.category, categories) : "";
              return (
                <li key={it.key} className={cn("flex gap-3 px-1 py-3", !canPick && "opacity-75")}>
                  <label className="flex shrink-0 cursor-pointer flex-col items-center gap-2 pt-0.5">
                    <input
                      type="checkbox"
                      checked={it.include && canPick}
                      disabled={!canPick}
                      onChange={(e) => update(it.key, () => ({ include: e.target.checked }))}
                      aria-label={`Import ${it.title || "this advert"}`}
                      className="size-5 accent-[var(--color-blue)]"
                    />
                    {it.imageUrls[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element -- a preview of the Jiji photo before it is downloaded
                      <img src={it.imageUrls[0]} alt="" referrerPolicy="no-referrer" loading="lazy" className="size-16 rounded-lg border border-hair object-cover" />
                    ) : (
                      <span className="size-16 rounded-lg bg-field" aria-hidden />
                    )}
                  </label>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className={cn("rounded-md px-2 py-0.5 text-[0.7rem] font-bold", BADGE[s].cls)}>{BADGE[s].label}</span>
                      <a href={it.url} target="_blank" rel="noopener noreferrer" className="text-[0.74rem] font-semibold text-blue hover:underline">
                        Jiji ↗
                      </a>
                    </p>
                    <p className="mt-1 font-heading text-[0.92rem] font-semibold leading-snug text-ink">{it.title || it.url}</p>
                    {summary && <p className="mt-0.5 text-[0.78rem] text-slate">{summary}</p>}
                    {(it.message || it.repeatOf) && <p className="mt-0.5 text-[0.78rem] text-slate">{it.repeatOf ? "Same title as another advert above — only one is imported." : it.message}</p>}
                    {it.duplicateOf && (
                      <Link href={`/admin/products/${it.duplicateOf.slug}`} target="_blank" className="text-[0.76rem] font-semibold text-blue hover:underline">
                        Open “{it.duplicateOf.name}” ↗
                      </Link>
                    )}
                    {it.status !== "unreadable" && it.status !== "service" && it.status !== "duplicate" && !it.repeatOf && (
                      <div className="mt-2 grid grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] gap-2">
                        <label className="block min-w-0">
                          <span className="sr-only">Category</span>
                          <select
                            value={it.category}
                            onChange={(e) => update(it.key, (x) => changeCategory(x, e.target.value))}
                            className={cn(inputClass, "cursor-pointer px-2", !it.category && "border-gold")}
                          >
                            <option value="">Category…</option>
                            {categories.map((c) => (
                              <option key={c.slug} value={c.slug}>
                                {c.parent ? `${categories.find((p) => p.slug === c.parent)?.name ?? c.parent} › ` : ""}
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="relative block min-w-0">
                          <span className="sr-only">Price in naira</span>
                          <span aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[0.86rem] text-slate">
                            ₦
                          </span>
                          <input
                            inputMode="numeric"
                            value={it.priceText}
                            onChange={(e) => update(it.key, () => ({ priceText: e.target.value }))}
                            placeholder="Price"
                            className={cn(inputClass, "pl-6", s === "needs-price" && "border-gold")}
                          />
                        </label>
                      </div>
                    )}
                    {it.priceText && Number(it.priceText.replace(/[,\s₦]/g, "")) > 0 && it.status !== "duplicate" && (
                      <p className="mt-1 text-[0.74rem] text-slate">
                        {formatNaira(Number(it.priceText.replace(/[,\s₦]/g, "")))} · {it.imageUrls.length} photo{it.imageUrls.length === 1 ? "" : "s"}
                        {it.typeId === null && it.category ? ` · ${PRODUCT_TYPES[typeOfCategory(it.category)]?.label ?? ""}` : ""}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="sticky bottom-0 -mx-3 mt-2 border-t border-hair bg-white/95 px-3 py-3 backdrop-blur sm:-mx-5 sm:px-5">
            {progress ? (
              <div role="status" aria-live="polite">
                <p className="text-[0.86rem] font-semibold text-ink">
                  Importing… {progress.done} of {progress.total}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-field">
                  <div className="h-full rounded-full bg-blue transition-all" style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }} />
                </div>
                <p className="mt-1 text-[0.74rem] text-slate">Keep this page open — photos are being copied from Jiji.</p>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[0.84rem] text-ink">
                  <strong>{chosen.length}</strong> of {items.length} ticked{publish ? " · will go live" : " · saved as drafts"}
                </p>
                <button type="button" disabled={!chosen.length || Boolean(busy)} onClick={run} className={cn(buttonClass, "h-11 w-full sm:w-auto")}>
                  Import {chosen.length} product{chosen.length === 1 ? "" : "s"}
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
