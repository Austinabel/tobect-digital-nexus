"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ghostButtonClass } from "@/components/admin/admin-ui";
import { uploadMedia } from "@/app/admin/(panel)/media/actions";

export interface PickerImage {
  id: string;
  url: string;
  alt: string;
  filename: string;
}


/**
 * One image from the media library, submitted as its public URL in a hidden
 * input called `name`. Staff with the media permission can upload a new one
 * in place; it goes into the library like any other upload.
 */
export function ImagePicker({
  name,
  label,
  initialUrl,
  library: initialLibrary,
  canUpload,
  aspect = "aspect-[16/9]",
  focus,
  onChange,
  error,
  hint,
}: {
  name: string;
  label: string;
  initialUrl?: string | null;
  library: PickerImage[];
  canUpload: boolean;
  aspect?: string;
  /** preview the focal point the form currently has selected */
  focus?: string;
  onChange?: (img: PickerImage | null) => void;
  error?: string;
  hint?: string;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [library, setLibrary] = useState(initialLibrary);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const current = library.find((m) => m.url === url);

  const choose = (img: PickerImage | null) => {
    setUrl(img?.url ?? "");
    onChange?.(img);
    setOpen(false);
  };

  const upload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg(null);
    const fd = new FormData();
    fd.append("files", file);
    try {
      const res = await uploadMedia(undefined, fd);
      const img = res?.created?.[0];
      if (img) {
        setLibrary((l) => [img, ...l]);
        choose(img);
        setMsg("Uploaded to the media library. Add a credit there if the photo isn't yours.");
      } else setMsg(res?.errors?.join(" ") ?? "Upload failed — please try again.");
    } catch {
      setMsg("Upload failed — please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="mb-1 block text-[0.8rem] font-semibold text-ink">{label}</span>
      <input type="hidden" name={name} value={url} />
      <div className={cn("relative overflow-hidden rounded-xl border border-hair bg-field", aspect)}>
        {url ? (
          <Image src={url} alt={current?.alt ?? ""} fill sizes="360px" className="object-cover" style={{ objectPosition: focus || "50% 50%" }} />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-[0.8rem] text-slate">No image</span>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={() => setOpen((o) => !o)} className={ghostButtonClass} aria-expanded={open}>
          {open ? "Close library" : url ? "Change" : "Choose from library"}
        </button>
        {canUpload && (
          <label className={cn(ghostButtonClass, "cursor-pointer")}>
            {busy ? "Uploading…" : "Upload new"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" disabled={busy} onChange={(e) => upload(e.target.files)} />
          </label>
        )}
        {url && (
          <button type="button" onClick={() => choose(null)} className={cn(ghostButtonClass, "hover:border-red hover:text-red")}>
            Remove
          </button>
        )}
      </div>
      {error ? <p className="mt-1 text-[0.78rem] text-red-dark">{error}</p> : hint ? <p className="mt-1 text-[0.74rem] text-slate">{hint}</p> : null}
      {msg && <p className="mt-1 text-[0.76rem] text-slate">{msg}</p>}
      {open && (
        <ul className="results-scroll mt-2 grid max-h-[300px] grid-cols-3 gap-2 overflow-y-auto pr-1">
          {library.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => choose(m)}
                title={m.filename}
                aria-label={`Use ${m.filename}`}
                aria-pressed={m.url === url}
                className={cn("relative block aspect-square w-full overflow-hidden rounded-lg border-2", m.url === url ? "border-blue" : "border-transparent hover:border-hair")}
              >
                <Image src={m.url} alt={m.alt} fill sizes="100px" className="object-cover" />
              </button>
            </li>
          ))}
          {!library.length && <li className="col-span-3 text-[0.8rem] text-slate">The media library is empty.</li>}
        </ul>
      )}
    </div>
  );
}
