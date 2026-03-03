/**
 * User-specific database operations (server-side, uses service role or RLS)
 */

import { createClient } from "@supabase/supabase-js";
import type { UserProfile, UserGoal, UserStreak } from "@/types";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ── Profile ──────────────────────────────────────────────────────────────────

export async function getOrCreateProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("getOrCreateProfile error:", error);
    return null;
  }
  return data ?? null;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, "display_name" | "onboarding_completed">>
) {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("id", userId);
  if (error) throw error;
}

// ── Goals ─────────────────────────────────────────────────────────────────────

export async function getUserGoals(userId: string): Promise<UserGoal[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("user_goals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getUserGoals error:", error);
    return [];
  }
  return (data ?? []) as UserGoal[];
}

export async function saveGoals(
  userId: string,
  goals: Array<{ title: string; description?: string; target_date?: string }>
): Promise<UserGoal[]> {
  const supabase = getServiceClient();

  // Delete existing goals
  await supabase.from("user_goals").delete().eq("user_id", userId);

  const toInsert = goals.map((g) => ({
    user_id: userId,
    title: g.title,
    description: g.description ?? null,
    target_date: g.target_date ?? null,
  }));

  const { data, error } = await supabase
    .from("user_goals")
    .insert(toInsert)
    .select();

  if (error) throw error;
  return (data ?? []) as UserGoal[];
}

export async function updateGoalWithPlan(
  goalId: string,
  aiPlan: object,
  dailyTasks: object[]
) {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from("user_goals")
    .update({
      ai_plan: aiPlan,
      daily_tasks: dailyTasks,
      updated_at: new Date().toISOString(),
    })
    .eq("id", goalId);
  if (error) throw error;
}

// ── Completed Articles ────────────────────────────────────────────────────────

export async function getTodayCompletedArticles(userId: string): Promise<string[]> {
  const supabase = getServiceClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("completed_articles")
    .select("article_id")
    .eq("user_id", userId)
    .gte("completed_at", `${today}T00:00:00.000Z`);

  if (error) {
    console.error("getTodayCompletedArticles error:", error);
    return [];
  }
  return (data ?? []).map((r: { article_id: string }) => r.article_id);
}

export async function getTotalCompletedArticles(userId: string): Promise<number> {
  const supabase = getServiceClient();
  const { count, error } = await supabase
    .from("completed_articles")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) return 0;
  return count ?? 0;
}

export async function toggleArticleComplete(
  userId: string,
  articleId: string
): Promise<{ completed: boolean }> {
  const supabase = getServiceClient();

  // Check if already completed today
  const today = new Date().toISOString().split("T")[0];
  const { data: existing } = await supabase
    .from("completed_articles")
    .select("id")
    .eq("user_id", userId)
    .eq("article_id", articleId)
    .gte("completed_at", `${today}T00:00:00.000Z`)
    .single();

  if (existing) {
    await supabase.from("completed_articles").delete().eq("id", existing.id);
    return { completed: false };
  } else {
    await supabase.from("completed_articles").insert({ user_id: userId, article_id: articleId });
    return { completed: true };
  }
}

// ── Completed Tasks ───────────────────────────────────────────────────────────

export async function getTodayCompletedTasks(
  userId: string
): Promise<Array<{ goal_id: string; task_index: number }>> {
  const supabase = getServiceClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("completed_tasks")
    .select("goal_id, task_index")
    .eq("user_id", userId)
    .eq("task_date", today);

  if (error) {
    console.error("getTodayCompletedTasks error:", error);
    return [];
  }
  return (data ?? []) as Array<{ goal_id: string; task_index: number }>;
}

export async function toggleTaskComplete(
  userId: string,
  goalId: string,
  taskIndex: number
): Promise<{ completed: boolean }> {
  const supabase = getServiceClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: existing } = await supabase
    .from("completed_tasks")
    .select("id")
    .eq("user_id", userId)
    .eq("goal_id", goalId)
    .eq("task_index", taskIndex)
    .eq("task_date", today)
    .single();

  if (existing) {
    await supabase.from("completed_tasks").delete().eq("id", existing.id);
    return { completed: false };
  } else {
    await supabase
      .from("completed_tasks")
      .insert({ user_id: userId, goal_id: goalId, task_index: taskIndex, task_date: today });
    return { completed: true };
  }
}

// ── Weekly Stats ──────────────────────────────────────────────────────────────

export async function getWeeklyStats(userId: string): Promise<{
  articlesRead: number;
  tasksCompleted: number;
  activeDays: number;
}> {
  const supabase = getServiceClient();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 6);
  const weekAgoStr = weekAgo.toISOString().split("T")[0];

  const [articlesResult, tasksResult] = await Promise.all([
    supabase
      .from("completed_articles")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("completed_at", `${weekAgoStr}T00:00:00.000Z`),
    supabase
      .from("completed_tasks")
      .select("task_date")
      .eq("user_id", userId)
      .gte("task_date", weekAgoStr),
  ]);

  const articlesRead = articlesResult.count ?? 0;
  const tasksCompleted = tasksResult.data?.length ?? 0;
  const activeDays = new Set(tasksResult.data?.map((t: { task_date: string }) => t.task_date) ?? []).size;

  return { articlesRead, tasksCompleted, activeDays };
}

// ── Streaks ───────────────────────────────────────────────────────────────────

export async function getStreak(userId: string): Promise<UserStreak | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("getStreak error:", error);
    return null;
  }
  return data as UserStreak;
}

export async function updateStreak(
  userId: string
): Promise<{ streak: UserStreak; newStreak: number; incremented: boolean; newRecord: boolean } | null> {
  const supabase = getServiceClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: streak } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!streak) return null;

  const lastDate = streak.last_active_date;

  if (lastDate === today) {
    // Already counted today — no change
    return { streak: streak as UserStreak, newStreak: streak.current_streak, incremented: false, newRecord: false };
  }

  let newStreak = 1;
  if (lastDate) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    if (lastDate === yesterdayStr) {
      newStreak = streak.current_streak + 1;
    }
  }

  const newRecord = newStreak > streak.longest_streak && newStreak > 1;
  const newLongest = Math.max(newStreak, streak.longest_streak);

  const { data: updated, error } = await supabase
    .from("user_streaks")
    .update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_active_date: today,
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("updateStreak error:", error);
    return null;
  }
  return { streak: updated as UserStreak, newStreak, incremented: true, newRecord };
}
