import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  KITCHEN_EBOOK_PRODUCTS,
  isKitchenEbookProductId,
  type KitchenEbookProductId,
} from "@/lib/kitchen-ebook-products";

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server configuration error: Missing Supabase credentials" },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    let body: {
      reference?: string;
      email?: string;
      name?: string;
      amount?: number;
      currency?: string;
      productId?: string;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { reference, email, name, amount, currency, productId } = body;

    if (!reference || !email) {
      return NextResponse.json(
        { error: "Reference and email are required" },
        { status: 400 }
      );
    }

    if (!productId || !isKitchenEbookProductId(productId)) {
      return NextResponse.json({ error: "Valid productId is required" }, { status: 400 });
    }

    const product = KITCHEN_EBOOK_PRODUCTS[productId as KitchenEbookProductId];
    const purchaseAmount = amount != null ? parseFloat(String(amount)) : NaN;

    if (Number.isNaN(purchaseAmount) || purchaseAmount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    if (purchaseAmount !== product.amount) {
      return NextResponse.json(
        { error: "Payment amount does not match product price" },
        { status: 400 }
      );
    }

    const { data: existingPurchase } = await supabaseAdmin
      .from("purchases")
      .select("id, product_id")
      .eq("transaction_id", reference)
      .single();

    if (existingPurchase) {
      return NextResponse.json({
        success: true,
        message: "Purchase already recorded",
        purchaseId: existingPurchase.id,
        productId: existingPurchase.product_id,
      });
    }

    const { data: purchase, error: insertError } = await supabaseAdmin
      .from("purchases")
      .insert([
        {
          transaction_id: reference,
          product_id: productId,
          email,
          name: name || "Customer",
          amount: purchaseAmount,
          currency: currency || "NGN",
          status: "completed",
          user_id: null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting kitchen ebook purchase:", insertError);
      return NextResponse.json(
        { error: "Failed to store purchase: " + insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Purchase stored successfully",
      purchaseId: purchase.id,
      productId,
    });
  } catch (error: unknown) {
    console.error("Unexpected error in kitchen-ebook-success route:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Internal server error: " + message }, { status: 500 });
  }
}
