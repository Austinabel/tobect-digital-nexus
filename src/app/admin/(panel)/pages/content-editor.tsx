"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { buttonClass, ghostButtonClass, inputClass } from "@/components/admin/admin-ui";
import { ImagePicker, type PickerImage } from "@/components/admin/image-picker";
import { submitWithoutReset } from "@/components/admin/submit-without-reset";
import { CONTENT_SCHEMAS, type ContentKey, type ScalarField } from "@/lib/content";
import { savePageContent } from "./actions";

type Row = Record<string, unknown>;

function ScalarInput({
  f,
  value,
  onChange,
  error,
  path,
  library,
  canUpload,
}: {
  f: ScalarField;
  value: unknown;
  onChange: (v: unknown) => void;
  error?: string;
  path: string;
  library: PickerImage[];
  canUpload: boolean;
}) {
  if (f.kind === "id") return null;
  const id = `f-${path}`;
  const msg = error ? <span className="mt-1 block text-[0.78rem] text-red-dark">{error}</span> : f.hint ? <span className="mt-1 block text-[0.74rem] text-slate">{f.hint}</span> : null;
  if (f.kind === "image")
    return (
      <div className="max-w-[260px]">
        <ImagePicker name={`img-${path}`} label={f.label} initialUrl={String(value ?? "")} library={library} canUpload={canUpload} onChange={(img) => onChange(img?.url ?? "")} error={error} hint={f.hint} />
      </div>
    );
  if (f.kind === "checkbox")
    return (
      <label className="flex items-start gap-2 text-[0.86rem]">
        <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 size-4 accent-[var(--color-blue)]" />
        <span>
          {f.label}
          {f.required && " *"}
          {msg}
        </span>
      </label>
    );
  const common = { id, "aria-invalid": Boolean(error), className: cn(inputClass, error && "border-red") };
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-[0.8rem] font-semibold text-ink">
        {f.label}
        {f.required && " *"}
      </span>
      {f.kind === "textarea" || f.kind === "richtext" ? (
        <textarea
          {...common}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          rows={f.kind === "richtext" ? (f.max && f.max > 5000 ? 18 : 4) : 3}
          maxLength={f.max}
          className={cn(common.className, "h-auto py-2", f.kind === "richtext" && "font-mono text-[0.82rem] leading-relaxed")}
        />
      ) : f.kind === "number" ? (
        <input {...common} type="number" step={f.decimals ? "any" : 1} min={f.min} max={f.maxValue} value={value === null || value === undefined ? "" : String(value)} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...common} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} maxLength={f.max} />
      )}
      {msg}
    </label>
  );
}

