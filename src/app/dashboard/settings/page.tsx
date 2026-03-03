"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "@/components/Toast";

interface Stats {
  totalArticles: number;
  totalTasks: number;
  currentStreak: number;
  longestStreak: number;
  memberSince: string;
  memberDays: number;
}

interface Achievement {
  icon: string;
  label: string;
  desc: string;
  unlocked: boolean;
  color: string;
  progress?: { current: number; goal: number };
}

function getAchievements(stats: Stats): Achievement[] {
  return [
    {
      icon: "📚",
      label: "Primer artículo",
      desc: "Lee tu primer artículo de IA",
      unlocked: stats.totalArticles >= 1,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      progress: { current: Math.min(stats.totalArticles, 1), goal: 1 },
    },
    {
      icon: "🔥",
      label: "Racha de 3",
      desc: "3 días seguidos activo",
      unlocked: stats.longestStreak >= 3,
      color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
      progress: { current: Math.min(stats.longestStreak, 3), goal: 3 },
    },
    {
      icon: "🌟",
      label: "Semana completa",
      desc: "7 días de racha",
      unlocked: stats.longestStreak >= 7,
      color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
      progress: { current: Math.min(stats.longestStreak, 7), goal: 7 },
    },
    {
      icon: "🔍",
      label: "Explorador",
      desc: "15 artículos leídos",
      unlocked: stats.totalArticles >= 15,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      progress: { current: Math.min(stats.totalArticles, 15), goal: 15 },
    },
    {
      icon: "💎",
      label: "2 semanas",
      desc: "14 días de racha",
      unlocked: stats.longestStreak >= 14,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      progress: { current: Math.min(stats.longestStreak, 14), goal: 14 },
    },
    {
      icon: "🏆",
      label: "Maestro IA",
      desc: "100 artículos leídos",
      unlocked: stats.totalArticles >= 100,
      color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
      progress: { current: Math.min(stats.totalArticles, 100), goal: 100 },
    },
  ];
}

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [activityMap, setActivityMap] = useState<Record<string, number> | null>(null);
  const [goalTitles, setGoalTitles] = useState<string[]>([]);
  const router = useRouter();
  const supabase = getSupabaseBrowser();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/auth"); return; }
      setEmail(user.email ?? "");

      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 27);
      const cutoffStr = cutoff.toISOString().split("T")[0];

      const [profileRes, articlesRes, tasksRes, streakRes, articlesActivity, tasksActivity, goalsRes] = await Promise.all([
        supabase.from("user_profiles").select("display_name, created_at").eq("id", user.id).maybeSingle(),
        supabase.from("completed_articles").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("completed_tasks").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("user_streaks").select("current_streak, longest_streak").eq("user_id", user.id).maybeSingle(),
        supabase.from("completed_articles").select("completed_at").eq("user_id", user.id).gte("completed_at", `${cutoffStr}T00:00:00.000Z`),
        supabase.from("completed_tasks").select("task_date").eq("user_id", user.id).gte("task_date", cutoffStr),
        supabase.from("user_goals").select("title").eq("user_id", user.id).order("created_at", { ascending: true }),
      ]);

      setDisplayName(profileRes.data?.display_name ?? user.email?.split("@")[0] ?? "");

      const createdAt = profileRes.data?.created_at ? new Date(profileRes.data.created_at) : null;
      const memberDate = createdAt
        ? createdAt.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
        : "—";
      const memberDays = createdAt
        ? Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / 86400000))
        : 0;

      const streakData = streakRes.data as { current_streak?: number; longest_streak?: number } | null;
      setStats({
        totalArticles: articlesRes.count ?? 0,
        totalTasks: tasksRes.count ?? 0,
        currentStreak: streakData?.current_streak ?? 0,
        longestStreak: streakData?.longest_streak ?? 0,
        memberSince: memberDate,
        memberDays,
      });

      const map: Record<string, number> = {};
      for (const a of (articlesActivity.data ?? []) as { completed_at: string }[]) {
        const date = a.completed_at.split("T")[0];
        map[date] = (map[date] ?? 0) + 1;
      }
      for (const t of (tasksActivity.data ?? []) as { task_date: string }[]) {
        map[t.task_date] = (map[t.task_date] ?? 0) + 1;
      }
      setActivityMap(map);
      setGoalTitles((goalsRes.data ?? []).map((g: { title: string }) => g.title));

      setInitializing(false);
    };
    load();
  }, [supabase, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase
        .from("user_profiles")
        .update({ display_name: displayName.trim() })
        .eq("id", user.id);
      if (error) throw error;
      toast("Nombre actualizado ✓");
      router.refresh();
    } catch {
      toast("Error al guardar. Inténtalo de nuevo.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-reborn-bg">
      <Header />
      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-10">
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-reborn-muted hover:text-reborn-text-secondary transition-colors flex items-center gap-1.5 mb-4">
            ← Volver al dashboard
          </Link>
          <h1 className="text-2xl font-bold text-reborn-text">Configuración</h1>
          <p className="text-sm text-reborn-text-secondary mt-1">Gestiona tu perfil y preferencias.</p>
        </div>

        {initializing ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-xl shimmer" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile card */}
            <div className="bg-reborn-card border border-reborn-border rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-reborn-text mb-5">Perfil</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-reborn-text-secondary mb-1.5">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full bg-reborn-bg border border-reborn-border rounded-lg px-4 py-2.5 text-sm text-reborn-text placeholder:text-reborn-muted focus:outline-none focus:border-reborn-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-reborn-text-secondary mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-reborn-bg/50 border border-reborn-border rounded-lg px-4 py-2.5 text-sm text-reborn-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-reborn-muted mt-1">El email no se puede cambiar.</p>
                </div>
                <button
                  type="submit"
                  disabled={loading || !displayName.trim()}
                  className="bg-reborn-accent hover:bg-reborn-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    "Guardar cambios"
                  )}
                </button>
              </form>
            </div>

            {/* Stats card */}
            {stats && (
              <div className="bg-reborn-card border border-reborn-border rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-reborn-text mb-4">Tu progreso</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-reborn-bg/40 rounded-xl p-3">
                    <p className="text-2xl font-bold text-reborn-text">{stats.totalArticles}</p>
                    <p className="text-xs text-reborn-muted mt-0.5">📰 Artículos leídos</p>
                  </div>
                  <div className="bg-reborn-bg/40 rounded-xl p-3">
                    <p className="text-2xl font-bold text-reborn-text">{stats.totalTasks}</p>
                    <p className="text-xs text-reborn-muted mt-0.5">✅ Tareas completadas</p>
                  </div>
                  <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3">
                    <p className="text-2xl font-bold text-orange-400">{stats.currentStreak} 🔥</p>
                    <p className="text-xs text-reborn-muted mt-0.5">Racha actual</p>
                  </div>
                  <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-3">
                    <p className="text-2xl font-bold text-yellow-400">{stats.longestStreak}</p>
                    <p className="text-xs text-reborn-muted mt-0.5">🏆 Récord de racha</p>
                  </div>
                  <div className="col-span-2 sm:col-span-2 bg-reborn-bg/40 rounded-xl p-3">
                    <p className="text-2xl font-bold text-reborn-text">{stats.memberDays}</p>
                    <p className="text-xs text-reborn-muted mt-0.5">🗓 días en Reborn · desde {stats.memberSince}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Heatmap */}
            {activityMap !== null && (() => {
              const today = new Date();
              const todayStr = today.toISOString().split("T")[0];
              const dow = today.getDay();
              const daysFromMon = dow === 0 ? 6 : dow - 1;
              const startDate = new Date(today);
              startDate.setDate(today.getDate() - daysFromMon - 21);
              const days = Array.from({ length: 28 }, (_, i) => {
                const d = new Date(startDate);
                d.setDate(startDate.getDate() + i);
                const str = d.toISOString().split("T")[0];
                return { str, count: activityMap[str] ?? 0, isToday: str === todayStr, isFuture: d > today };
              });
              const totalActiveDays = days.filter((d) => !d.isFuture && d.count > 0).length;
              return (
                <div className="bg-reborn-card border border-reborn-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-reborn-text">Actividad</h2>
                    <span className="text-xs text-reborn-muted">{totalActiveDays}/28 días activos</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
                      <div key={d} className="text-center text-xs text-reborn-muted/40 pb-1">{d}</div>
                    ))}
                    {days.map(({ str, count, isToday, isFuture }) => (
                      <div
                        key={str}
                        title={isFuture ? "" : `${str}: ${count} actividad${count !== 1 ? "es" : ""}`}
                        className={`aspect-square rounded-sm transition-all ${
                          isFuture
                            ? "bg-transparent"
                            : count === 0
                            ? "bg-reborn-border/30"
                            : count <= 2
                            ? "bg-reborn-accent/30"
                            : count <= 5
                            ? "bg-reborn-accent/65"
                            : "bg-reborn-accent"
                        } ${isToday ? "ring-1 ring-reborn-accent/50" : ""}`}
                      />
                    ))}
                  </div>
                  {totalActiveDays === 0 && (
                    <p className="text-xs text-reborn-muted/40 text-center mt-3">
                      Completa artículos y tareas para ver tu historial aquí
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 justify-end mt-2">
                    <span className="text-xs text-reborn-muted/40">Menos</span>
                    {["bg-reborn-border/30", "bg-reborn-accent/30", "bg-reborn-accent/65", "bg-reborn-accent"].map((cls, i) => (
                      <div key={i} className={`w-2.5 h-2.5 rounded-sm ${cls}`} />
                    ))}
                    <span className="text-xs text-reborn-muted/40">Más</span>
                  </div>
                </div>
              );
            })()}

            {/* Achievements */}
            {stats && (() => {
              const achievements = getAchievements(stats);
              const unlocked = achievements.filter((a) => a.unlocked).length;
              return (
                <div className="bg-reborn-card border border-reborn-border rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-reborn-text">Logros</h2>
                    <span className="text-xs text-reborn-muted">{unlocked}/{achievements.length} desbloqueados</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {achievements.map((a) => (
                      <div
                        key={a.label}
                        className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                          a.unlocked
                            ? `${a.color} border-current/20`
                            : "bg-reborn-bg/30 border-reborn-border/50"
                        }`}
                      >
                        <span className={`text-2xl mb-1.5 ${!a.unlocked ? "grayscale opacity-40" : ""}`}>{a.icon}</span>
                        <p className={`text-xs font-semibold leading-tight ${!a.unlocked ? "text-reborn-muted/60" : ""}`}>{a.label}</p>
                        <p className={`text-xs mt-0.5 leading-tight ${!a.unlocked ? "text-reborn-muted/40" : "opacity-70"}`}>{a.desc}</p>
                        {/* Progress bar for locked achievements */}
                        {!a.unlocked && a.progress && (
                          <div className="mt-2 w-full">
                            <div className="w-full h-1 bg-reborn-border rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-reborn-accent/40 transition-all"
                                style={{ width: `${Math.round((a.progress.current / a.progress.goal) * 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-reborn-muted/40 mt-0.5 tabular-nums">
                              {a.progress.current}/{a.progress.goal}
                            </p>
                          </div>
                        )}
                        {a.unlocked && (
                          <span className="mt-1.5 text-xs font-bold text-current opacity-60">✓ Desbloqueado</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Goals card */}
            <div className="bg-reborn-card border border-reborn-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-reborn-text">Mis metas</h2>
                <Link
                  href="/dashboard/onboarding"
                  className="text-sm font-medium text-reborn-accent hover:text-reborn-accent-hover transition-colors"
                >
                  {goalTitles.length > 0 ? "Editar →" : "Crear →"}
                </Link>
              </div>
              {goalTitles.length > 0 ? (
                <ul className="space-y-2">
                  {goalTitles.map((title, i) => {
                    const icons = ["🎯", "💡", "🚀"];
                    const colors = ["text-reborn-accent", "text-purple-400", "text-emerald-400"];
                    return (
                      <li key={i} className="flex items-center gap-2.5 text-sm">
                        <span className={`flex-shrink-0 ${colors[i % colors.length]}`}>{icons[i % icons.length]}</span>
                        <span className="text-reborn-text-secondary truncate">{title}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-reborn-muted">Define hasta 3 objetivos y obtén un plan de acción con IA.</p>
              )}
            </div>

            {/* Danger zone */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-red-400 mb-1">Zona de peligro</h2>
              <p className="text-xs text-reborn-muted mb-4">Esta acción cerrará tu sesión.</p>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
                className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors border border-red-500/30 hover:border-red-500/50 rounded-lg px-4 py-2"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
