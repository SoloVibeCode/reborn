/**
 * Unified fetcher that combines all data sources
 * and prepares candidates for AI curation
 */

import { CandidatePost } from "./sources";
import { fetchHackerNewsPosts } from "./hackernews";
import { fetchRedditPosts } from "./reddit";

/**
 * Fetches posts from all sources and returns a combined,
 * deduplicated, sorted list of candidates
 */
export async function fetchAllCandidates(): Promise<CandidatePost[]> {
  console.log("[Fetch] Fetching from all sources...");

  // Fetch from both sources in parallel
  const [hnPosts, redditPosts] = await Promise.all([
    fetchHackerNewsPosts().catch((err) => {
      console.error("[Fetch] Hacker News failed:", err);
      return [] as CandidatePost[];
    }),
    fetchRedditPosts().catch((err) => {
      console.error("[Fetch] Reddit failed:", err);
      return [] as CandidatePost[];
    }),
  ]);

  console.log(`[Fetch] HN: ${hnPosts.length} posts, Reddit: ${redditPosts.length} posts`);

  // Combine all posts
  const allPosts = [...hnPosts, ...redditPosts];

  // Deduplicate by URL (same article might appear on both HN and Reddit)
  const seen = new Set<string>();
  const unique = allPosts.filter((post) => {
    // Normalize URL for dedup
    const normalizedUrl = post.url.replace(/\/$/, "").toLowerCase();
    if (seen.has(normalizedUrl)) return false;
    seen.add(normalizedUrl);
    return true;
  });

  // Sort by a combined relevance score
  // Normalize scores across sources (HN and Reddit have different scales)
  const maxHN = Math.max(...hnPosts.map((p) => p.score), 1);
  const maxReddit = Math.max(...redditPosts.map((p) => p.score), 1);

  const scored = unique.map((post) => {
    const normalizedScore =
      post.source === "Hacker News"
        ? post.score / maxHN
        : post.score / maxReddit;

    const commentBonus = Math.min(post.comments / 100, 0.3);

    return {
      ...post,
      _relevance: normalizedScore + commentBonus,
    };
  });

  scored.sort((a, b) => b._relevance - a._relevance);

  // Return top 50 candidates for Claude to curate
  return scored.slice(0, 50).map(({ _relevance, ...post }) => post);
}
