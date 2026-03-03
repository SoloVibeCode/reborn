"use client";

import { useState } from "react";

interface Props {
  links: string[];
  completedIds: string[];
  allIds: string[];
}

export default function OpenAllArticlesButton({ links, completedIds, allIds }: Props) {
  const [opening, setOpening] = useState(false);
  const unreadLinks = links.filter((_, i) => !completedIds.includes(allIds[i]));
  if (unreadLinks.length === 0) return null;

  const handleOpenAll = () => {
    setOpening(true);
    unreadLinks.forEach((link) => window.open(link, "_blank", "noopener,noreferrer"));
    setTimeout(() => setOpening(false), 1500);
  };

  return (
    <button
      onClick={handleOpenAll}
      disabled={opening}
      className="flex items-center gap-1.5 text-xs text-reborn-muted hover:text-reborn-text-secondary border border-reborn-border hover:border-reborn-accent/30 rounded-full px-3 py-1 transition-all disabled:opacity-60"
      title={`Abrir ${unreadLinks.length} artículo${unreadLinks.length > 1 ? "s" : ""} no leído${unreadLinks.length > 1 ? "s" : ""}`}
    >
      {opening ? (
        <>
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Abriendo...</span>
        </>
      ) : (
        <span>Abrir {unreadLinks.length} no leído{unreadLinks.length > 1 ? "s" : ""} ↗</span>
      )}
    </button>
  );
}
