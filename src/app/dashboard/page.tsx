import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";
import {
  getOrCreateProfile,
  getUserGoals,
  getTodayCompletedArticles,
  getTodayCompletedTasks,
  getStreak,
  getTotalCompletedArticles,
  getWeeklyStats,
} from "@/lib/db-user";
import { getTodayPicks } from "@/lib/db";
import { mockPicks } from "@/lib/mock-data";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProgressBar from "@/components/ProgressBar";
import StreakBadge from "@/components/StreakBadge";
import DashboardArticleCard from "@/components/DashboardArticleCard";
import GoalCard from "@/components/GoalCard";
import OpenAllArticlesButton from "@/components/OpenAllArticlesButton";
import DailyCompleteEffect from "@/components/DailyCompleteEffect";
import ShareStreakButton from "@/components/ShareStreakButton";
import LevelUpEffect from "@/components/LevelUpEffect";
import ProgressTopBar from "@/components/ProgressTopBar";
import Link from "next/link";

const AI_LEVELS = [
  { min: 0,   label: "Curioso",    icon: "🌱", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  { min: 5,   label: "Aprendiz",   icon: "📚", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  { min: 15,  label: "Explorador", icon: "🔍", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { min: 30,  label: "Avanzado",   icon: "⚡", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { min: 60,  label: "Experto",    icon: "🧠", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { min: 100, label: "Maestro",    icon: "🏆", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
];

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  const [profile, goals, streak, picks, totalArticlesRead, weeklyStats] = await Promise.all([
    getOrCreateProfile(user.id),
    getUserGoals(user.id),
    getStreak(user.id),
    getTodayPicks().catch(() => []),
    getTotalCompletedArticles(user.id),
    getWeeklyStats(user.id),
  ]);

  if (!profile?.onboarding_completed) redirect("/dashboard/onboarding");

  const displayPicks = picks.length > 0 ? picks : mockPicks;
  const usingMockData = picks.length === 0;

  const [completedArticleIds, completedTasks] = await Promise.all([
    getTodayCompletedArticles(user.id),
    getTodayCompletedTasks(user.id),
  ]);

  const maxArticles = displayPicks.length;
  // With weekly rotation, goals with 6 tasks only show 3 at a time; otherwise show all
  const maxTasks = goals.reduce((acc, g) => {
    const len = g.daily_tasks?.length ?? 0;
    return acc + (len >= 6 ? 3 : len);
  }, 0);
  const totalItems = maxArticles + maxTasks;
  const completedArticlesCount = completedArticleIds.length;
  const completedTasksCount = completedTasks.length;
  const totalCompleted = completedArticlesCount + completedTasksCount;
  const dailyProgressPct = totalItems > 0 ? (totalCompleted / totalItems) * 100 : 0;
  const aiProgressPct = maxArticles > 0 ? (completedArticlesCount / maxArticles) * 100 : 0;

  // Compute total estimated minutes for uncompleted tasks today
  const taskMinutesLeft = goals.reduce((acc, goal) => {
    const allTasks = goal.daily_tasks ?? [];
    const weeksSince = Math.floor((Date.now() - new Date(goal.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000));
    const offset = allTasks.length >= 6 ? (weeksSince % 2) * 3 : 0;
    const todayTasks = allTasks.length >= 6 ? allTasks.slice(offset, offset + 3) : allTasks;
    const completedForGoal = completedTasks.filter((t) => t.goal_id === goal.id).map((t) => t.task_index);
    return acc + todayTasks
      .filter((_, i) => !completedForGoal.includes(offset + i))
      .reduce((s, t) => s + (t.estimated_minutes ?? 10), 0);
  }, 0);
  const articleMinutesLeft = displayPicks
    .filter((p) => !completedArticleIds.includes(p.id))
    .reduce((acc, p) => acc + Math.max(1, Math.round(((p.summary ?? "") + " " + (p.reason ?? "")).trim().split(/\s+/).length / 200)), 0);
  const totalMinutesLeft = taskMinutesLeft + articleMinutesLeft;

  const displayName = profile?.display_name ?? user.email?.split("@")[0] ?? "Usuario";
  const hour = new Date().getHours();
  const greeting = hour < 13 ? "Buenos días" : hour < 20 ? "Buenas tardes" : "Buenas noches";
  const dateStr = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  // Show streak-at-risk banner after 8pm if user hasn't completed anything and has an active streak
  const streakAtRisk = hour >= 20 && totalCompleted === 0 && (streak?.current_streak ?? 0) >= 2;
  const level = [...AI_LEVELS].reverse().find((l) => totalArticlesRead >= l.min) ?? AI_LEVELS[0];
  const nextLevel = AI_LEVELS[AI_LEVELS.findIndex((l) => l === level) + 1];

  return (
    <div className="min-h-screen flex flex-col bg-reborn-bg">
      <ProgressTopBar value={dailyProgressPct} />
      <DailyCompleteEffect isComplete={dailyProgressPct === 100} />
      <LevelUpEffect levelLabel={level.label} levelIcon={level.icon} />
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">

        {/* Welcome + Streak */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-reborn-text">
              {greeting}, {displayName} 👋
            </h2>
            <p className="text-sm text-reborn-text-secondary mt-0.5">
              {dailyProgressPct === 100
                ? "¡Día completado! Increíble trabajo hoy 🎉"
                : dailyProgressPct >= 50
                ? `¡A mitad de camino! ${totalItems - totalCompleted} más y lo tienes 💪`
                : totalCompleted === 0 && totalMinutesLeft > 0
                ? `${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)} · ~${totalMinutesLeft} min de tareas te esperan`
                : totalCompleted === 0
                ? `${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)} · ¡Empieza tu día!`
                : `${totalCompleted} de ${totalItems} completados — ¡sigue así!`}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${level.color}`}>
                <span>{level.icon}</span>
                <span>{level.label}</span>
              </span>
              {nextLevel ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1.5 bg-reborn-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-reborn-accent to-purple-500"
                      style={{ width: `${Math.min(100, Math.round(((totalArticlesRead - level.min) / (nextLevel.min - level.min)) * 100))}%` }}
                    />
                  </div>
                  <span className="text-xs text-reborn-muted/60">
                    {nextLevel.min - totalArticlesRead} para {nextLevel.icon}
                  </span>
                </div>
              ) : totalArticlesRead >= 100 ? (
                <span className="text-xs text-yellow-400 font-medium">¡Nivel máximo! 🏆</span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <StreakBadge streak={streak?.current_streak ?? 0} longest={streak?.longest_streak} />
            <ShareStreakButton streak={streak?.current_streak ?? 0} />
          </div>
        </div>

        {/* Streak at risk banner */}
        {streakAtRisk && (
          <div className="mb-6 flex items-center gap-3 bg-orange-500/8 border border-orange-500/25 rounded-xl px-4 py-3">
            <span className="text-xl flex-shrink-0 animate-pulse">🔥</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-orange-400">¡Tu racha de {streak!.current_streak} días está en riesgo!</p>
              <p className="text-xs text-orange-400/60 mt-0.5">Completa al menos un artículo o tarea antes de medianoche para mantenerla.</p>
            </div>
          </div>
        )}

        {/* Daily progress card */}
        <div className={`rounded-2xl p-5 mb-8 border transition-all ${
          dailyProgressPct === 100
            ? "bg-green-500/5 border-green-500/20 glow-green"
            : "bg-reborn-card border-reborn-border"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <h3 className="text-sm font-semibold text-reborn-text">Progreso del día</h3>
              {totalMinutesLeft > 0 && dailyProgressPct < 100 && (
                <span className="text-xs text-reborn-muted/60">~{totalMinutesLeft} min restantes</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-reborn-muted">{totalCompleted}/{totalItems}</span>
              <span className={`text-lg font-bold tabular-nums ${
                dailyProgressPct === 100 ? "text-green-400" : "text-reborn-text"
              }`}>
                {Math.round(dailyProgressPct)}%
              </span>
            </div>
          </div>
          <ProgressBar
            value={dailyProgressPct}
            color={dailyProgressPct === 100 ? "bg-green-500" : "bg-gradient-to-r from-reborn-accent to-purple-500"}
            showPercent={false}
          />
          {dailyProgressPct === 100 && (
            <div className="mt-3 text-center">
              <p className="text-sm text-green-400 font-semibold animate-pulse">
                🎉 ¡Día completado! Tu racha sigue creciendo.
              </p>
              <p className="text-xs text-green-400/60 mt-1">Vuelve mañana para nuevos artículos y tareas</p>
            </div>
          )}
        </div>

        {/* Daily tip — contextual based on user state */}
        {(() => {
          const isNewUser = totalArticlesRead === 0 && (streak?.current_streak ?? 0) <= 1;
          const streakTip = (streak?.current_streak ?? 0) >= 7
            ? { icon: "🏆", text: `¡${streak!.current_streak} días de racha! Estás en el top 10% de usuarios más constantes. ¡Imparable!` }
            : null;
          const tips = [
            { icon: "⚡", text: "Claude curó estos posts entre miles de publicaciones — estás leyendo lo mejor del día." },
            { icon: "🧠", text: "15 minutos de lectura sobre IA al día te mantiene en el top 5% de la industria." },
            { icon: "🔥", text: "Las rachas de 7+ días están en el top 10% de apps de hábitos. ¡Sigue así!" },
            { icon: "🎯", text: "Metas pequeñas y específicas se cumplen 3× más que las metas grandes y vagas." },
            { icon: "🚀", text: "Completar tareas pequeñas cada día supera con creces a las maratones semanales." },
            { icon: "🌟", text: "Cada post que lees fue el más votado y debatido de su área hoy en Reddit y HN." },
            { icon: "💡", text: "La consistencia supera a la intensidad. 10 minutos diarios > 2 horas los domingos." },
            { icon: "🤖", text: "La IA avanza tan rápido que quedarse al día requiere hábitos, no maratones. Estás haciéndolo bien." },
            { icon: "📈", text: "Los profesionales que leen sobre IA a diario tienen un 40% más de probabilidad de liderar proyectos de IA en su empresa." },
            { icon: "🌍", text: "Reddit y Hacker News son las mejores fuentes de señal real sobre IA — filtradas por miles de expertos cada día." },
            { icon: "🏗️", text: "Las empresas que adoptan IA crecen 2× más rápido. Entender el ecosistema es tu ventaja competitiva." },
            { icon: "⏱️", text: "Solo necesitas 10-15 minutos al día para mantenerte al día con los cambios más importantes en IA." },
            { icon: "🎓", text: "Los mejores ingenieros no solo construyen — también leen, reflexionan y conectan ideas. Eso es lo que haces tú aquí." },
          ];
          // Rotate by day-of-year for more variety (not same tip every Monday forever)
          const start = new Date(new Date().getFullYear(), 0, 0);
          const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000);
          const tip = isNewUser
            ? { icon: "👋", text: "¡Bienvenido! Empieza marcando los artículos como leídos y completando las tareas de tus metas para ganar tu primera racha." }
            : streakTip ?? tips[dayOfYear % tips.length];
          return (
            <div className="mb-6 flex items-center gap-3 bg-reborn-card/30 border border-reborn-border/60 rounded-xl px-4 py-3">
              <span className="text-lg flex-shrink-0">{tip.icon}</span>
              <p className="text-xs text-reborn-muted leading-relaxed">{tip.text}</p>
            </div>
          );
        })()}

        {/* Articles */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-reborn-text flex items-center gap-2">
              {aiProgressPct === 100 ? "✅" : "📰"}
              <span>Posts de IA de hoy</span>
              {aiProgressPct === 100 && (
                <span className="text-sm font-normal text-green-400">Todo leído</span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {usingMockData && (
                <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full px-2.5 py-1">
                  Datos de ejemplo
                </span>
              )}
              <OpenAllArticlesButton
                links={displayPicks.map((p) => p.link_post)}
                completedIds={completedArticleIds}
                allIds={displayPicks.map((p) => p.id)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {displayPicks.map((pick, idx) => (
              <div key={pick.id} className="card-enter" style={{ animationDelay: `${idx * 80}ms` }}>
                <DashboardArticleCard
                  pick={pick}
                  initialCompleted={completedArticleIds.includes(pick.id)}
                  rank={idx + 1}
                />
              </div>
            ))}
          </div>

          <ProgressBar
            value={aiProgressPct}
            label={`Artículos leídos hoy (${completedArticlesCount}/${maxArticles})${aiProgressPct === 100 ? " ✓" : ""}`}
            color={aiProgressPct === 100 ? "bg-green-500" : "bg-purple-500"}
          />
          {aiProgressPct === 100 && (
            <div className="mt-3 text-center text-xs text-green-400/80 font-medium">
              🎉 ¡Has leído todos los posts de IA de hoy!
            </div>
          )}
        </section>

        {/* Goals */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-reborn-text flex items-center gap-2">
              🎯 <span>Mis metas de hoy</span>
            </h3>
            <Link href="/dashboard/onboarding" className="text-xs text-reborn-muted hover:text-reborn-text-secondary transition-colors">
              Editar metas →
            </Link>
          </div>

          {goals.length === 0 ? (
            <div className="relative overflow-hidden bg-gradient-to-br from-reborn-accent/8 via-purple-500/5 to-reborn-card border border-reborn-accent/20 rounded-2xl p-8 text-center">
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
              <div className="relative">
                <div className="text-4xl mb-3">🎯</div>
                <h4 className="text-base font-bold text-reborn-text mb-2">
                  Obtén tu plan de acción personalizado
                </h4>
                <p className="text-sm text-reborn-text-secondary mb-4 max-w-xs mx-auto leading-relaxed">
                  Define hasta 3 metas y Claude generará tareas diarias específicas para ti.
                </p>
                <div className="flex items-center justify-center gap-2 mb-5 flex-wrap">
                  {["Aprender Python", "Hacer ejercicio", "Mejorar inglés"].map((eg) => (
                    <span key={eg} className="text-xs text-reborn-muted/70 bg-reborn-bg/60 border border-reborn-border/50 rounded-full px-2.5 py-1">{eg}</span>
                  ))}
                </div>
                <Link
                  href="/dashboard/onboarding"
                  className="inline-flex items-center gap-2 bg-reborn-accent hover:bg-reborn-accent-hover text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-all hover:scale-[1.02] shadow-md shadow-reborn-accent/20"
                >
                  <span>Crear mi plan con IA</span>
                  <span>✨</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal, idx) => {
                const goalCompletedIndices = completedTasks
                  .filter((t) => t.goal_id === goal.id)
                  .map((t) => t.task_index);
                return (
                  <div key={goal.id} className="card-enter" style={{ animationDelay: `${(displayPicks.length + idx) * 80}ms` }}>
                    <GoalCard
                      goal={goal}
                      completedTaskIndices={goalCompletedIndices}
                      colorIndex={idx}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Streak week visualization */}
        {streak && (streak.current_streak > 0 || (streak.longest_streak ?? 0) > 0) && (
          <div className="mb-8 bg-reborn-card/40 border border-reborn-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">🔥</span>
                <span className="text-sm font-semibold text-reborn-text">Racha actual</span>
                {streak.current_streak >= 7 && (
                  <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-2 py-0.5">
                    {streak.current_streak >= 30 ? "🏆 Legendaria" : streak.current_streak >= 14 ? "💎 Brillante" : "🌟 Semana perfecta"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-orange-400 font-semibold">
                  {streak.current_streak} día{streak.current_streak !== 1 ? "s" : ""}
                </span>
                {(streak.longest_streak ?? 0) > streak.current_streak && (
                  <span className="text-xs text-reborn-muted/50 border border-reborn-border rounded-full px-2 py-0.5">
                    Récord: {streak.longest_streak}
                  </span>
                )}
              </div>
            </div>

            {/* Next milestone hint */}
            {(() => {
              const milestones = [3, 7, 14, 30, 60, 100];
              const next = milestones.find((m) => m > streak.current_streak);
              if (!next) return null;
              const remaining = next - streak.current_streak;
              return (
                <p className="text-xs text-reborn-muted/60 mb-3">
                  {remaining === 1 ? "¡Mañana alcanzas" : `${remaining} días para`} el hito de {next} días 🎯
                </p>
              );
            })()}

            {/* Last 7 days with real day names */}
            {(() => {
              const dayLetters = ["D", "L", "M", "X", "J", "V", "S"];
              const todayDow = new Date().getDay();
              return (
                <div className="flex items-end gap-1.5">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const daysAgo = 6 - i;
                    const dow = ((todayDow - daysAgo) % 7 + 7) % 7;
                    const label = daysAgo === 0 ? "hoy" : dayLetters[dow];
                    const active = daysAgo < streak.current_streak;
                    const isToday = daysAgo === 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <div
                          className={`w-full rounded-full transition-all duration-300 ${
                            isToday && active
                              ? "h-5 bg-orange-500 shadow-md shadow-orange-500/30"
                              : active
                              ? "h-3.5 bg-orange-500/70"
                              : isToday
                              ? "h-3 bg-reborn-border/80 border border-dashed border-orange-500/30"
                              : "h-2 bg-reborn-border"
                          }`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            isToday
                              ? "text-orange-400/80"
                              : active
                              ? "text-orange-400/50"
                              : "text-reborn-muted/35"
                          }`}
                        >
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Weekly stats mini-strip */}
            {(weeklyStats.articlesRead > 0 || weeklyStats.tasksCompleted > 0) && (
              <div className="mt-4 pt-4 border-t border-reborn-border/50 grid grid-cols-3 gap-0 divide-x divide-reborn-border/50">
                {[
                  { num: weeklyStats.articlesRead, label: "artículos esta semana" },
                  { num: weeklyStats.tasksCompleted, label: "tareas esta semana" },
                  { num: weeklyStats.activeDays, label: "días activos" },
                ].map(({ num, label }) => (
                  <div key={label} className="flex flex-col items-center py-1 px-2">
                    <span className="text-base font-bold text-reborn-text tabular-nums">{num}</span>
                    <span className="text-xs text-reborn-muted/60 text-center leading-tight mt-0.5">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
