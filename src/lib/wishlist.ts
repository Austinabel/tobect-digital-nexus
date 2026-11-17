"use client";

import { useSyncExternalStore } from "react";

/** Saved products (wishlist), kept in this browser like the cart. */

const STORAGE_KEY = "tobecat-wishlist-v1";
const EMPTY: string[] = [];
let cache: string[] | null = null;
const listeners = new Set<() => void>();

function read(): string[] {
  if (cache) return cache;
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    cache = Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string").slice(0, 200) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: string[]) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage blocked: keep for this visit
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

export function useWishlist() {
  const slugs = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    slugs,
    has: (slug: string) => slugs.includes(slug),
    toggle: (slug: string) => write(slugs.includes(slug) ? slugs.filter((s) => s !== slug) : [...slugs, slug]),
    remove: (slug: string) => write(slugs.filter((s) => s !== slug)),
  };
}
