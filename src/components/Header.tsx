"use client";

import { formatDate } from "@/lib/utils";

export default function Header() {
  const today = new Date();

  return (
    <header className="border-b border-reborn-border bg-reborn-bg/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-reborn-accent to-purple-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-reborn-text tracking-tight">
              Reborn
            </h1>
            <p className="text-xs text-reborn-muted">from zero to hero</p>
          </div>
        </div>
        <time className="text-sm text-reborn-text-secondary capitalize">
          {formatDate(today)}
        </time>
      </div>
    </header>
  );
}
