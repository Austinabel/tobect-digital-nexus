"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { buttonClass, ghostButtonClass } from "@/components/admin/admin-ui";
import { formatNaira } from "@/lib/data/products";
import type { ImportRow, RowStatus } from "@/lib/admin/product-import";
import { importBatch, previewImport, type BatchResult, type PreviewState } from "./actions";

const BATCH = 10;

const STATUS: Record<RowStatus, { label: string; cls: string }> = {
  ready: { label: "Will be added", cls: "bg-[#e6f6ec] text-[#17733b]" },
  "possible-duplicate": { label: "Possible duplicate", cls: "bg-gold/20 text-ink" },
  duplicate: { label: "Already listed", cls: "bg-field text-slate" },
  error: { label: "Needs fixing", cls: "bg-red/10 text-red-dark" },
  skipped: { label: "Skipped", cls: "bg-field text-slate" },
};

export function ImportClient({
  canAddImages,
  columns,
  specColumns,
}: {
  canAddImages: boolean;
  columns: { label: string; help: string; required: boolean }[];
  specColumns: { key: string; label: string }[];
}) {
  const [file, setFile] = useState<File | null>(null);
  const [publish, setPublish] = useState(false);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [reading, setReading] = useState(false);
  const [filter, setFilter] = useState<RowStatus | "all">("all");
  const [includePossible, setIncludePossible] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [results, setResults] = useState<BatchResult[] | null>(null);

  const rows = preview?.rows ?? [];
  const count = (s: RowStatus) => rows.filter((r) => r.status === s).length;
  const toImport = rows.filter((r) => r.status === "ready" || (includePossible && r.status === "possible-duplicate"));
  const shown = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  const read = async () => {
    if (!file) return;
    setReading(true);
    setResults(null);
    setPreview(null);
    const fd = new FormData();
    fd.append("file", file);
    if (publish) fd.append("publish", "on");
    try {
      setPreview(await previewImport(fd));
    } catch {
      setPreview({ error: "The file couldn't be checked — please try again." });
    } finally {
      setReading(false);
      setFilter("all");
    }
  };

  const run = async () => {
    const list = toImport.map((r: ImportRow) => ({ line: r.line, fields: r.fields!, imageUrls: r.imageUrls }));
    if (!list.length) return;
    setProgress({ done: 0, total: list.length });
    const all: BatchResult[] = [];
    for (let i = 0; i < list.length; i += BATCH) {
      try {
        all.push(...(await importBatch(list.slice(i, i + BATCH), { includePossible })));
      } catch {
        all.push(...list.slice(i, i + BATCH).map((r) => ({ line: r.line, name: r.fields.name ?? "", status: "failed" as const, message: "Connection problem — this row wasn't imported. Import the file again to retry (already-added products are skipped).", imageNotes: [] })));
      }
      setProgress({ done: Math.min(i + BATCH, list.length), total: list.length });
    }
    setResults(all);
    setProgress(null);
  };

  /* ---------------- results ---------------- */
  if (results) {
    const ok = results.filter((r) => r.status === "imported");
    const notes = results.filter((r) => r.imageNotes.length);
    return (
      <div className="space-y-4">
        <div role="status" className="rounded-2xl border border-[#bfe4cd] bg-[#effaf3] p-5">
          <p className="font-heading text-[1.1rem] font-bold text-[#17733b]">
            {ok.length} product{ok.length === 1 ? "" : "s"} imported
          </p>
          <p className="text-[0.86rem] text-ink">
            {results.length - ok.length > 0 && `${results.length - ok.length} not imported (see below). `}
            {publish ? "They're live in the shop." : "They were saved as drafts — review them, then switch them live."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={publish ? "/admin/products" : "/admin/products?status=draft"} className={buttonClass}>
              View products
            </Link>
            <button type="button" onClick={() => { setResults(null); setPreview(null); setFile(null); }} className={ghostButtonClass}>
              Import another file
            </button>
          </div>
        </div>
        <ul className="divide-y divide-hair rounded-2xl border border-hair bg-white">
          {results.map((r) => (
            <li key={`${r.line}-${r.slug ?? r.name}`} className="px-4 py-2.5 text-[0.86rem]">
              <span className="mr-2 text-[0.74rem] text-slate-light">Row {r.line}</span>
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
        {notes.length > 0 && <p className="text-[0.8rem] text-slate">Products whose photos couldn&rsquo;t be downloaded were still added — open them to add photos.</p>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ---------------- step 1: template ---------------- */}
      <section className="rounded-2xl border border-hair bg-white p-4 sm:p-5">
        <h2 className="font-heading text-[1rem] font-bold text-ink">1. Prepare your file</h2>
        <p className="mt-1 text-[0.86rem] text-slate">
          Download the template, open it in Excel or Google Sheets, add one product per row, then save as <strong>.xlsx</strong> or <strong>.csv</strong>. Only <strong>name</strong>, <strong>category</strong> and <strong>price</strong> are required.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href="/admin/products/import/template.csv" download className={buttonClass}>
            Download template
          </a>
        </div>
        <details className="mt-3">
          <summary className="cursor-pointer text-[0.84rem] font-semibold text-blue">Column guide</summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-[0.8rem]">
              <tbody className="divide-y divide-hair">
                {columns.map((c) => (
                  <tr key={c.label}>
                    <td className="py-1.5 pr-3 font-mono font-semibold text-ink">
                      {c.label}
                      {c.required && <span className="text-red"> *</span>}
                    </td>
                    <td className="py-1.5 text-slate">{c.help}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-1.5 pr-3 font-mono font-semibold text-ink">filter columns</td>
                  <td className="py-1.5 text-slate">Shop filter values, by name: {specColumns.map((s) => s.key).join(", ")}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[0.76rem] text-slate">
            Categories can be written as a name (“Hybrid Inverters”) or “Parent &gt; Child”. Image links must be public addresses of the image itself (right-click a picture → Copy image address); only use images you have permission to use.
          </p>
        </details>
      </section>

      {/* ---------------- step 2: upload ---------------- */}
      <section className="rounded-2xl border border-hair bg-white p-4 sm:p-5">
        <h2 className="font-heading text-[1rem] font-bold text-ink">2. Upload and check</h2>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className={cn(ghostButtonClass, "h-11 cursor-pointer justify-start px-4 text-[0.9rem]")}>
            {file ? `📄 ${file.name}` : "Choose .xlsx or .csv file"}
            <input
              type="file"
              accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="sr-only"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setPreview(null);
              }}
            />
          </label>
          <label className="flex items-center gap-2 text-[0.86rem] font-semibold text-ink">
            <input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} className="size-4 accent-[var(--color-blue)]" />
            Make them live straight away
          </label>
          <button type="button" disabled={!file || reading} onClick={read} className={cn(buttonClass, "sm:ml-auto")}>
            {reading ? "Checking…" : "Check file"}
          </button>
        </div>
        <p className="mt-2 text-[0.76rem] text-slate">Unticked = products are saved as drafts so you can review them first (a “published” column in the file overrides this).</p>
        {!canAddImages && <p className="mt-1 text-[0.76rem] text-[#8a5a00]">Your role can&rsquo;t add images to the media library, so image links will be skipped.</p>}
        {preview?.error && (
          <p role="alert" className="mt-3 rounded-xl border border-red/30 bg-red/5 px-4 py-3 text-[0.86rem] text-red-dark">
            {preview.error}
          </p>
        )}
      </section>

      {/* ---------------- step 3: preview & import ---------------- */}
      {rows.length > 0 && (
        <section className="rounded-2xl border border-hair bg-white p-4 sm:p-5">
          <h2 className="font-heading text-[1rem] font-bold text-ink">3. Review and import</h2>
          {preview?.unknownHeaders?.length ? <p className="mt-1 text-[0.8rem] text-[#8a5a00]">Ignored columns (not recognised): {preview.unknownHeaders.join(", ")}</p> : null}
          <nav aria-label="Filter rows" className="mt-3 flex flex-wrap gap-1.5">
            {(["all", "ready", "possible-duplicate", "duplicate", "error", "skipped"] as const).map((s) => {
              const n = s === "all" ? rows.length : count(s);
              if (s !== "all" && !n) return null;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilter(s)}
                  aria-pressed={filter === s}
                  className={cn("rounded-full border px-3 py-1.5 text-[0.8rem] font-semibold", filter === s ? "border-blue bg-blue text-white" : "border-hair bg-white text-slate hover:border-blue")}
                >
                  {s === "all" ? "All rows" : STATUS[s].label} · {n}
                </button>
              );
            })}
          </nav>

          <ul className="results-scroll mt-3 max-h-[480px] divide-y divide-hair overflow-y-auto rounded-xl border border-hair">
            {shown.map((r) => (
              <li key={r.line} className="px-3 py-2.5 text-[0.84rem] sm:px-4">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[0.72rem] text-slate-light">Row {r.line}</span>
                  <span className={cn("rounded-md px-2 py-0.5 text-[0.7rem] font-bold", STATUS[r.status].cls)}>{STATUS[r.status].label}</span>
                  <span className="font-semibold text-ink">{r.name || "(no name)"}</span>
                  {r.value && <span className="text-slate">· {formatNaira(r.value.price_ngn)}</span>}
                  {r.imageUrls.length > 0 && <span className="text-slate">· {r.imageUrls.length} image link{r.imageUrls.length > 1 ? "s" : ""}</span>}
                </span>
                {r.messages.map((m) => (
                  <span key={m} className="mt-0.5 block text-[0.78rem] text-slate">
                    {m}
                  </span>
                ))}
                {r.duplicateOf && (
                  <Link href={`/admin/products/${r.duplicateOf.slug}`} target="_blank" className="mt-0.5 inline-block text-[0.76rem] font-semibold text-blue hover:underline">
                    Open “{r.duplicateOf.name}” ↗
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {count("possible-duplicate") > 0 && (
            <label className="mt-3 flex items-start gap-2 text-[0.86rem] text-ink">
              <input type="checkbox" checked={includePossible} onChange={(e) => setIncludePossible(e.target.checked)} className="mt-0.5 size-4 accent-[var(--color-blue)]" />
              <span>
                <strong>Also import possible duplicates</strong> ({count("possible-duplicate")}) — only if you&rsquo;ve checked they&rsquo;re different products.
              </span>
            </label>
          )}

          <div className="sticky bottom-0 -mx-4 mt-4 border-t border-hair bg-white/95 px-4 py-3 backdrop-blur sm:-mx-5 sm:px-5">
            {progress ? (
              <div role="status" aria-live="polite">
                <p className="text-[0.86rem] font-semibold text-ink">
                  Importing… {progress.done} of {progress.total}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-field">
                  <div className="h-full rounded-full bg-blue transition-all" style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }} />
                </div>
                <p className="mt-1 text-[0.74rem] text-slate">Keep this page open. Downloading photos can take a few seconds per product.</p>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[0.86rem] text-ink">
                  <strong>{toImport.length}</strong> product{toImport.length === 1 ? "" : "s"} will be imported{publish ? " and made live" : " as drafts"}.
                  {count("error") > 0 && ` Fix the ${count("error")} row${count("error") > 1 ? "s" : ""} marked “Needs fixing” in your file and check it again to include ${count("error") > 1 ? "them" : "it"}.`}
                </p>
                <button type="button" disabled={!toImport.length} onClick={run} className={cn(buttonClass, "h-11 w-full sm:w-auto")}>
                  Import {toImport.length} product{toImport.length === 1 ? "" : "s"}
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
