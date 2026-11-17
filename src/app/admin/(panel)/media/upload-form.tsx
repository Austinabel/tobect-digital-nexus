"use client";

import { useActionState, useRef, useState } from "react";
import { buttonClass } from "@/components/admin/admin-ui";
import { uploadMedia } from "./actions";

export function UploadForm() {
  const [state, action, pending] = useActionState(uploadMedia, undefined);
  const [picked, setPicked] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await action(fd);
        formRef.current?.reset();
        setPicked([]);
      }}
      className="space-y-3"
    >
      <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[#c9d8f2] bg-mist/40 px-4 py-7 text-center hover:border-blue">
        <span className="font-heading text-[0.95rem] font-bold text-ink">Choose images to upload</span>
        <span className="text-[0.78rem] text-slate">JPEG, PNG, WebP or AVIF · up to 5 MB each · up to 10 at a time</span>
        <input
          name="files"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          onChange={(e) => setPicked([...(e.target.files ?? [])].map((f) => f.name))}
        />
        {picked.length > 0 && <span className="mt-2 text-[0.82rem] font-semibold text-blue">{picked.length} selected: {picked.slice(0, 3).join(", ")}{picked.length > 3 ? "…" : ""}</span>}
      </label>
      <button type="submit" disabled={pending || picked.length === 0} className={buttonClass}>
        {pending ? "Uploading…" : "Upload"}
      </button>
      {state?.ok && <p role="status" className="rounded-xl border border-[#bfe4cd] bg-[#effaf3] px-3 py-2 text-[0.84rem] text-[#17733b]">{state.ok}</p>}
      {state?.errors && (
        <ul role="alert" className="space-y-1 rounded-xl border border-red/30 bg-red/5 px-3 py-2 text-[0.84rem] text-red-dark">
          {state.errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </form>
  );
}
