"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export interface ReadingProgress {
  product_id: string;
  last_page: number;
  total_read_seconds: number;
  updated_at: string;
}

interface UseReadingProgressReturn {
  progress: ReadingProgress[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getProgressForProduct: (productId: string) => ReadingProgress | undefined;
}

/**
 * Custom hook to fetch reading progress for the authenticated user.
 * Follows the same pattern as usePurchases.
 */
export function useReadingProgress(): UseReadingProgressReturn {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ReadingProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setProgress([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("reading_progress")
        .select("product_id, last_page, total_read_seconds, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message || "Failed to fetch reading progress");
        setProgress([]);
        return;
      }

      setProgress(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setProgress([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const getProgressForProduct = useCallback(
    (productId: string): ReadingProgress | undefined => {
      return progress.find((p) => p.product_id === productId);
    },
    [progress]
  );

  return {
    progress,
    loading,
    error,
    refetch: fetchProgress,
    getProgressForProduct,
  };
}
