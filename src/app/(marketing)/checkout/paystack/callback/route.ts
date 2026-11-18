import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { verifyPayment } from "@/lib/payments/paystack";
import { emailOrderUpdate } from "@/lib/email/notify";

/**
 * Paystack sends the customer back here after paying. The redirect proves
 * nothing on its own: we verify the transaction with Paystack and only mark
 * the order paid when status, currency AND amount all match the order.
 */
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference") ?? request.nextUrl.searchParams.get("trxref");
  if (!reference || reference.length > 100) return NextResponse.redirect(new URL("/cart", request.url));

  const admin = supabaseAdmin();
  const { data: order } = await admin
    .from("orders")
    .select("id, access_token, subtotal_ngn, payment_status")
    .eq("payment_reference", reference)
    .maybeSingle();
  if (!order) return NextResponse.redirect(new URL("/cart", request.url));

  const done = new URL(`/checkout/complete?order=${order.id}&token=${order.access_token}`, request.url);
  if (order.payment_status === "paid") return NextResponse.redirect(done);

  try {
    const tx = await verifyPayment(reference);
    const paid = tx.status === "success" && tx.currency === "NGN" && tx.amount === Number(order.subtotal_ngn) * 100;
    const { data: changed } = await admin
      .from("orders")
      .update(paid ? { payment_status: "paid", paid_at: tx.paid_at ?? new Date().toISOString() } : { payment_status: tx.status === "abandoned" ? "unpaid" : "failed" })
      .eq("id", order.id)
      .neq("payment_status", "paid")
      .select("id");
    // "payment received" email — only by the request that actually marked it paid
    if (paid && changed?.length) await emailOrderUpdate(order.id, "paid");
  } catch {
    // Verification couldn't run (network etc.): leave it "pending"; staff can re-check in Paystack.
  }
  return NextResponse.redirect(done);
}
