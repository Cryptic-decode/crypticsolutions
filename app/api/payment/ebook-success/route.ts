import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { verifyProductPayment } from "@/lib/payments";

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();
    if (typeof reference !== "string" || !reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const { transaction, product } = await verifyProductPayment(reference, "talk-to-ai-like-a-pro");
    const supabase = createClient(supabaseUrl, serviceKey);
    const transactionId = transaction.reference || reference;
    const email = transaction.customer.email.trim().toLowerCase();

    const { data: existing } = await supabase
      .from("purchases")
      .select("id, email, product_id")
      .eq("transaction_id", transactionId)
      .maybeSingle();

    if (existing) {
      if (existing.email !== email || existing.product_id !== product.id) {
        return NextResponse.json({ error: "Transaction is already assigned" }, { status: 409 });
      }
      return NextResponse.json({ success: true, purchaseId: existing.id });
    }

    const { data: purchase, error } = await supabase
      .from("purchases")
      .insert({
        transaction_id: transactionId,
        product_id: product.id,
        email,
        name: transaction.customer.name?.trim() || "Customer",
        amount: product.amount,
        currency: product.currency,
        status: "completed",
        user_id: null,
      })
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, purchaseId: purchase.id });
  } catch (error: unknown) {
    console.error("Ebook payment completion error:", error);
    return NextResponse.json({ error: "Unable to confirm this purchase" }, { status: 400 });
  }
}
