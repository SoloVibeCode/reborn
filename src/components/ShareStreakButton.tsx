"use client";

import { toast } from "@/components/Toast";

export default function ShareStreakButton({ streak }: { streak: number }) {
  if (streak < 2) return null;

  const handleShare = async () => {
    const text = `🔥 Llevo ${streak} día${streak === 1 ? "" : "s"} de racha leyendo sobre IA con Reborn.\nÚnete en rebornfromzerotohero.com`;

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ text, title: "Mi racha en Reborn" });
      } else {
        await navigator.clipboard.writeText(text);
        toast("¡Copiado al portapapeles! 📋");
      }
    } catch {
      // user cancelled share dialog — do nothing
    }
  };

  return (
    <button
      onClick={handleShare}
      className="text-xs text-reborn-muted hover:text-orange-400 transition-colors flex items-center gap-1.5 mt-1.5 group"
    >
      <svg className="w-3 h-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
      <span>Compartir racha</span>
    </button>
  );
}
