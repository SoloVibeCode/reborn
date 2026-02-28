/**
 * Hacker News integration
 * Uses the free, public HN API (no auth required)
 * https://github.com/HackerNewsAPI/HackerNewsAPI
 */

import { CandidatePost } from "./sources";

const HN_API = "https://hacker-news.firebaseio.com/v0";

// Keywords to filter AI-related stories
const AI_KEYWORDS = [
  "ai",
  "artificial intelligence",
  "machine learning",
  "llm",
  "gpt",
  "claude",
  "anthropic",
  "openai",
  "deep learning",
  "neural",
  "transformer",
  "diffusion",
  "generative",
  "chatbot",
  "language model",
  "fine-tuning",
  "rag",
  "agent",
  "ai agent",
  "gemini",
  "llama",
  "mistral",
  "copilot",
  "midjourney",
  "stable diffusion",
  "hugging face",
  "deepmind",
  "multimodal",
];

interface HNItem {
  id: number;
  title: string;
  url?: string;
  text?: string;
  score: number;
  by: string;
  time: number;
  descendants?: number; // comment count
  type: string;
}

/**
 * Fetches top AI-related stories from Hacker News (last 24h)
 */
export async function fetchHackerNewsPosts(): Promise<CandidatePost[]> {
  // Get top 200 stories
  const topRes = await fetch(`${HN_API}/topstories.json`);
  const topIds: number[] = await topRes.json();

  // Also check "new" and "best" for broader coverage
  const newRes = await fetch(`${HN_API}/newstories.json`);
  const newIds: number[] = await newRes.json();

  const bestRes = await fetch(`${HN_API}/beststories.json`);
  const bestIds: number[] = await bestRes.json();

  // Combine and deduplicate, take first 300
  const allIds = [...new Set([...topIds.slice(0, 100), ...bestIds.slice(0, 100), ...newIds.slice(0, 100)])];

  // Fetch story details in parallel (batches of 30)
  const stories: HNItem[] = [];
  for (let i = 0; i < allIds.length; i += 30) {
    const batch = allIds.slice(i, i + 30);
    const batchResults = await Promise.all(
      batch.map(async (id) => {
        try {
          const res = await fetch(`${HN_API}/item/${id}.json`);
          return (await res.json()) as HNItem;
        } catch {
          return null;
        }
      })
    );
    stories.push(...batchResults.filter((s): s is HNItem => s !== null));
  }

  const oneDayAgo = Date.now() / 1000 - 24 * 60 * 60;

  // Filter: AI-related, recent, stories only (not comments)
  const aiStories = stories.filter((story) => {
    if (story.type !== "story") return false;
    if (story.time < oneDayAgo) return false;
    if (story.score < 5) return false;

    const title = (story.title || "").toLowerCase();
    const text = (story.text || "").toLowerCase();
    const combined = `${title} ${text}`;

    return AI_KEYWORDS.some((kw) => combined.includes(kw));
  });

  // Transform to CandidatePost format
  return aiStories
    .map((story) => ({
      id: `hn_${story.id}`,
      text: story.title + (story.text ? `\n\n${story.text}` : ""),
      url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
      source_url: `https://news.ycombinator.com/item?id=${story.id}`,
      author_name: story.by,
      source: "Hacker News" as const,
      score: story.score,
      comments: story.descendants || 0,
      created_at: new Date(story.time * 1000).toISOString(),
    }))
    .sort((a, b) => b.score - a.score);
}
