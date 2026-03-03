"use client";

import { formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";
import Link from "next/link";

function UserMenu({
  displayName,
  onSignOut,
}: {
  displayName: string;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 focus:outline-none"
        aria-label="Menú de usuario"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-reborn-accent to-purple-500 flex items-center justify-center">
          <span className="text-white font-semibold text-xs">{initials}</span>
        </div>
        <svg
          className={`w-4 h-4 text-reborn-muted transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-44 bg-reborn-card border border-reborn-border rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-reborn-border">
              <p className="text-xs text-reborn-muted">Conectado como</p>
              <p className="text-sm font-medium text-reborn-text truncate">
                {displayName}
              </p>
            </div>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-reborn-text-secondary hover:text-reborn-text hover:bg-reborn-border/30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Mi dashboard
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-reborn-text-secondary hover:text-reborn-text hover:bg-reborn-border/30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configuración
            </Link>
            <div className="border-t border-reborn-border mx-2 my-1" />
            <button
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-reborn-text-secondary hover:text-reborn-text hover:bg-reborn-border/30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Header() {
  const today = new Date();
  const { user, profile, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <header className="border-b border-reborn-border bg-reborn-bg/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-reborn-accent to-purple-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-reborn-text tracking-tight">
              Reborn
            </h1>
            <p className="text-xs text-reborn-muted">from zero to hero</p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <time className="text-sm text-reborn-text-secondary capitalize hidden sm:block">
            {formatDate(today)}
          </time>

          {!loading && (
            <>
              {user ? (
                <UserMenu
                  displayName={
                    profile?.display_name ?? user.email?.split("@")[0] ?? "Usuario"
                  }
                  onSignOut={handleSignOut}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth"
                    className="text-sm font-medium text-reborn-text-secondary hover:text-reborn-text transition-colors hidden sm:block"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/auth?mode=register"
                    className="text-sm font-semibold text-white bg-reborn-accent hover:bg-reborn-accent-hover rounded-lg px-4 py-1.5 transition-colors"
                  >
                    Crear cuenta
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
