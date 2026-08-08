import axios from "axios";

import { getPaystackSecretKey } from "@/lib/paystack-accounts";

export const PAYMENT_PRODUCTS = {
  "ielts-manual": {
    id: "ielts-manual",
    name: "IELTS Preparation Manual",
    amount: 5_000,
    currency: "NGN",
    successPath: "/payment/success",
  },
  "talk-to-ai-like-a-pro": {
    id: "talk-to-ai-like-a-pro",
    name: "Talk to AI like a Pro",
    amount: 2_000,
    currency: "NGN",
    successPath: "/payment/ebook-success",
  },
} as const;

export type PaymentProductId = keyof typeof PAYMENT_PRODUCTS;

export interface VerifiedTransaction {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  customer: {
    email: string;
    name?: string | null;
  };
  metadata?: {
    product_id?: string;
    referral_code?: string;
  };
}

export function getPaymentProduct(productId: string) {
  return PAYMENT_PRODUCTS[productId as PaymentProductId];
}

export async function verifyProductPayment(
  reference: string,
  expectedProductId?: string,
): Promise<{ transaction: VerifiedTransaction; product: (typeof PAYMENT_PRODUCTS)[PaymentProductId] }> {
  const secretKey = getPaystackSecretKey();
  if (!secretKey) throw new Error("Paystack secret key is not configured");

  const response = await axios.get(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secretKey}` } },
  );

  const transaction = response.data?.data as VerifiedTransaction | undefined;
  const productId = transaction?.metadata?.product_id;
  const product = productId ? getPaymentProduct(productId) : undefined;

  if (
    response.data?.status !== true ||
    !transaction ||
    transaction.status !== "success" ||
    !product ||
    (expectedProductId && product.id !== expectedProductId) ||
    transaction.amount !== product.amount * 100 ||
    transaction.currency?.toUpperCase() !== product.currency
  ) {
    throw new Error("Payment details do not match this product");
  }

  return { transaction, product };
}
