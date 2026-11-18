"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { buttonClass, ghostButtonClass } from "@/components/admin/admin-ui";
import { bulkUpdateProducts } from "./actions";

export const BULK_FORM_ID = "bulk-products";

const boxes = () => [...document.querySelectorAll<HTMLInputElement>(`input[type=checkbox][name=slug][form=${BULK_FORM_ID}]`)];

function Buttons({ count, status }: { count: number; status: string }) {
  const { pending } = useFormStatus();
  const off = pending || !count;
  return (
    <>
      {status !== "live" && (
        <button type="submit" name="bulk" value="publish" disabled={off} className={`${buttonClass} h-9 disabled:opacity-50`}>
          {pending ? "Working…" : "Publish"}
        </button>
      )}
      {status !== "draft" && (
        <button type="submit" name="bulk" value="draft" disabled={off} className={`${ghostButtonClass} disabled:opacity-50`}>
          Move to drafts
        </button>
      )}
      <button
        type="submit"
        name="bulk"
        value="trash"
        disabled={off}
        onClick={(e) => {
          if (!confirm(`Move ${count} product${count === 1 ? "" : "s"} to the trash? You can restore them later.`)) e.preventDefault();
        }}
        className={`${ghostButtonClass} hover:border-red hover:text-red disabled:opacity-50`}
      >
        Trash
      </button>
    </>
  );
}

/** Select-all, a count, and Publish / Move to drafts / Trash for the ticked rows of the product table. */
export function BulkBar({ status, total }: { status: string; total: number }) {
  const [count, setCount] = useState(0);
  const all = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sync = () => {
      const list = boxes();
      const n = list.filter((b) => b.checked).length;
      setCount(n);
      if (all.current) {
        all.current.checked = n > 0 && n === list.length;
        all.current.indeterminate = n > 0 && n < list.length;
      }
    };
    sync();
    document.addEventListener("change", sync);
    return () => document.removeEventListener("change", sync);
  }, []);

  return (
    <form id={BULK_FORM_ID} action={bulkUpdateProducts} className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-hair bg-white px-4 py-2.5">
      {status && <input type="hidden" name="status" value={status} />}
      <label className="mr-auto flex items-center gap-2 text-[0.85rem] font-semibold text-ink">
        <input
          ref={all}
          type="checkbox"
          className="size-4 accent-[var(--color-blue)]"
          onChange={(e) => {
            for (const b of boxes()) b.checked = e.target.checked;
            document.dispatchEvent(new Event("change"));
          }}
        />
        {count ? `${count} selected` : `Select all ${total}`}
      </label>
      <Buttons count={count} status={status} />
    </form>
  );
}
