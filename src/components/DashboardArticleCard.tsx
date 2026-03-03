"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DailyPick } from "@/types";
import { getCategoryColor, formatScore } from "@/lib/utils";
import { toast } from "@/components/Toast";

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast("Enlace copiado 📋");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1 text-xs rounded-md px-2 py-1 transition-all border ${
        copied
          ? "text-green-400 border-green-500/30 bg-green-500/5"
          : "text-reborn-muted/50 border-reborn-border/50 hover:text-reborn-text-secondary hover:border-reborn-border opacity-0 group-hover:opacity-100"
      }`}
      aria-label="Copiar enlace"
    >
      {copied ? (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}

interface DashboardArticleCardProps {
  pick: DailyPick;
  initialCompleted: boolean;
  rank?: number;
}

const rankStyles: Record<number, string> = {
  1: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  2: "bg-zinc-400/10 text-zinc-400 border-zinc-400/25",
  3: "bg-orange-600/15 text-orange-500 border-orange-600/25",
  4: "bg-reborn-accent/10 text-reborn-accent border-reborn-accent/20",
};

const categoryAccent: Record<string, string> = {
  LLMs: "border-l-purple-500/50",
  Agentes: "border-l-blue-500/50",
  Modelos: "border-l-green-500/50",
  Herramientas: "border-l-amber-500/50",
  Investigación: "border-l-rose-500/50",
  Industria: "border-l-cyan-500/50",
};

function SourceIcon({ source }: { source: string }) {
  if (source === "Hacker News") {
    return (
      <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-xs">Y</span>
      </div>
    );
  }
  return (
    <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.066 13.98a1.028 1.028 0 01-.266.424 1.03 1.03 0 01-.726.3c-.396 0-.726-.33-.726-.726 0-.198.084-.378.216-.504a8.03 8.03 0 00-3.576-1.194l.606-2.862 1.98.42a.726.726 0 10.132-.726l-2.214-.468a.39.39 0 00-.456.3l-.672 3.186a8.17 8.17 0 00-3.66 1.188.72.72 0 00-.504-.204.726.726 0 00-.51 1.236 1.62 1.62 0 00-.072.486c0 2.478 2.886 4.488 6.444 4.488s6.444-2.01 6.444-4.488a1.62 1.62 0 00-.066-.462zM8.67 13.32a.726.726 0 11.726.726.726.726 0 01-.726-.726zm5.694 2.67c-.696.696-2.016.75-2.364.75s-1.668-.06-2.364-.75a.252.252 0 01.354-.354c.438.438 1.374.594 2.016.594s1.572-.156 2.01-.594a.252.252 0 01.354.354h-.006zm-.186-1.944a.726.726 0 110-1.452.726.726 0 010 1.452z" />
      </svg>
    </div>
  );
}

function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export default function DashboardArticleCard({
  pick,
  initialCompleted,
  rank,
}: DashboardArticleCardProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const readTime = readingMinutes((pick.summary ?? "") + " " + (pick.reason ?? ""));

const MILESTONE_MESSAGES: Record<number, string> = {
  1:  "¡Primer día de racha! 🔥",
  3:  "¡3 días seguidos! ¡Buena racha! 🔥",
  7:  "¡1 semana de racha! 🌟",
  14: "¡2 semanas seguidas! ¡Impresionante! 💎",
  30: "¡30 días de racha! ¡Eres un maestro! 🏆",
};

  const toggle = () => {
    const next = !completed;
    setCompleted(next);
    if (next) toast("Artículo marcado como leído ✓");

    startTransition(async () => {
      const res = await fetch("/api/complete-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article_id: pick.id }),
      });
      if (!res.ok) {
        setCompleted(!next);
      } else {
        const data = await res.json();
        if (data.newRecord) {
          setTimeout(() => toast("¡Nuevo récord personal! 🏆", "streak"), 300);
        } else if (data.milestone && MILESTONE_MESSAGES[data.milestone]) {
          setTimeout(() => toast(MILESTONE_MESSAGES[data.milestone], "streak"), 400);
        }
        router.refresh();
      }
    });
  };

  return (
    <div
      className={`group relative rounded-2xl p-5 border transition-all duration-300 ${
        completed
          ? "bg-green-500/5 border-green-500/20 border-l-2 border-l-green-500/40"
          : `bg-reborn-card border-reborn-border border-l-2 ${categoryAccent[pick.category] ?? "border-l-reborn-border"} hover:border-reborn-accent/40 hover:shadow-lg hover:shadow-reborn-accent/5 hover:-translate-y-0.5`
      }`}
    >
      {/* Checkbox — larger touch target */}
      <button
        onClick={toggle}
        disabled={isPending}
        aria-label={completed ? "Marcar como no leído" : "Marcar como leído"}
        className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 focus:outline-none active:scale-90"
        style={{
          borderColor: completed ? "#22c55e" : "#3f3f46",
          backgroundColor: completed ? "#22c55e" : "transparent",
        }}
      >
        {completed && (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Category + Rank + Read badge */}
      <div className="mb-3 flex items-center gap-2 flex-wrap">
        {rank && (
          <span className={`inline-flex items-center text-xs font-bold px-2 py-1 rounded-full border ${rankStyles[rank] ?? rankStyles[4]}`}>
            #{rank}
          </span>
        )}
        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full border ${getCategoryColor(pick.category)}`}>
          {pick.category}
        </span>
        {completed && (
          <span className="text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-2.5 py-1">
            ✓ Leído
          </span>
        )}
      </div>

      {/* Title */}
      <a href={pick.link_post} target="_blank" rel="noopener noreferrer" className="group/link block">
        <h3 className={`text-base font-semibold mb-2 pr-10 leading-snug transition-colors hover:text-reborn-accent ${completed ? "text-reborn-muted" : "text-reborn-text"}`}>
          {pick.title}
          <span className="inline-block opacity-0 group-hover/link:opacity-60 transition-opacity ml-1 text-sm font-normal">↗</span>
        </h3>
      </a>

      {/* Summary */}
      <p className={`text-sm leading-relaxed mb-3 line-clamp-2 ${completed ? "text-reborn-muted/60" : "text-reborn-text-secondary"}`}>
        {pick.summary}
      </p>

      {/* Reason box — only when not completed */}
      {pick.reason && !completed && (
        <div className="flex items-start gap-2 bg-reborn-accent/5 border border-reborn-accent/15 rounded-lg p-3 mb-4">
          <span className="text-reborn-accent/60 text-xs mt-0.5 flex-shrink-0">✦</span>
          <p className="text-xs text-reborn-muted leading-relaxed line-clamp-2">
            <span className="font-medium text-reborn-text-secondary">Por qué hoy: </span>
            {pick.reason}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SourceIcon source={pick.source} />
          <div className="min-w-0">
            <p className="text-xs font-medium text-reborn-text truncate">{pick.author_name}</p>
            <p className="text-xs text-reborn-muted">{pick.source}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <CopyLinkButton url={pick.link_post} />
          <span className="text-xs text-reborn-muted">~{readTime} min</span>
          {pick.score > 0 && (
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
              <svg className="w-2.5 h-2.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs font-semibold text-amber-400">{formatScore(pick.score)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
