"use client";

import { useSyncExternalStore } from "react";
import { kitConfigKey, type KitConfig } from "@/lib/shop/kits";

/**
 * Browser-side shopping cart.
 *
 * There is no backend order system yet, so the cart lives in
 * localStorage and is "checked out" by sending the order to Tobecat on
 * WhatsApp or email (see /cart). When a real checkout exists, swap the
 * persistence layer here — components only use `useCart()`.
 *
 * A line is either a product (`id` = product slug) or a configured
 * solar kit (`kit` holds the chosen components; identical configurations
 * share one line). Lines saved by the earlier cart format (no `id`) are
 * read as product lines, so existing carts survive the upgrade.
 */

export interface CartLine {
  id: string;
  /** product slug, or kit slug when `kit` is set */
  slug: string;
  quantity: number;
  kit?: KitConfig;
}

const STORAGE_KEY = "tobecat-cart-v1";
const MAX_QTY = 99;
const EMPTY: CartLine[] = [];

let cache: CartLine[] | null = null;
const listeners = new Set<() => void>();

function isConfig(v: unknown): v is KitConfig {
  const c = v as KitConfig;
  return Boolean(c) && typeof c.choices === "object" && typeof c.quantities === "object" && Array.isArray(c.addons);
}

export function kitLineId(slug: string, config: KitConfig) {
  return `kit:${slug}:${kitConfigKey(config)}`;
}

function read(): CartLine[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed)
      ? parsed.flatMap((l): CartLine[] => {
          if (typeof l?.slug !== "string" || !Number.isInteger(l?.quantity) || l.quantity <= 0) return [];
          const quantity = Math.min(MAX_QTY, l.quantity);
          if (l.kit !== undefined) return isConfig(l.kit) ? [{ id: kitLineId(l.slug, l.kit), slug: l.slug, quantity, kit: l.kit }] : [];
          return [{ id: l.slug, slug: l.slug, quantity }];
        })
      : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: CartLine[]) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage blocked (private mode etc.): cart still works for this visit.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function addLine(line: CartLine) {
  const lines = read();
  const existing = lines.find((l) => l.id === line.id);
  write(
    existing
      ? lines.map((l) => (l.id === line.id ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + line.quantity) } : l))
      : [...lines, { ...line, quantity: Math.min(MAX_QTY, line.quantity) }],
  );
}

export const cartActions = {
  /** add a product by slug */
  add(slug: string, quantity = 1) {
    addLine({ id: slug, slug, quantity });
  },
  /** add a configured kit; pass a config already normalised against the kit */
  addKit(slug: string, config: KitConfig, quantity = 1) {
    addLine({ id: kitLineId(slug, config), slug, quantity, kit: config });
  },
  setQuantity(id: string, quantity: number) {
    if (quantity <= 0) return cartActions.remove(id);
    write(read().map((l) => (l.id === id ? { ...l, quantity: Math.min(MAX_QTY, Math.round(quantity)) } : l)));
  },
  remove(id: string) {
    write(read().filter((l) => l.id !== id));
  },
  clear() {
    write([]);
  },
};

export function useCart() {
  const lines = useSyncExternalStore(subscribe, read, () => EMPTY);
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  return { lines, count, ...cartActions };
}
