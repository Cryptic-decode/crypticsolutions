/**
 * Shared product definitions and helpers for Cryptic Solutions.
 *
 * Centralises product metadata, type-checking, and utility functions
 * so dashboard and progress pages stay in sync.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProductType = "course" | "download";

export interface ProductDefinition {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  /** Total pages, only meaningful for course products. */
  totalPages?: number;
}

// ---------------------------------------------------------------------------
// Product registry
// ---------------------------------------------------------------------------

export const PRODUCTS: Record<string, ProductDefinition> = {
  "ielts-manual": {
    id: "ielts-manual",
    name: "IELTS Preparation Manual",
    description: "Complete study guide for IELTS exam",
    type: "course",
    totalPages: 100,
  },
  "talk-to-ai-like-a-pro": {
    id: "talk-to-ai-like-a-pro",
    name: "Prompt Engineering Ebook",
    description: "Instant download ebook for learning to talk to AI like a pro",
    type: "download",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return every product definition typed as "course". */
export function getCourseProducts(): ProductDefinition[] {
  return Object.values(PRODUCTS).filter((p) => p.type === "course");
}

/** Return every product definition typed as "download". */
export function getDownloadProducts(): ProductDefinition[] {
  return Object.values(PRODUCTS).filter((p) => p.type === "download");
}

/** Return a product definition, or undefined if unknown. */
export function getProductInfo(
  productId: string,
): ProductDefinition | undefined {
  return PRODUCTS[productId];
}

/** Return only the product IDs that are courses. */
export function getCourseProductIds(): Set<string> {
  return new Set(getCourseProducts().map((p) => p.id));
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/** Format a number of seconds into a human-readable string (e.g. "5 min", "1h 20m"). */
export function formatReadingTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
}
