import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { verifyProductPayment } from "@/lib/payments";

export async function POST(request: NextRequest) {
  try {
    const { name, reference } = await request.json();
    if (typeof name !== "string" || !name.trim() || typeof reference !== "string" || !reference) {
      return NextResponse.json({ error: "Name and reference are required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const { transaction, product } = await verifyProductPayment(reference, "ielts-manual");
    const email = transaction.customer.email.trim().toLowerCase();
    const supabase = createClient(supabaseUrl, serviceKey);
    const purchaseData = {
      transaction_id: transaction.reference || reference,
      email,
      name: name.trim(),
      product_id: product.id,
      status: "completed",
      amount: product.amount,
      currency: product.currency,
      referral_code: transaction.metadata?.referral_code || null,
    };

    const { data: existing } = await supabase
      .from("purchases")
      .select("id, email, product_id")
      .eq("transaction_id", purchaseData.transaction_id)
      .maybeSingle();

    if (existing) {
      if (existing.email !== email || existing.product_id !== product.id) {
        return NextResponse.json({ error: "Transaction is already assigned" }, { status: 409 });
      }
      return NextResponse.json({ success: true, purchase: existing });
    }

    const { data: purchase, error } = await supabase
      .from("purchases")
      .insert(purchaseData)
      .select("id, email, product_id")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, purchase });
  } catch (error: unknown) {
    console.error("Payment completion error:", error);
    return NextResponse.json({ error: "Unable to confirm this purchase" }, { status: 400 });
  }
}
