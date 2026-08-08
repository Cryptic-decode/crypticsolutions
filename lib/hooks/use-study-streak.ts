"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { toLocalDateStr } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StudySession {
  id: string;
  user_id: string;
  product_id: string;
  session_date: string;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface StreakData {
  /** Consecutive days up to the most recent session date. */
  currentStreak: number;
  /** The longest streak ever achieved. */
  longestStreak: number;
  /** Total unique days with at least one study session. */
  totalStudyDays: number;
  /** Whether the user has a session recorded for today. */
  todayStudied: boolean;
  /** Loading state. */
  loading: boolean;
  /** Error message, if any. */
  error: string | null;
  /** Refetch from the database. */
  refetch: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Compute streak stats from a set of date strings (YYYY-MM-DD).
 *
 * currentStreak counts consecutive days ending at the latest date in the set,
 * but only if the latest date is today or yesterday (otherwise the streak is
 * broken).
 */
function computeStreaks(dates: Set<string>): {
  currentStreak: number;
  longestStreak: number;
  totalStudyDays: number;
  todayStudied: boolean;
} {
  const today = toLocalDateStr(new Date());
  const yesterday = toLocalDateStr(
    new Date(Date.now() - 86_400_000)
  );

  const todayStudied = dates.has(today);
  const totalStudyDays = dates.size;

  if (totalStudyDays === 0) {
    return { currentStreak: 0, longestStreak: 0, totalStudyDays: 0, todayStudied: false };
  }

  // Sort dates descending
  const sorted = [...dates].sort().reverse();

  // Longest streak: walk forward through sorted ascending dates
  const sortedAsc = [...sorted].reverse();
  let longestStreak = 1;
  let run = 1;
  for (let i = 1; i < sortedAsc.length; i++) {
    const prev = new Date(sortedAsc[i - 1]);
    const curr = new Date(sortedAsc[i]);
    const diffDays = Math.round(
      (curr.getTime() - prev.getTime()) / 86_400_000
    );
    if (diffDays === 1) {
      run++;
      if (run > longestStreak) longestStreak = run;
    } else {
      run = 1;
    }
  }

  // Current streak: count consecutive days backwards from the latest date,
  // but only if the latest date is today or yesterday.
  const latest = sorted[0];
  if (latest !== today && latest !== yesterday) {
    return { currentStreak: 0, longestStreak, totalStudyDays, todayStudied };
  }

  let currentStreak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    const diffDays = Math.round(
      (prev.getTime() - curr.getTime()) / 86_400_000
    );
    if (diffDays === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak, totalStudyDays, todayStudied };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Fetch the current user's study sessions and compute streak data.
 *
 * Follows the same pattern as usePurchases and useReadingProgress.
 */
export function useStudyStreak(): StreakData {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("session_date", { ascending: false });

      if (fetchError) {
        setError(fetchError.message || "Failed to fetch study sessions");
        setSessions([]);
        return;
      }

      setSessions(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Derive streak data from sessions
  const dateSet = new Set(sessions.map((s) => s.session_date));
  const streaks = computeStreaks(dateSet);

  return {
    currentStreak: streaks.currentStreak,
    longestStreak: streaks.longestStreak,
    totalStudyDays: streaks.totalStudyDays,
    todayStudied: streaks.todayStudied,
    loading,
    error,
    refetch: fetchSessions,
  };
}
