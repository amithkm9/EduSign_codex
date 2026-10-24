"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

/** Supabase client for use in Client Components (browser). */
export function createClient() {
  const { url, key } = getSupabaseConfig();
  return createBrowserClient(url, key);
}
