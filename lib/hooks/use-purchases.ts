"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase, Purchase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface UsePurchasesReturn {
  purchases: Purchase[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch user purchases from Supabase
 * Follows the same pattern as useAuth hook
 * Only fetches completed purchases for the authenticated user
 */
export function usePurchases(): UsePurchasesReturn {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = useCallback(async () => {
    if (!user) {
      setPurchases([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch purchases for the current user
      // RLS policy ensures users only see their own purchases
      const { data, error: fetchError } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message || 'Failed to fetch purchases');
        setPurchases([]);
        return;
      }

      setPurchases(data || []);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  return {
    purchases,
    loading,
    error,
    refetch: fetchPurchases,
  };
}
