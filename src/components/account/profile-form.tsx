"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/(marketing)/account/actions";
import { fieldClass, labelClass } from "@/components/account/auth-forms";
import { NIGERIAN_STATES } from "@/lib/nigeria";

export interface Profile {
  full_name: string;
  phone: string;
  delivery_address: string | null;
  city: string | null;
  state: string | null;
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  const v = { ...profile, ...state?.fields };
  return (
    <form action={action} className="space-y-4">
      {state?.error && <p role="alert" className="rounded-xl border border-red/30 bg-red/5 px-3.5 py-2.5 text-[0.86rem] text-red-dark">{state.error}</p>}
      {state?.saved && <p role="status" className="rounded-xl border border-[#bfe4cd] bg-[#effaf3] px-3.5 py-2.5 text-[0.86rem] text-[#17733b]">Details saved.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Full name</span>
          <input name="full_name" autoComplete="name" defaultValue={v.full_name ?? ""} className={fieldClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Phone</span>
          <input name="phone" type="tel" autoComplete="tel" defaultValue={v.phone ?? ""} className={fieldClass} />
        </label>
      </div>
      <label className="block">
        <span className={labelClass}>Delivery address</span>
        <input name="delivery_address" autoComplete="street-address" defaultValue={v.delivery_address ?? ""} className={fieldClass} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>City / Town</span>
          <input name="city" autoComplete="address-level2" defaultValue={v.city ?? ""} className={fieldClass} />
        </label>
        <label className="block">
          <span className={labelClass}>State</span>
          <select name="state" defaultValue={v.state ?? ""} className={fieldClass}>
            <option value="">Select state</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <button type="submit" disabled={pending} className="h-11 rounded-full bg-blue px-6 font-heading text-[0.9rem] font-semibold text-white hover:bg-blue-deep disabled:opacity-60">
        {pending ? "Saving…" : "Save details"}
      </button>
    </form>
  );
}
