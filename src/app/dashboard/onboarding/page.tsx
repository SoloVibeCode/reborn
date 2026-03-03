"use client";

import { useState } from "react";
import Link from "next/link";
import { TOPICS } from "@/lib/topics";

const MAX_SELECTIONS = 3;

export default function OnboardingPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECTIONS) return prev;
      return [...prev, id];
    });
  };

  const handleSubmit = async () => {
    if (selected.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/select-topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic_ids: selected }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Error al guardar tu selección");
      }
      // Hard navigation — avoids Next.js 15 soft-nav race with server state
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado. Inténtalo de nuevo.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-reborn-bg px-4 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-reborn-accent to-purple-500 flex items-center justify-center">
          <span className="text-white font-bold text-lg">R</span>
        </div>
        <div>
          <p className="text-lg font-bold text-reborn-text leading-none">Reborn</p>
          <p className="text-xs text-reborn-muted">from zero to hero</p>
        </div>
      </Link>

      {/* Header */}
      <div className="text-center mb-8 max-w-xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-reborn-text mb-2">
          Elige hasta 3 áreas que quieres transformar
        </h1>
        <p className="text-sm text-reborn-muted">
          Recibirás tareas diarias de 5-25 minutos adaptadas a cada área. Puedes cambiarlas cuando quieras.
        </p>
      </div>

      {/* Topic grid */}
      <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {TOPICS.map((topic) => {
          const isSelected = selected.includes(topic.id);
          const isDisabled = !isSelected && selected.length >= MAX_SELECTIONS;
          return (
            <button
              key={topic.id}
              onClick={() => toggle(topic.id)}
              disabled={isDisabled}
              className={`relative text-left p-4 rounded-2xl border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-reborn-accent ${
                isSelected
                  ? "border-reborn-accent bg-reborn-accent/10 shadow-sm shadow-reborn-accent/20"
                  : isDisabled
                  ? "border-reborn-border bg-reborn-card opacity-40 cursor-not-allowed"
                  : "border-reborn-border bg-reborn-card hover:border-reborn-accent/50 hover:bg-reborn-accent/5 cursor-pointer"
              }`}
            >
              {/* Checkmark */}
              {isSelected && (
                <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-reborn-accent flex items-center justify-center text-white text-xs font-bold">
                  ✓
                </span>
              )}
              <span className="text-3xl mb-2 block">{topic.icon}</span>
              <p className="text-sm font-semibold text-reborn-text leading-snug mb-0.5">
                {topic.title}
              </p>
              <p className="text-xs text-reborn-muted leading-snug">{topic.description}</p>
            </button>
          );
        })}
      </div>

      {/* Selection counter + CTA */}
      <div className="w-full max-w-3xl flex flex-col items-center gap-3">
        <p className="text-xs text-reborn-muted">
          {selected.length === 0
            ? "Selecciona al menos 1 área"
            : `Seleccionadas: ${selected.length}/${MAX_SELECTIONS}`}
        </p>

        {error && (
          <div className="w-full max-w-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <p className="text-sm text-red-400 text-center">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={selected.length === 0 || submitting}
          className="w-full max-w-sm bg-reborn-accent hover:bg-reborn-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Guardando tu plan...
            </>
          ) : (
            "Empezar mi plan →"
          )}
        </button>
      </div>
    </div>
  );
}
