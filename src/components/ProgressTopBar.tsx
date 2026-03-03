"use client";

interface ProgressTopBarProps {
  value: number; // 0-100
}

export default function ProgressTopBar({ value }: ProgressTopBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  const isComplete = pct === 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none">
      <div
        className={`h-full transition-all duration-700 ease-out ${
          isComplete
            ? "bg-green-500 shadow-sm shadow-green-500/40"
            : "bg-gradient-to-r from-reborn-accent to-purple-500"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
