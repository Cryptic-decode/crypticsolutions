import { randomUUID } from "crypto";

import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

import { getPaystackSecretKey } from "@/lib/paystack-accounts";
import { getPaymentProduct } from "@/lib/payments";

export async function POST(request: NextRequest) {
  try {
    const { email, productId, referralCode } = await request.json();
    const product = typeof productId === "string" ? getPaymentProduct(productId) : undefined;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || !normalizedEmail.includes("@") || !product) {
      return NextResponse.json({ error: "A valid email and product are required" }, { status: 400 });
    }

    const secretKey = getPaystackSecretKey();
    if (!secretKey) {
      return NextResponse.json({ error: "Paystack secret key is not configured" }, { status: 500 });
    }

    const reference = `ref_${randomUUID()}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://crypticsolutionsltd.com";
    const referral = typeof referralCode === "string" ? referralCode.trim().slice(0, 20) : "";
    const callbackUrl = new URL(product.successPath, baseUrl);
    callbackUrl.searchParams.set("reference", reference);
    if (referral) callbackUrl.searchParams.set("referral_code", referral);

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: normalizedEmail,
        amount: product.amount * 100,
        currency: product.currency,
        reference,
        callback_url: callbackUrl.toString(),
        metadata: {
          product_id: product.id,
          product_name: product.name,
          referral_code: referral || undefined,
        },
      },
      { headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" } },
    );

    if (!response.data?.status) {
      return NextResponse.json({ error: "Failed to initialize payment" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      authorization_url: response.data.data.authorization_url,
      access_code: response.data.data.access_code,
      reference,
    });
  } catch (error: unknown) {
    const message = axios.isAxiosError(error)
      ? error.response?.data?.message || "Failed to initiate payment"
      : "Failed to initiate payment";
    console.error("Payment initiation error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
