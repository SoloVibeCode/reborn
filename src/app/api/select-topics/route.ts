import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { updateGoalWithPlan, updateProfile } from "@/lib/db-user";
import { getTopicById, TOPICS } from "@/lib/topics";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { topic_ids?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { topic_ids } = body;
  if (!topic_ids || topic_ids.length === 0 || topic_ids.length > 3) {
    return NextResponse.json({ error: "1-3 topic IDs required" }, { status: 400 });
  }

  const validIds = new Set(TOPICS.map((t) => t.id));
  const invalid = topic_ids.find((id) => !validIds.has(id));
  if (invalid) {
    return NextResponse.json({ error: `Unknown topic: ${invalid}` }, { status: 400 });
  }

  try {
    const topics = topic_ids.map((id) => getTopicById(id)!);
    const db = getServiceClient();

    // Delete completed_tasks first (FK constraint: completed_tasks.goal_id → user_goals.id)
    const { data: existingGoals } = await db
      .from("user_goals")
      .select("id")
      .eq("user_id", user.id);

    if (existingGoals && existingGoals.length > 0) {
      const goalIds = existingGoals.map((g: { id: string }) => g.id);
      await db.from("completed_tasks").delete().in("goal_id", goalIds);
    }

    // Now safe to delete old goals
    await db.from("user_goals").delete().eq("user_id", user.id);

    // Insert new goals
    const { data: savedGoals, error: insertError } = await db
      .from("user_goals")
      .insert(topics.map((t) => ({ user_id: user.id, title: t.title })))
      .select();

    if (insertError) throw insertError;
    if (!savedGoals) throw new Error("No goals returned after insert");

    // Attach ai_plan + daily_tasks from the predefined library
    await Promise.all(
      savedGoals.map((goal: { id: string }, i: number) => {
        const topic = topics[i];
        return updateGoalWithPlan(
          goal.id,
          { overview: topic.overview, milestones: topic.milestones },
          topic.tasks
        );
      })
    );

    await updateProfile(user.id, { onboarding_completed: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("select-topics error:", error);
    return NextResponse.json({ error: "Failed to save topics" }, { status: 500 });
  }
}
