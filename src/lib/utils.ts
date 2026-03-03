export function formatDate(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatScore(score: number): string {
  if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
  return String(score);
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    LLMs: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Agentes: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Modelos: "bg-green-500/20 text-green-400 border-green-500/30",
    Herramientas: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    Investigación: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    Industria: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  };
  return colors[category] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
}
