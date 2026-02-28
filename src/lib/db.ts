/**
 * Database operations for daily picks using Supabase
 */

import { createClient } from "@supabase/supabase-js";
import { DailyPick } from "@/types";

// Server-side client with service role for write operations
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey);
}

// Public client for read operations
function getPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anonKey);
}

/**
 * Get today's picks from the database
 */
export async function getTodayPicks(): Promise<DailyPick[]> {
  const supabase = getPublicClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("daily_picks")
    .select("*")
    .eq("date", today)
    .order("score", { ascending: false });

  if (error) {
    console.error("Error fetching today's picks:", error);
    return [];
  }

  return data as DailyPick[];
}

/**
 * Save new daily picks (replaces any existing picks for today)
 */
export async function saveDailyPicks(
  picks: Omit<DailyPick, "id" | "created_at">[]
): Promise<void> {
  const supabase = getServiceClient();
  const today = new Date().toISOString().split("T")[0];

  // Delete existing picks for today (if re-running)
  await supabase.from("daily_picks").delete().eq("date", today);

  // Insert new picks
  const { error } = await supabase.from("daily_picks").insert(picks);

  if (error) {
    throw new Error(`Failed to save picks: ${error.message}`);
  }
}

/**
 * Clean up old picks (keep only last 7 days for reference)
 */
export async function cleanOldPicks(): Promise<void> {
  const supabase = getServiceClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const cutoff = sevenDaysAgo.toISOString().split("T")[0];

  await supabase.from("daily_picks").delete().lt("date", cutoff);
}
