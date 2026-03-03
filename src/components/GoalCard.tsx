"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserGoal, DailyTask } from "@/types";
import ProgressBar from "@/components/ProgressBar";
import { toast } from "@/components/Toast";

const goalColors = [
  { border: "border-reborn-accent/20", glow: "hover:border-reborn-accent/40 hover:shadow-reborn-accent/5", badge: "bg-reborn-accent/10 text-reborn-accent", bar: "bg-reborn-accent" },
  { border: "border-purple-500/20",    glow: "hover:border-purple-500/40 hover:shadow-purple-500/5",    badge: "bg-purple-500/10 text-purple-400",    bar: "bg-purple-500"    },
  { border: "border-emerald-500/20",   glow: "hover:border-emerald-500/40 hover:shadow-emerald-500/5",  badge: "bg-emerald-500/10 text-emerald-400",  bar: "bg-emerald-500"   },
];

interface GoalCardProps {
  goal: UserGoal;
  completedTaskIndices: number[];
  colorIndex?: number;
}

export default function GoalCard({ goal, completedTaskIndices, colorIndex = 0 }: GoalCardProps) {
  const [completed, setCompleted] = useState<Set<number>>(new Set(completedTaskIndices));
  const [justCompleted, setJustCompleted] = useState<Set<number>>(new Set());
  const [flashedTasks, setFlashedTasks] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const palette = goalColors[colorIndex % goalColors.length];
  const allTasks: DailyTask[] = goal.daily_tasks ?? [];

  // Weekly rotation: if 6+ tasks, alternate between first 3 and last 3 each week
  const weeksSinceCreation = Math.floor(
    (Date.now() - new Date(goal.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  const weekOffset = allTasks.length >= 6 ? (weeksSinceCreation % 2) * 3 : 0;
  const todayTasks: DailyTask[] = allTasks.length >= 6
    ? allTasks.slice(weekOffset, weekOffset + 3)
    : allTasks;

  const completedCount = todayTasks.filter((_, i) => completed.has(weekOffset + i)).length;
  const progressPct = todayTasks.length > 0 ? (completedCount / todayTasks.length) * 100 : 0;
  const allDone = completedCount === todayTasks.length && todayTasks.length > 0;

  const toggleTask = (displayIndex: number) => {
    const taskIndex = weekOffset + displayIndex; // actual DB index
    const next = new Set(completed);
    const wasDone = next.has(taskIndex);
    if (wasDone) { next.delete(taskIndex); } else { next.add(taskIndex); }
    setCompleted(next);

    if (!wasDone) {
      // Trigger pop + flash animations
      const popped = new Set(justCompleted);
      popped.add(displayIndex);
      setJustCompleted(popped);
      setTimeout(() => {
        setJustCompleted((prev) => { const s = new Set(prev); s.delete(displayIndex); return s; });
      }, 400);

      setFlashedTasks((prev) => new Set(prev).add(displayIndex));
      setTimeout(() => {
        setFlashedTasks((prev) => { const s = new Set(prev); s.delete(displayIndex); return s; });
      }, 500);

      const newCount = [...next].filter((idx) =>
        idx >= weekOffset && idx < weekOffset + todayTasks.length
      ).length;
      if (newCount === todayTasks.length) {
        toast(`¡Meta completada hoy! 🎯`, "streak");
      } else {
        toast("Tarea completada ✓");
      }
    }

    const MILESTONE_MSGS: Record<number, string> = {
      1:  "¡Primer día de racha! 🔥",
      3:  "¡3 días seguidos! ¡Buena racha! 🔥",
      7:  "¡1 semana de racha! 🌟",
      14: "¡2 semanas seguidas! ¡Impresionante! 💎",
      30: "¡30 días de racha! ¡Eres un maestro! 🏆",
    };

    startTransition(async () => {
      const res = await fetch("/api/complete-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal_id: goal.id, task_index: taskIndex }),
      });
      if (!res.ok) {
        setCompleted(completed);
      } else {
        const data = await res.json();
        if (data.newRecord) {
          setTimeout(() => toast("¡Nuevo récord personal! 🏆", "streak"), 300);
        } else if (data.milestone && MILESTONE_MSGS[data.milestone]) {
          setTimeout(() => toast(MILESTONE_MSGS[data.milestone], "streak"), 400);
        }
        router.refresh();
      }
    });
  };

  return (
    <div className={`bg-reborn-card border rounded-2xl p-5 transition-all duration-300 hover:shadow-lg ${palette.border} ${palette.glow} ${allDone ? "ring-1 ring-green-500/30 glow-green" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-reborn-text leading-snug">{goal.title}</h3>
          {goal.description && (
            <p className="text-xs text-reborn-muted mt-0.5 line-clamp-1">{goal.description}</p>
          )}
        </div>
        <div className="ml-3 flex flex-col items-end gap-1 flex-shrink-0">
          <div className={`text-xs font-semibold rounded-full px-2.5 py-1 border ${palette.badge} ${palette.border}`}>
            {completedCount}/{todayTasks.length}
          </div>
          {(() => {
            const remaining = todayTasks.filter((_, i) => !completed.has(weekOffset + i));
            const mins = remaining.reduce((s, t) => s + (t.estimated_minutes ?? 10), 0);
            if (mins === 0 || allDone) return null;
            return <span className="text-xs text-reborn-muted/50">~{mins}min</span>;
          })()}
          {allTasks.length >= 6 && (
            <span className="text-xs text-reborn-muted/40" title="Tus tareas rotan semana a semana para mayor variedad">
              Plan {weeksSinceCreation % 2 === 0 ? "A" : "B"}
            </span>
          )}
        </div>
      </div>

      {/* Target date */}
      {goal.target_date && (() => {
        const days = Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / 86400000);
        if (days < 0) return null;
        return (
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-xs text-reborn-muted">🗓</span>
            <span className={`text-xs ${days <= 7 ? "text-orange-400" : "text-reborn-muted"}`}>
              {days === 0 ? "¡Fecha objetivo: hoy!" : `${days} día${days === 1 ? "" : "s"} restante${days === 1 ? "" : "s"}`}
            </span>
          </div>
        );
      })()}

      {/* AI overview */}
      {goal.ai_plan?.overview && (
        <div className="flex items-start gap-2 mb-3">
          <span className="text-xs text-reborn-accent/50 flex-shrink-0 mt-0.5">✦</span>
          <p className="text-xs text-reborn-muted/70 leading-relaxed line-clamp-2">
            {goal.ai_plan.overview}
          </p>
        </div>
      )}

      {/* Progress bar */}
      {todayTasks.length > 0 && (
        <div className="mb-4">
          <ProgressBar
            value={progressPct}
            color={allDone ? "bg-green-500" : palette.bar}
            showPercent={false}
          />
        </div>
      )}

      {/* Tasks */}
      {todayTasks.length > 0 ? (
        <ul className="space-y-2">
          {todayTasks.map((task, i) => {
            const done = completed.has(weekOffset + i);
            return (
              <li key={i}>
                <button
                  onClick={() => toggleTask(i)}
                  disabled={isPending}
                  className={`group/task w-full flex items-center gap-3 text-left rounded-xl px-3 py-3 transition-all duration-200 active:scale-[0.98] ${flashedTasks.has(i) ? "task-complete-flash" : ""} ${
                    done
                      ? "bg-green-500/5 border border-green-500/20"
                      : "bg-reborn-bg/60 border border-reborn-border hover:border-reborn-accent/30 hover:bg-reborn-accent/3"
                  }`}
                >
                  {/* Checkbox */}
                  <div
                    className={`flex-shrink-0 rounded border-2 flex items-center justify-center transition-all duration-200 ${justCompleted.has(i) ? "animate-pop" : ""} ${!done ? "group-hover/task:border-reborn-accent/60" : ""}`}
                    style={{ width: 20, height: 20, minWidth: 20, borderColor: done ? "#22c55e" : "#52525b", backgroundColor: done ? "#22c55e" : "transparent" }}
                  >
                    {done && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-snug ${done ? "line-through text-reborn-muted" : "text-reborn-text"}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-reborn-muted mt-0.5 line-clamp-1">{task.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!done && (
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        (task.estimated_minutes ?? 10) <= 10
                          ? "text-green-400/70"
                          : (task.estimated_minutes ?? 10) <= 20
                          ? "text-yellow-400/70"
                          : "text-orange-400/70"
                      }`}>
                        {(task.estimated_minutes ?? 10) <= 10 ? "⚡" : (task.estimated_minutes ?? 10) <= 20 ? "●" : "🔥"}
                      </span>
                    )}
                    <span className="text-xs text-reborn-muted whitespace-nowrap">~{task.estimated_minutes ?? 10}min</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 py-5 rounded-xl border border-dashed border-reborn-border/60 bg-reborn-bg/30">
          <span className="text-2xl">✨</span>
          <p className="text-xs text-reborn-muted text-center leading-relaxed">
            Sin tareas para hoy.<br />Regenera el plan para generar nuevas tareas.
          </p>
          <a
            href="/dashboard/onboarding"
            className="text-xs font-medium text-reborn-accent hover:text-reborn-accent-hover border border-reborn-accent/20 hover:border-reborn-accent/40 rounded-lg px-3 py-1.5 transition-all"
          >
            Regenerar plan →
          </a>
        </div>
      )}

      {/* All done banner */}
      {allDone && (
        <div className="mt-3 flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/25 rounded-xl py-2.5 px-3 glow-green">
          <span className="text-base">🎯</span>
          <div>
            <p className="text-xs font-bold text-green-400">¡Meta completada hoy!</p>
            <p className="text-xs text-green-400/60">Vuelve mañana para las siguientes tareas</p>
          </div>
        </div>
      )}

      {/* Milestones — visual timeline */}
      {goal.ai_plan?.milestones && goal.ai_plan.milestones.length > 0 && (
        <details className="mt-4 group">
          <summary className="text-xs text-reborn-muted cursor-pointer hover:text-reborn-text-secondary transition-colors list-none flex items-center gap-1.5 select-none">
            <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Ver hitos del plan
          </summary>
          <div className="mt-3 relative pl-5">
            {/* Vertical line */}
            <div className="absolute left-1.5 top-1 bottom-1 w-px bg-reborn-border" />
            {goal.ai_plan.milestones.map((m, i) => (
              <div key={i} className="relative mb-3 last:mb-0">
                {/* Dot */}
                <div className={`absolute -left-[14px] top-1 w-2.5 h-2.5 rounded-full ring-2 ring-reborn-card ${palette.bar} opacity-70`} />
                <p className="text-xs text-reborn-muted leading-relaxed">
                  <span className={`font-semibold mr-1 ${palette.badge.split(" ")[1]}`}>
                    {i + 1}.
                  </span>
                  {m}
                </p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
