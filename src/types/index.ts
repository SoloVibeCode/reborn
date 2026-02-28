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
