export type KitchenEbookPart = "part-one" | "part-two";

export type KitchenEbookProductId =
  | "from-kitchen-to-cash-part-one"
  | "from-kitchen-to-cash-part-two"
  | "from-kitchen-to-cash-bundle";

export const KITCHEN_EBOOK_PDF_FILES: Record<KitchenEbookPart, string> = {
  "part-one": "From Kitchen to Cash - Part One.pdf",
  "part-two": "From Kitchen to Cash - Part Two.pdf",
};

export const KITCHEN_EBOOK_PRODUCTS: Record<
  KitchenEbookProductId,
  {
    name: string;
    amount: number;
    parts: KitchenEbookPart[];
    checkoutLabel: string;
    checkoutDescription: string;
  }
> = {
  "from-kitchen-to-cash-part-one": {
    name: "From Kitchen to Cash — Part One",
    amount: 3000,
    parts: ["part-one"],
    checkoutLabel: "Part One only",
    checkoutDescription: "Foundations, pitfalls, mindset, and intro exercises.",
  },
  "from-kitchen-to-cash-part-two": {
    name: "From Kitchen to Cash — Part Two",
    amount: 3000,
    parts: ["part-two"],
    checkoutLabel: "Part Two only",
    checkoutDescription: "Menus, costing, templates, and takeaway worksheets.",
  },
  "from-kitchen-to-cash-bundle": {
    name: "From Kitchen to Cash — Complete Bundle",
    amount: 5000,
    parts: ["part-one", "part-two"],
    checkoutLabel: "Both parts (best value)",
    checkoutDescription: "Full guide — save ₦1,000 vs buying each part separately.",
  },
};

export const KITCHEN_EBOOK_PRODUCT_IDS: KitchenEbookProductId[] = [
  "from-kitchen-to-cash-part-one",
  "from-kitchen-to-cash-bundle",
  "from-kitchen-to-cash-part-two",
];

export function isKitchenEbookProductId(
  value: string
): value is KitchenEbookProductId {
  return KITCHEN_EBOOK_PRODUCT_IDS.includes(value as KitchenEbookProductId);
}

export function getKitchenProductFromMetadata(
  metadata: Record<string, unknown> | null | undefined
): KitchenEbookProductId | null {
  if (!metadata) return null;
  const raw = metadata.product_id ?? metadata.productId;
  if (typeof raw !== "string") return null;
  return isKitchenEbookProductId(raw) ? raw : null;
}

export function canDownloadKitchenPart(
  productId: KitchenEbookProductId,
  part: KitchenEbookPart
): boolean {
  return KITCHEN_EBOOK_PRODUCTS[productId].parts.includes(part);
}
