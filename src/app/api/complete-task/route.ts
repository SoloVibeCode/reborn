import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { toggleTaskComplete, updateStreak } from "@/lib/db-user";

const MILESTONES = [1, 3, 7, 14, 30];

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { goal_id?: string; task_index?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { goal_id, task_index } = body;
  if (!goal_id || task_index === undefined) {
    return NextResponse.json({ error: "goal_id and task_index required" }, { status: 400 });
  }

  const result = await toggleTaskComplete(user.id, goal_id, task_index);

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
