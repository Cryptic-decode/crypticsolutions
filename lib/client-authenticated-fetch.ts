"use client";

import { supabase } from "@/lib/supabase";

let refreshPromise: Promise<string> | null = null;

async function getAccessToken() {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  return data.session.access_token;
}

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = supabase.auth
      .refreshSession()
      .then(({ data, error }) => {
        if (error || !data.session?.access_token) {
          throw new Error("Your session has expired. Please sign in again.");
        }
        return data.session.access_token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

function withAuthorization(init: RequestInit, token: string): RequestInit {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return { ...init, headers };
}

export async function fetchWithUserSession(
  input: string | URL,
  init: RequestInit = {},
) {
  let token = await getAccessToken();
  let response = await fetch(input, withAuthorization(init, token));

  if (response.status !== 401) return response;

  token = await refreshAccessToken();
  response = await fetch(input, withAuthorization(init, token));
  return response;
}
