"use client";

import { useActionState } from "react";
import { claimOwnership } from "./actions";

export function SetupForm() {
  const [state, action, pending] = useActionState(claimOwnership, undefined);
  return (
    <form action={action} className="mt-5 space-y-3">
      {state?.error && (
        <p role="alert" className="rounded-xl border border-red/30 bg-red/5 px-3.5 py-2.5 text-[0.86rem] text-red-dark">
          {state.error}
        </p>
      )}
      <label className="block">
        <span className="mb-1.5 block text-[0.82rem] font-semibold text-ink">Setup code</span>
        <input
          name="token"
          type="password"
          autoComplete="off"
          required
          className="h-12 w-full rounded-xl border border-hair px-3.5 text-[0.95rem] outline-none focus:border-blue focus:ring-3 focus:ring-blue/15"
        />
      </label>
      <button type="submit" disabled={pending} className="h-12 w-full rounded-full bg-red font-heading text-[0.95rem] font-semibold text-white hover:bg-red-dark disabled:opacity-60">
        {pending ? "Checking…" : "Become the owner"}
      </button>
    </form>
  );
}
