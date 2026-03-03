"use client";

import { useEffect } from "react";

const COLORS = [
  "#3b82f6", "#a855f7", "#f59e0b", "#22c55e",
  "#f97316", "#ec4899", "#60a5fa", "#c084fc",
  "#fbbf24", "#34d399",
];

function fireConfetti() {
  const count = 90;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const isCircle = Math.random() > 0.55;
    const size = 5 + Math.random() * 9;

    Object.assign(el.style, {
      position: "fixed",
      top: "45%",
      left: "50%",
      width: `${size}px`,
      height: `${size}px`,
      background: color,
      borderRadius: isCircle ? "50%" : "2px",
      pointerEvents: "none",
      zIndex: "9999",
    });

    document.body.appendChild(el);

    const angle = Math.random() * 2 * Math.PI;
    const speed = 80 + Math.random() * 320;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed - 200; // strong upward bias
    const rotation = -360 + Math.random() * 720;
    const delay = Math.random() * 350;
    const duration = 900 + Math.random() * 800;

    const anim = el.animate(
      [
        { transform: "translate(-50%, -50%) scale(1) rotate(0deg)", opacity: 1 },
        {
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.15) rotate(${rotation}deg)`,
          opacity: 0,
        },
      ],
      {
        duration,
        delay,
        easing: "cubic-bezier(0.215, 0.61, 0.355, 1)",
        fill: "forwards",
      }
    );

    anim.onfinish = () => el.remove();
  }
}

export default function DailyCompleteEffect({ isComplete }: { isComplete: boolean }) {
  useEffect(() => {
    if (!isComplete) return;

    try {
      const today = new Date().toDateString();
      const key = `confetti_${today}`;
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // ignore sessionStorage errors (SSR, private browsing)
    }

    const timer = setTimeout(fireConfetti, 400);
    return () => clearTimeout(timer);
  }, [isComplete]);

  return null;
}
