/**
 * API route to get today's picks
 */

import { NextResponse } from "next/server";
import { getTodayPicks } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const picks = await getTodayPicks();
    return NextResponse.json({ picks });
  } catch (error) {
    console.error("Error fetching picks:", error);
    return NextResponse.json(
      { error: "Failed to fetch picks" },
      { status: 500 }
    );
  }
}
