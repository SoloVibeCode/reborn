"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-reborn-bg px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-6">⚠️</div>
        <h2 className="text-xl font-bold text-reborn-text mb-3">
          Algo salió mal
        </h2>
        <p className="text-sm text-reborn-text-secondary mb-6">
          No se pudo cargar el dashboard. Por favor, inténtalo de nuevo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center bg-reborn-accent hover:bg-reborn-accent-hover text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-all hover:scale-[1.02]"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-reborn-border hover:border-reborn-accent/40 text-reborn-text-secondary hover:text-reborn-text text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
