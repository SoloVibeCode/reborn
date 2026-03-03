interface StreakBadgeProps {
  streak: number;
  longest?: number;
}

function getMilestone(streak: number): { label: string; color: string } | null {
  if (streak >= 30) return { label: "¡Mes completo! 🏆", color: "text-yellow-400" };
  if (streak >= 14) return { label: "2 semanas 💎", color: "text-purple-400" };
  if (streak >= 7)  return { label: "1 semana 🌟", color: "text-blue-400" };
  if (streak >= 3)  return { label: "¡Buena racha!", color: "text-green-400" };
  return null;
}

function getFlames(streak: number): number {
  if (streak >= 30) return 3;
  if (streak >= 7)  return 2;
  if (streak >= 1)  return 1;
  return 0;
}

export default function StreakBadge({ streak, longest }: StreakBadgeProps) {
  const active = streak > 0;
  const milestone = getMilestone(streak);
  const flames = getFlames(streak);
  const isLegendary = streak >= 30;

  return (
    <div className="flex flex-col items-end gap-1">
      <div
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all ${
          isLegendary
            ? "bg-gradient-to-br from-orange-500/15 to-yellow-500/10 border-orange-400/40 streak-active"
            : active
            ? "bg-orange-500/10 border-orange-500/25 streak-active"
            : "bg-reborn-card border-reborn-border"
        }`}
      >
        {/* Flame(s) */}
        <div className="flex">
          {Array.from({ length: Math.max(1, flames) }).map((_, i) => (
            <span
              key={i}
              className={`text-xl leading-none ${active ? "animate-pulse" : "opacity-25"}`}
              style={{ animationDelay: `${i * 200}ms`, marginLeft: i > 0 ? "-6px" : 0 }}
            >
              🔥
            </span>
          ))}
        </div>

        <div className="flex items-baseline gap-1">
          {streak === 0 ? (
            <span className="text-xs text-reborn-muted leading-snug">
              Empieza<br />tu racha
            </span>
          ) : (
            <>
              <span className="text-xl font-bold leading-none text-orange-400">
                {streak}
              </span>
              <span className="text-xs leading-none text-orange-300/80">
                {streak === 1 ? "día" : "días"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Milestone badge */}
      {active && milestone && (
        <span className={`text-xs font-medium ${milestone.color}`}>
          {milestone.label}
        </span>
      )}

      {/* Record */}
      {active && !milestone && longest !== undefined && longest > 0 && (
        <span className="text-xs text-reborn-muted">
          Récord: <span className="text-reborn-text-secondary font-medium">{longest}d</span>
        </span>
      )}

      {/* Encouragement for zero streak */}
      {!active && (
        <span className="text-xs text-reborn-muted">¡Completa algo hoy!</span>
      )}
    </div>
  );
}
