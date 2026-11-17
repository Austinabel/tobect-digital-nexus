"use client";

import { useEffect } from "react";
import { cartActions } from "@/lib/cart";

/** Empties the cart once an order has been placed. */
export function ClearCart() {
  useEffect(() => {
    cartActions.clear();
  }, []);
  return null;
}
