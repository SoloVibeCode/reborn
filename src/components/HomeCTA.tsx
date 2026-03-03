"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";

export function HomeSaveProgressLink() {
  const { user } = useAuth();

  if (user) {
    return (
      <Link
        href="/dashboard"
        className="text-xs text-reborn-accent hover:text-reborn-accent-hover transition-colors font-medium"
      >
        Mi dashboard →
      </Link>
    );
  }

  return (
    <Link
      href="/auth?mode=register"
      className="text-xs text-reborn-accent hover:text-reborn-accent-hover transition-colors font-medium"
    >
      Guardar progreso →
    </Link>
  );
}

export function HomeLoginCTA() {
  const { user, loading } = useAuth();

  if (loading || user) return null;

  return (
    <div className="mt-6 relative overflow-hidden bg-gradient-to-br from-reborn-accent/10 via-purple-500/8 to-reborn-card border border-reborn-accent/25 rounded-2xl p-8">
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-reborn-accent/3 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
      <div className="relative text-center">
        <div className="text-4xl mb-4">🚀</div>
        <h3 className="text-xl font-bold text-reborn-text mb-2">
          Convierte la IA en tu ventaja competitiva
        </h3>
        <p className="text-sm text-reborn-text-secondary mb-5 max-w-md mx-auto leading-relaxed">
          Crea tu cuenta gratis, define hasta 3 metas personales y obtén un plan de acción diario generado por Claude.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
          <Link
            href="/auth?mode=register"
            className="inline-flex items-center gap-2 bg-reborn-accent hover:bg-reborn-accent-hover text-white text-sm font-semibold px-7 py-3 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-reborn-accent/20"
          >
            <span>Crear cuenta gratis</span>
            <span>→</span>
          </Link>
          <Link
            href="/auth"
            className="text-sm text-reborn-text-secondary hover:text-reborn-text transition-colors"
          >
            Ya tengo cuenta →
          </Link>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-reborn-muted/60">
          <span>✓ Sin tarjeta de crédito</span>
          <span>·</span>
          <span>✓ Gratis para siempre</span>
          <span>·</span>
          <span>✓ Sin spam</span>
        </div>
      </div>
    </div>
  );
}
