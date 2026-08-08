import { NextRequest, NextResponse } from "next/server";

import { verifyProductPayment } from "@/lib/payments";

export async function POST(request: NextRequest) {
  try {
    const { reference, productId } = await request.json();
    if (typeof reference !== "string" || !reference) {
      return NextResponse.json({ error: "Reference is required" }, { status: 400 });
    }

    const { transaction, product } = await verifyProductPayment(
      reference,
      typeof productId === "string" ? productId : undefined,
    );

    return NextResponse.json({
      success: true,
      transaction: {
        reference: transaction.reference,
        amount: transaction.amount,
        currency: transaction.currency,
        customer: transaction.customer,
        productId: product.id,
      },
      message: "Payment verified successfully",
    });
  } catch (error: unknown) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }
}
