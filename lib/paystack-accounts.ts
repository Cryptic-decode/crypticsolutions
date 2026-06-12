import { isKitchenEbookProductId } from "@/lib/kitchen-ebook-products";

export type PaystackAccount = "default" | "lydei";

export function getPaystackAccountForProductId(productId: string): PaystackAccount {
  return isKitchenEbookProductId(productId) ? "lydei" : "default";
}

export function resolvePaystackAccount(
  productId: string,
  paystackAccount?: string | null
): PaystackAccount {
  if (paystackAccount === "lydei" || paystackAccount === "default") {
    return paystackAccount;
  }
  return getPaystackAccountForProductId(productId);
}

export function getPaystackSecretKey(account: PaystackAccount): string | undefined {
  if (account === "lydei") {
    return process.env.PAYSTACK_SECRET_LYDEI_KEY;
  }
  return process.env.PAYSTACK_SECRET_KEY;
}

export function getPaystackPublicKey(account: PaystackAccount): string | undefined {
  if (account === "lydei") {
    return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_LYDEI_KEY;
  }
  return process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
}
