"use client";

import { useActionState } from "react";
import { buttonClass, inputClass } from "@/components/admin/admin-ui";
import { addStaff } from "./actions";

export function AddStaffForm({ roles }: { roles: { key: string; label: string }[] }) {
  const [state, action, pending] = useActionState(addStaff, undefined);
  return (
    <form action={action} className="space-y-3">
      {state?.error && <p role="alert" className="rounded-xl border border-red/30 bg-red/5 px-3 py-2 text-[0.84rem] text-red-dark">{state.error}</p>}
      {state?.ok && <p role="status" className="rounded-xl border border-[#bfe4cd] bg-[#effaf3] px-3 py-2 text-[0.84rem] text-[#17733b]">{state.ok}</p>}
      <label className="block">
        <span className="mb-1 block text-[0.8rem] font-semibold text-ink">Their account email</span>
        <input name="email" type="email" required autoComplete="off" className={inputClass} />
      </label>
      <label className="block">
        <span className="mb-1 block text-[0.8rem] font-semibold text-ink">Role</span>
        <select name="role" defaultValue="product_lister" className={inputClass}>
          {roles.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={pending} className={`${buttonClass} w-full`}>
        {pending ? "Adding…" : "Add to team"}
      </button>
      <p className="text-[0.76rem] text-slate">They need a website account first — they can create one in a minute at /account/register.</p>
    </form>
  );
}
