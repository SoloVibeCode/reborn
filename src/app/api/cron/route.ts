/**
 * Daily cron endpoint
 * Called by Vercel Cron to trigger the full pipeline:
 * Reddit + HN → Curate with Claude → Save to Supabase
 */

import { NextResponse } from "next/server";
import { fetchAllCandidates } from "@/lib/sources";
import { curatePosts } from "@/lib/curate";
import { saveDailyPicks, cleanOldPicks } from "@/lib/db";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[Cron] Starting daily pipeline...");

    // Step 1: Fetch posts from Reddit + Hacker News
    console.log("[Cron] Fetching from Reddit + Hacker News...");
    const candidates = await fetchAllCandidates();
    console.log(`[Cron] Got ${candidates.length} candidate posts`);

    if (candidates.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No candidates found from any source",
      });
    }

    // Step 2: Curate with Claude
    console.log("[Cron] Curating with Claude...");
    const picks = await curatePosts(candidates);
    console.log(`[Cron] Claude selected ${picks.length} picks`);

    // Step 3: Save to Supabase
    console.log("[Cron] Saving to Supabase...");
    await saveDailyPicks(picks);

    // Step 4: Clean old picks
    await cleanOldPicks();

    console.log("[Cron] Pipeline complete!");

    return NextResponse.json({
      success: true,
      picks_count: picks.length,
      candidates_count: candidates.length,
    });
  } catch (error) {
    console.error("[Cron] Pipeline failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
