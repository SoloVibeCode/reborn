export interface DailyPick {
  id: string;
  date: string;
  title: string;
  summary: string;
  author_name: string;
  source: string; // "Hacker News" | "Reddit"
  avatar_url: string;
  link_post: string;
  category: Category;
  score: number;
  reason: string;
  created_at: string;
}

export type Category = "LLMs" | "Agentes" | "Modelos" | "Herramientas" | "Investigación" | "Industria";

// Auth & User types
export interface UserProfile {
  id: string;
  display_name: string | null;
  created_at: string;
  onboarding_completed: boolean;
}

export interface DailyTask {
  title: string;
  description: string;
  estimated_minutes: number;
}

export interface WeeklyTasks {
  week: number;
  tasks: DailyTask[];
}

export interface AIPlan {
  overview: string;
  milestones: string[];
}

export interface UserGoal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  ai_plan: AIPlan | null;
  daily_tasks: DailyTask[] | null;
  weekly_tasks?: WeeklyTasks[] | null;
  created_at: string;
  updated_at: string;
}

export interface UserStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
}

export interface CompletedArticle {
  id: string;
  user_id: string;
  article_id: string;
  completed_at: string;
}
