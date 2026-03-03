"use client";

import { useEffect } from "react";
import { toast } from "@/components/Toast";

// Re-use the same confetti burst logic
const COLORS = [
  "#3b82f6", "#a855f7", "#f59e0b", "#22c55e",
  "#f97316", "#ec4899", "#fbbf24", "#34d399",
];

function fireConfetti(origin: { x: number; y: number }) {
  const count = 60;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const isCircle = Math.random() > 0.55;
    const size = 5 + Math.random() * 8;

    Object.assign(el.style, {
      position: "fixed",
      top: `${origin.y}px`,
      left: `${origin.x}px`,
      width: `${size}px`,
      height: `${size}px`,
      background: color,
      borderRadius: isCircle ? "50%" : "2px",
      pointerEvents: "none",
      zIndex: "9999",
    });

    document.body.appendChild(el);

    const angle = Math.random() * 2 * Math.PI;
    const speed = 60 + Math.random() * 200;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed - 120;
    const rotation = -360 + Math.random() * 720;
    const delay = Math.random() * 250;
    const duration = 800 + Math.random() * 600;

    const anim = el.animate(
      [
        { transform: "translate(-50%, -50%) scale(1) rotate(0deg)", opacity: 1 },
        {
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.1) rotate(${rotation}deg)`,
          opacity: 0,
        },
      ],
      { duration, delay, easing: "cubic-bezier(0.215, 0.61, 0.355, 1)", fill: "forwards" }
    );
    anim.onfinish = () => el.remove();
  }
}

interface LevelUpEffectProps {
  levelLabel: string;
  levelIcon: string;
}

export default function LevelUpEffect({ levelLabel, levelIcon }: LevelUpEffectProps) {
  useEffect(() => {
    // Skip the first level (Curioso) — everyone starts there
    if (levelLabel === "Curioso") return;

    try {
      const key = `level_up_${levelLabel}`;
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, new Date().toISOString());
    } catch {
      return;
    }

    // Small delay so user sees the dashboard first
    const timer = setTimeout(() => {
      // Fire confetti from the top of the page
      fireConfetti({ x: window.innerWidth / 2, y: window.innerHeight * 0.35 });
      // Show toast
      toast(`${levelIcon} ¡Nuevo nivel desbloqueado: ${levelLabel}!`, "streak");
    }, 800);

    return () => clearTimeout(timer);
  }, [levelLabel, levelIcon]);

  return null;
}
