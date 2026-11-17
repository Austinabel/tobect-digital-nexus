"use client";

import { useState } from "react";
import { inputClass } from "@/components/admin/admin-ui";
import { ImagePicker, type PickerImage } from "@/components/admin/image-picker";
import { FOCUS_OPTIONS } from "@/lib/admin/campaign-form";

export function AddSlideForm({ action, library, canUpload, submitClass }: { action: (fd: FormData) => Promise<void>; library: PickerImage[]; canUpload: boolean; submitClass: string }) {
  const [focus, setFocus] = useState("");
  const [alt, setAlt] = useState("");
  return (
    <form action={action} className="space-y-3">
      <ImagePicker name="image_url" label="Photo *" library={library} canUpload={canUpload} focus={focus} onChange={(img) => img?.alt && !alt && setAlt(img.alt)} />
      <label className="block">
        <span className="mb-1 block text-[0.8rem] font-semibold text-ink">Description (for screen readers) *</span>
        <input name="alt" value={alt} onChange={(e) => setAlt(e.target.value)} required minLength={5} maxLength={200} className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1 block text-[0.8rem] font-semibold text-ink">Focal point</span>
        <select name="image_position" value={focus} onChange={(e) => setFocus(e.target.value)} className={inputClass}>
          {FOCUS_OPTIONS.map(([v, l]) => (
            <option key={l} value={v}>
              {l}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className={`${submitClass} w-full`}>
        Add slide
      </button>
    </form>
  );
}
