import Link from "next/link";

function Skeleton({ className }: { className?: string }) {
  return <div className={`shimmer rounded-lg ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-reborn-bg">
      {/* Header skeleton */}
      <header className="border-b border-reborn-border bg-reborn-bg/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-reborn-accent to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div>
              <p className="text-xl font-bold text-reborn-text tracking-tight">Reborn</p>
              <p className="text-xs text-reborn-muted">from zero to hero</p>
            </div>
          </Link>
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Welcome skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div className="space-y-2">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-5 w-36 rounded-full" />
          </div>
          <Skeleton className="h-16 w-28 rounded-xl" />
        </div>

        {/* Progress card skeleton */}
        <div className="bg-reborn-card border border-reborn-border rounded-2xl p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-7 w-12" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>

        {/* Tip skeleton */}
        <Skeleton className="h-10 w-full rounded-xl mb-6" />

        {/* Articles section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-reborn-card border border-reborn-border rounded-2xl p-5 space-y-3">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <div className="flex items-center gap-2 pt-1">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-4 w-full rounded-full" />
        </section>

        {/* Goals section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-reborn-card border border-reborn-border rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-10 rounded-full" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-10 w-full rounded-xl" />
                ))}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
