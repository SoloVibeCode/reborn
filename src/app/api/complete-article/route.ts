import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { toggleArticleComplete, updateStreak } from "@/lib/db-user";

const MILESTONES = [1, 3, 7, 14, 30];

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { article_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { article_id } = body;
  if (!article_id) {
    return NextResponse.json({ error: "article_id required" }, { status: 400 });
  }

  const result = await toggleArticleComplete(user.id, article_id);

  let milestone: number | null = null;
  let newRecord = false;
  if (result.completed) {
    const streakResult = await updateStreak(user.id);
    if (streakResult?.incremented) {
      if (MILESTONES.includes(streakResult.newStreak)) {
        milestone = streakResult.newStreak;
      }
      newRecord = streakResult.newRecord;
    }
  }

  return NextResponse.json({ ...result, milestone, newRecord });
}
