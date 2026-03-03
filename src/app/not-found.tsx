import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-reborn-bg px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-reborn-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative text-center max-w-sm">
        {/* Logo with glow */}
        <div className="relative w-16 h-16 mx-auto mb-8">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-reborn-accent to-purple-500 opacity-20 blur-xl scale-150" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-reborn-accent to-purple-500 flex items-center justify-center shadow-lg shadow-reborn-accent/20">
            <span className="text-white font-bold text-2xl">R</span>
          </div>
        </div>

        {/* 404 with gradient */}
        <div className="text-8xl font-black mb-2 gradient-text select-none">404</div>
        <h2 className="text-xl font-semibold text-reborn-text mb-3">
          Página no encontrada
        </h2>
        <p className="text-sm text-reborn-text-secondary mb-8 leading-relaxed">
          Esta página no existe, pero tus metas siguen esperándote.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-reborn-accent hover:bg-reborn-accent-hover text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-all hover:scale-[1.02] shadow-md shadow-reborn-accent/20"
          >
            ← Volver al inicio
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 border border-reborn-border hover:border-reborn-accent/40 text-reborn-text-secondary hover:text-reborn-text text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Mi dashboard
          </Link>
        </div>

        <p className="mt-8 text-xs text-reborn-muted/40">
          ¿Problema con la app? <a href="mailto:hola@rebornfromzerotohero.com" className="hover:text-reborn-muted transition-colors underline underline-offset-2">Escríbenos</a>
        </p>
      </div>
    </div>
  );
}
