import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import Footer from "@/components/Footer";
import { getTodayPicks } from "@/lib/db";
import { mockPicks } from "@/lib/mock-data";

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
          <h2 className="text-3xl sm:text-4xl font-bold text-reborn-text mb-3">
            Lo mejor de IA, hoy
          </h2>
          <p className="text-reborn-text-secondary max-w-lg mx-auto">
            Cada día seleccionamos los 4 posts más relevantes sobre Inteligencia
            Artificial de Reddit y Hacker News, curados por IA.
          </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {picks.map((pick, index) => (
            <ArticleCard key={pick.id} pick={pick} index={index} />
          ))}
        </div>

        {/* Info note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-reborn-muted/60">
            Actualizado diariamente a medianoche · Curado con Claude (Anthropic)
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
