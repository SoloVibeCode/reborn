/**
 * Reddit integration
 * Uses Reddit's public JSON API (no auth required for reading)
 * Just append .json to any subreddit URL
 */

import { CandidatePost } from "./sources";

// AI-related subreddits to monitor
const AI_SUBREDDITS = [
  "MachineLearning",
  "artificial",
  "LocalLLaMA",
  "ChatGPT",
  "ClaudeAI",
  "singularity",
  "ArtificialIntelligence",
];

interface RedditPost {
  data: {
    id: string;
    title: string;
    selftext: string;
    url: string;
    permalink: string;
    author: string;
    score: number;
    num_comments: number;
    created_utc: number;
    is_self: boolean;
    link_flair_text?: string;
    over_18: boolean;
    stickied: boolean;
  };
}

interface RedditListing {
  data: {
    children: RedditPost[];
  };
}

/**
 * Fetches top AI posts from Reddit subreddits (last 24h)
 */
export async function fetchRedditPosts(): Promise<CandidatePost[]> {
  const allPosts: CandidatePost[] = [];

  for (const subreddit of AI_SUBREDDITS) {
    try {
      // Fetch top posts from last 24 hours
      const res = await fetch(
        `https://www.reddit.com/r/${subreddit}/top.json?t=day&limit=15`,
        {
          headers: {
            // Reddit requires a User-Agent for API access
            "User-Agent": "Reborn/1.0 (AI News Curator)",
          },
        }
      );

      if (!res.ok) {
        console.warn(`Reddit fetch failed for r/${subreddit}: ${res.status}`);
        continue;
      }

      const listing: RedditListing = await res.json();

      const posts = listing.data.children
        .filter((post) => {
          // Skip NSFW, stickied, and very low score posts
          return !post.data.over_18 && !post.data.stickied && post.data.score > 10;
        })
        .map((post) => ({
          id: `reddit_${post.data.id}`,
          text: post.data.title + (post.data.selftext ? `\n\n${post.data.selftext.slice(0, 500)}` : ""),
          url: post.data.is_self
            ? `https://reddit.com${post.data.permalink}`
            : post.data.url,
          source_url: `https://reddit.com${post.data.permalink}`,
          author_name: `u/${post.data.author}`,
          source: "Reddit" as const,
          score: post.data.score,
          comments: post.data.num_comments,
          created_at: new Date(post.data.created_utc * 1000).toISOString(),
        }));

      allPosts.push(...posts);

      // Small delay between requests to be respectful
      await new Promise((r) => setTimeout(r, 500));
    } catch (error) {
      console.warn(`Error fetching r/${subreddit}:`, error);
    }
  }

  // Sort by score and deduplicate by URL
  const seen = new Set<string>();
  return allPosts
    .sort((a, b) => b.score - a.score)
    .filter((post) => {
      if (seen.has(post.url)) return false;
      seen.add(post.url);
      return true;
    });
}