/** Editor generated from the page's schema (src/lib/content.ts). Saves the whole page at once. */
export function ContentEditor({ contentKey, initial, library, canUpload }: { contentKey: ContentKey; initial: Row; library: PickerImage[]; canUpload: boolean }) {
  const schema = CONTENT_SCHEMAS[contentKey];
  const [state, action, pending] = useActionState(savePageContent, undefined);
  const [data, setData] = useState<Row>(initial);
  // stable keys for list rows so reordering doesn't mix up inputs
  const nextKey = useRef(1000);
  const [rowKeys, setRowKeys] = useState<Record<string, number[]>>(() =>
    Object.fromEntries(schema.fields.filter((f) => f.kind === "list").map((f) => [f.key, ((initial[f.key] as Row[]) ?? []).map((_, i) => i)])),
  );
  const e = state?.errors ?? {};
  const set = (k: string, v: unknown) => setData((d) => ({ ...d, [k]: v }));

  return (
    <form action={action} onSubmit={submitWithoutReset(action)} className="space-y-4">
      <input type="hidden" name="key" value={contentKey} />
      <input type="hidden" name="data" value={JSON.stringify(data)} />
      {state?.saved && (
        <p role="status" className="rounded-xl border border-[#bfe4cd] bg-[#effaf3] px-4 py-3 text-[0.88rem] text-[#17733b]">
          Saved.{" "}
          <Link href={schema.path} target="_blank" className="font-semibold underline">
            View the page ↗
          </Link>
        </p>
      )}
      {Object.keys(e).length > 0 && (
        <p role="alert" className="rounded-xl border border-red/30 bg-red/5 px-4 py-3 text-[0.88rem] text-red-dark">
          {e.form ?? "Please fix the highlighted fields."}
        </p>
      )}

      {schema.fields.map((f) => {
        if (f.kind !== "list")
          return (
            <section key={f.key} className="rounded-2xl border border-hair bg-white p-5">
              <ScalarInput f={f} value={data[f.key]} onChange={(v) => set(f.key, v)} error={e[f.key]} path={f.key} library={library} canUpload={canUpload} />
            </section>
          );
        const rows = (data[f.key] as Row[]) ?? [];
        const keys = rowKeys[f.key] ?? [];
        const update = (next: Row[], nextKeys: number[]) => {
          set(f.key, next);
          setRowKeys((k) => ({ ...k, [f.key]: nextKeys }));
        };
        const move = (i: number, d: -1 | 1) => {
          const j = i + d;
          const r = [...rows];
          const k = [...keys];
          [r[i], r[j]] = [r[j], r[i]];
          [k[i], k[j]] = [k[j], k[i]];
          update(r, k);
        };
        return (
          <section key={f.key} className="rounded-2xl border border-hair bg-white p-5">
            <h2 className="font-heading text-[1rem] font-bold text-ink">
              {f.label} <span className="font-body text-[0.8rem] font-normal text-slate">({rows.length}/{f.maxItems})</span>
            </h2>
            {f.hint && <p className="mt-0.5 text-[0.8rem] text-slate">{f.hint}</p>}
            {e[f.key] && <p className="mt-1 text-[0.78rem] text-red-dark">{e[f.key]}</p>}
            <ol className="mt-4 space-y-3">
              {rows.map((row, i) => (
                <li key={keys[i] ?? i} className="rounded-xl border border-hair bg-field/40 p-3.5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="font-heading text-[0.8rem] font-bold uppercase tracking-[0.08em] text-slate">
                      {f.itemLabel} {i + 1}
                    </span>
                    <span className="flex gap-1">
                      <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${f.itemLabel} ${i + 1} up`} className="grid size-8 place-items-center rounded-lg text-slate hover:bg-white disabled:opacity-30">
                        ↑
                      </button>
                      <button type="button" disabled={i === rows.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${f.itemLabel} ${i + 1} down`} className="grid size-8 place-items-center rounded-lg text-slate hover:bg-white disabled:opacity-30">
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => update(rows.filter((_, j) => j !== i), keys.filter((_, j) => j !== i))}
                        aria-label={`Remove ${f.itemLabel} ${i + 1}`}
                        className="rounded-lg px-2 text-[0.78rem] font-semibold text-slate hover:bg-white hover:text-red"
                      >
                        Remove
                      </button>
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {f.fields.filter((sf) => sf.kind !== "id").map((sf) => (
                      <div key={sf.key} className={cn((sf.kind === "textarea" || sf.kind === "richtext" || sf.kind === "checkbox") && "sm:col-span-2")}>
                        <ScalarInput
                          f={sf}
                          value={row[sf.key]}
                          onChange={(v) => update(rows.map((r, j) => (j === i ? { ...r, [sf.key]: v } : r)), keys)}
                          error={e[`${f.key}.${i}.${sf.key}`]}
                          path={`${f.key}.${keys[i] ?? i}.${sf.key}`}
                          library={library}
                          canUpload={canUpload}
                        />
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
            {rows.length < f.maxItems && (
              <button
                type="button"
                onClick={() => update([...rows, Object.fromEntries(f.fields.map((sf) => [sf.key, sf.kind === "checkbox" ? false : ""]))], [...keys, nextKey.current++])}
                className={cn(ghostButtonClass, "mt-3")}
              >
                + Add {f.itemLabel}
              </button>
            )}
          </section>
        );
      })}

      <div className="sticky bottom-0 -mx-1 flex justify-end bg-gradient-to-t from-field via-field/90 px-1 py-3">
        <button type="submit" disabled={pending} className={buttonClass}>
          {pending ? "Saving…" : "Save page"}
        </button>
      </div>
    </form>
  );
}
