"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";

export interface SaveDesignState {
  ok?: boolean;
  error?: string;
}

const MAX_SAVED = 50;
const CODE = /^[A-Za-z0-9_-]{1,8000}$/;

/** Save the current calculator design to the signed-in customer's account (RLS: own rows only). */
export async function saveDesign(_: SaveDesignState | undefined, fd: FormData): Promise<SaveDesignState> {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: "Please sign in to save designs." };

  const name = String(fd.get("name") ?? "").trim().slice(0, 80);
  const code = String(fd.get("code") ?? "");
  if (!name) return { error: "Give the design a name." };
  if (!CODE.test(code)) return { error: "This design couldn't be read. Please try again." };

  const num = (k: string) => {
    const n = Number(fd.get(k));
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
  };
  const summary = { inverterKva: num("inverterKva"), batteryKwh: num("batteryKwh"), panels: num("panels"), panelWatt: num("panelWatt"), dailyKwh: num("dailyKwh") };

  const { count } = await supabase.from("saved_designs").select("id", { count: "exact", head: true });
  if ((count ?? 0) >= MAX_SAVED) return { error: `You can keep up to ${MAX_SAVED} designs — delete an old one first.` };

  const { error } = await supabase.from("saved_designs").insert({ customer_id: data.user.id, name, share_code: code, summary });
  if (error) return { error: "Couldn't save the design. Please try again." };
  revalidatePath("/account");
  return { ok: true };
}

export async function deleteDesign(fd: FormData) {
  const supabase = await supabaseServer();
  const id = String(fd.get("id") ?? "");
  if (/^[0-9a-f-]{36}$/i.test(id)) await supabase.from("saved_designs").delete().eq("id", id); // RLS: own rows only
  revalidatePath("/account");
}
