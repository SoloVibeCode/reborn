import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { saveGoals, updateGoalWithPlan, updateProfile } from "@/lib/db-user";
import { getTopicById, TOPICS } from "@/lib/topics";

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

  const topics = topic_ids.map((id) => getTopicById(id)!);

  // Save goals (deletes existing ones, creates new rows)
  const savedGoals = await saveGoals(
    user.id,
    topics.map((t) => ({ title: t.title }))
  );

  // Attach ai_plan + daily_tasks from the predefined library
  await Promise.all(
    savedGoals.map((goal, i) => {
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
}
