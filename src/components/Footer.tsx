import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-reborn-border mt-16">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-reborn-accent to-purple-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-reborn-accent/20">
              <span className="text-white font-bold text-xs">R</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-reborn-text leading-none">Reborn</p>
              <p className="text-xs text-reborn-muted mt-0.5">from zero to hero</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-5 text-xs text-reborn-muted">
            <Link href="/" className="hover:text-reborn-text-secondary transition-colors">
              Inicio
            </Link>
            <Link href="/dashboard" className="hover:text-reborn-text-secondary transition-colors">
              Dashboard
            </Link>
            <Link href="/auth?mode=register" className="hover:text-reborn-text-secondary transition-colors">
              Crear cuenta
            </Link>
            <a
              href="https://anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-reborn-text-secondary transition-colors"
            >
              Powered by Claude
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-reborn-border/50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-reborn-muted/50">
            © {year} Reborn · Actualizado diariamente · Fuentes: Reddit & Hacker News
          </p>
          <p className="text-xs text-reborn-muted/50">
            Curado con{" "}
            <a href="https://anthropic.com" target="_blank" rel="noopener noreferrer" className="text-reborn-accent/60 hover:text-reborn-accent transition-colors">Claude</a> (Anthropic)
          </p>
        </div>
      </div>
    </footer>
  );
}
