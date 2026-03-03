interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  color?: string;
  showPercent?: boolean;
}

export default function ProgressBar({
  value,
  label,
  color = "bg-reborn-accent",
  showPercent = true,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-xs font-medium text-reborn-text-secondary">
              {label}
            </span>
          )}
          {showPercent && (
            <span className="text-xs font-semibold text-reborn-text ml-auto">
              {pct}%
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2.5 bg-reborn-border/70 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color} ${pct === 100 ? "shadow-sm" : ""}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
