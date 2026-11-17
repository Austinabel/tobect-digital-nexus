/** Hand-picked product lists on the shop page (table collection_items). */
export const COLLECTIONS = [
  {
    key: "new-arrivals",
    title: "New Arrivals",
    intro: "Leave empty and the shop shows products added in the last 60 days automatically. Add products here to choose them yourself instead.",
  },
  {
    key: "popular",
    title: "Popular Products",
    intro: "Your best sellers, from real sales. The section is hidden while the list is empty — the shop never guesses what's popular.",
  },
] as const;

export type CollectionKey = (typeof COLLECTIONS)[number]["key"];
export const MAX_COLLECTION = 12;
