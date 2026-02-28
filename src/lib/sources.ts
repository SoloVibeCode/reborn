/**
 * Shared types and combined fetcher for all data sources
 */

import { fetchHackerNewsPosts } from "./hackernews";
import { fetchRedditPosts } from "./reddit";

export interface CandidatePost {
  id: string;
  text: string;
  url: string;
  source_url: string; // Link to the discussion (HN thread, Reddit thread)
  author_name: string;
  source: "Hacker News" | "Reddit";
  score: number; // upvotes
  comments: number;
  created_at: string;
}

/**
 * Fetches candidates from all sources (HN + Reddit) in parallel
 */
export async function fetchAllCandidates(): Promise<CandidatePost[]> {
  const [hnPosts, redditPosts] = await Promise.all([
    fetchHackerNewsPosts().catch((e) => {
      console.warn("HN fetch failed:", e);
      return [] as CandidatePost[];
    }),
    fetchRedditPosts().catch((e) => {
      console.warn("Reddit fetch failed:", e);
      return [] as CandidatePost[];
    }),
  ]);

  const all = [...hnPosts, ...redditPosts];
  // Sort by combined engagement
  return all.sort((a, b) => b.score + b.comments - (a.score + a.comments));
}
