import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import Footer from "@/components/Footer";
import { getTodayPicks } from "@/lib/db";
import { mockPicks } from "@/lib/mock-data";
import Link from "next/link";
import { HomeSaveProgressLink, HomeLoginCTA } from "@/components/HomeCTA";

// Revalidate every 5 minutes (in case cron runs mid-day)
export const revalidate = 300;

export default async function Home() {
  let picks = await getTodayPicks().catch(() => []);

  // Fallback to mock data if no picks in DB (dev mode or first run)
  const usingMockData = picks.length === 0;
  if (usingMockData) {
    picks = mockPicks;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
        {/* Hero section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            <span className="text-xs font-medium text-green-400">
              Actualizado · {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            <span className="text-reborn-text">Lo mejor de </span>
            <span className="gradient-text">IA</span>
            <span className="text-reborn-text">, hoy</span>
          </h2>
          <p className="text-reborn-text-secondary max-w-lg mx-auto mb-6 text-base leading-relaxed">
            Cada día, Claude selecciona los <strong className="text-reborn-text">4 posts más relevantes</strong> sobre
            IA de Reddit y Hacker News. Crea tu cuenta gratis para seguir tu progreso y metas personales.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {[
              { icon: "📰", label: "4 posts diarios", cls: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
              { icon: "🤖", label: "Curado con Claude", cls: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
              { icon: "🔍", label: "Reddit + HN", cls: "bg-orange-500/10 border-orange-500/20 text-orange-400" },
            ].map(({ icon, label, cls }) => (
              <div key={label} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${cls}`}>
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dev mode indicator */}
        {usingMockData && (
          <div className="mb-6 text-center">
            <span className="inline-block text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full px-3 py-1">
              Modo desarrollo — datos de ejemplo
            </span>
          </div>
        )}

        {/* Cards grid */}
        {(() => {
          const totalMins = picks.reduce((acc, p) => {
            const words = ((p.summary ?? "") + " " + (p.reason ?? "")).trim().split(/\s+/).length;
            return acc + Math.max(1, Math.round(words / 200));
          }, 0);
          return (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-reborn-muted uppercase tracking-wider">
                  {picks.length} artículo{picks.length !== 1 ? "s" : ""} de hoy
                </span>
                {totalMins > 0 && (
                  <span className="text-xs text-reborn-muted/50">· ~{totalMins} min en total</span>
                )}
              </div>
              <HomeSaveProgressLink />
            </div>
          );
        })()}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {picks.map((pick, index) => (
            <div key={pick.id} className="card-enter" style={{ animationDelay: `${index * 80}ms` }}>
              <ArticleCard pick={pick} index={index} />
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-12 mb-8">
          <h3 className="text-center text-xs font-semibold text-reborn-muted uppercase tracking-widest mb-6">
            Cómo funciona
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: "📰",
                step: "01",
                title: "Lee los mejores posts",
                desc: "Cada día, los 4 artículos más relevantes sobre IA seleccionados de Reddit y Hacker News.",
              },
              {
                icon: "🎯",
                step: "02",
                title: "Define tus metas",
                desc: "Añade hasta 3 objetivos personales y obtén un plan de acción diario generado por Claude.",
              },
              {
                icon: "🔥",
                step: "03",
                title: "Construye tu racha",
                desc: "Completa artículos y tareas cada día para mantener tu racha y transformar tus hábitos.",
              },
            ].map(({ icon, step, title, desc }) => (
              <div key={step} className="bg-reborn-card/50 border border-reborn-border hover:border-reborn-accent/25 rounded-2xl p-5 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{icon}</span>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-reborn-accent/20 to-purple-500/20 border border-reborn-accent/25 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-reborn-accent">{step}</span>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-reborn-text mb-1">{title}</h4>
                <p className="text-xs text-reborn-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-8 mb-4 grid grid-cols-3 gap-0 divide-x divide-reborn-border bg-reborn-card/40 border border-reborn-border rounded-2xl overflow-hidden">
          {[
            { num: "4", label: "Posts cada día" },
            { num: "2", label: "Fuentes curadas" },
            { num: "∞", label: "Conocimiento de IA" },
          ].map(({ num, label }) => (
            <div key={label} className="flex flex-col items-center py-5">
              <span className="text-2xl font-bold text-reborn-text">{num}</span>
              <span className="text-xs text-reborn-muted mt-0.5">{label}</span>
            </div>
          ))}
        </div>

        {/* Login CTA banner — hidden for logged-in users */}
        <HomeLoginCTA />

        {/* Info note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-reborn-muted/60">
            Actualizado diariamente a medianoche · Curado con Claude (Anthropic)
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
