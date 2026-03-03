"use client";

import { DailyPick } from "@/types";
import { getCategoryColor, formatScore } from "@/lib/utils";

interface ArticleCardProps {
  pick: DailyPick;
  index: number;
}

function SourceIcon({ source }: { source: string }) {
  if (source === "Hacker News") {
    return (
      <div className="w-8 h-8 rounded-full ring-2 ring-reborn-border bg-orange-500 flex items-center justify-center">
        <span className="text-white font-bold text-xs">Y</span>
      </div>
    );
  }
  // Reddit
  return (
    <div className="w-8 h-8 rounded-full ring-2 ring-reborn-border bg-orange-600 flex items-center justify-center">
      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.066 13.98a1.028 1.028 0 01-.266.424 1.03 1.03 0 01-.726.3c-.396 0-.726-.33-.726-.726 0-.198.084-.378.216-.504a8.03 8.03 0 00-3.576-1.194l.606-2.862 1.98.42a.726.726 0 10.132-.726l-2.214-.468a.39.39 0 00-.456.3l-.672 3.186a8.17 8.17 0 00-3.66 1.188.72.72 0 00-.504-.204.726.726 0 00-.51 1.236 1.62 1.62 0 00-.072.486c0 2.478 2.886 4.488 6.444 4.488s6.444-2.01 6.444-4.488a1.62 1.62 0 00-.066-.462zM8.67 13.32a.726.726 0 11.726.726.726.726 0 01-.726-.726zm5.694 2.67c-.696.696-2.016.75-2.364.75s-1.668-.06-2.364-.75a.252.252 0 01.354-.354c.438.438 1.374.594 2.016.594s1.572-.156 2.01-.594a.252.252 0 01.354.354h-.006zm-.186-1.944a.726.726 0 110-1.452.726.726 0 010 1.452z" />
      </svg>
    </div>
  );
}

const rankGradients = [
  "from-yellow-500 to-orange-500",
  "from-slate-400 to-slate-500",
  "from-orange-600 to-orange-700",
  "from-reborn-accent to-blue-600",
];

const categoryAccent: Record<string, string> = {
  LLMs: "border-l-purple-500/50",
  Agentes: "border-l-blue-500/50",
  Modelos: "border-l-green-500/50",
  Herramientas: "border-l-amber-500/50",
  Investigación: "border-l-rose-500/50",
  Industria: "border-l-cyan-500/50",
};

function estimateReadTime(text: string): number {
  return Math.max(1, Math.round(text.trim().split(/\s+/).length / 200));
}

export default function ArticleCard({ pick, index }: ArticleCardProps) {
  return (
    <a
      href={pick.link_post}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <article className={`relative bg-reborn-card border border-reborn-border border-l-2 ${categoryAccent[pick.category] ?? "border-l-reborn-border"} rounded-2xl p-6 transition-all duration-300 hover:border-reborn-accent/50 hover:shadow-xl hover:shadow-reborn-accent/10 hover:-translate-y-1`}>
        {/* Rank + Score */}
        <div className="absolute top-5 right-5 flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${rankGradients[index] ?? rankGradients[3]} flex items-center justify-center shadow-sm`}>
            <span className="text-white font-bold text-xs">{index + 1}</span>
          </div>
          {pick.score > 0 && (
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-1">
              <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-semibold text-amber-400">{formatScore(pick.score)}</span>
            </div>
          )}
        </div>

        {/* Category tag */}
        <div className="mb-4">
          <span
            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${getCategoryColor(pick.category)}`}
          >
            {pick.category}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-reborn-text mb-3 pr-16 leading-snug group-hover:text-reborn-accent transition-colors">
          {pick.title}
        </h2>

        {/* Summary */}
        <p className="text-sm text-reborn-text-secondary leading-relaxed mb-5">
          {pick.summary}
        </p>

        {/* Reason */}
        <div className="flex items-start gap-2 bg-reborn-accent/5 border border-reborn-accent/15 rounded-lg p-3 mb-5">
          <span className="text-reborn-accent/60 text-xs mt-0.5 flex-shrink-0">✦</span>
          <p className="text-xs text-reborn-muted leading-relaxed">
            <span className="font-medium text-reborn-text-secondary">Por qué hoy: </span>
            {pick.reason}
          </p>
        </div>

        {/* Author row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SourceIcon source={pick.source} />
            <div>
              <p className="text-sm font-medium text-reborn-text">
                {pick.author_name}
              </p>
              <p className="text-xs text-reborn-muted">
                {pick.source} · ~{estimateReadTime(pick.summary + " " + pick.reason)} min
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-reborn-accent/8 group-hover:bg-reborn-accent/15 border border-reborn-accent/15 group-hover:border-reborn-accent/30 rounded-lg px-2.5 py-1.5 text-reborn-muted group-hover:text-reborn-accent transition-all">
            <span className="text-xs font-medium">Leer</span>
            <svg
              className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </div>
        </div>
      </article>
    </a>
  );
}
