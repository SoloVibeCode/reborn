export default function Footer() {
  return (
    <footer className="border-t border-reborn-border mt-16">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-reborn-muted">
          Reborn &mdash; Los 4 mejores posts de IA, cada día.
        </p>
        <p className="text-xs text-reborn-muted/60">
          Curado con IA por{" "}
          <a
            href="https://anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-reborn-text-secondary transition-colors"
          >
            Claude
          </a>
        </p>
      </div>
    </footer>
  );
}
