"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV_ITEMS = [
  { href: "/", label: "Inicio", icon: "🏠" },
  { href: "/dashboard", label: "Hoy", icon: "📰" },
  { href: "/dashboard/onboarding", label: "Metas", icon: "🎯" },
  { href: "/dashboard/settings", label: "Perfil", icon: "⚙️" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  // Only render for logged-in users, only on mobile (CSS handles visibility)
  if (loading || !user) return null;

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-reborn-bg/95 backdrop-blur-md border-t border-reborn-border">
      <div className="flex items-center justify-around px-1 pt-1.5 pb-5">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          // Exact match for /, /dashboard; prefix match for deeper routes
          const active =
            href === "/" || href === "/dashboard"
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 min-w-0 ${
                active
                  ? "text-reborn-accent"
                  : "text-reborn-muted"
              }`}
            >
              {active && (
                <span className="absolute inset-0 bg-reborn-accent/10 rounded-xl" />
              )}
              <span className={`relative text-xl leading-none transition-transform duration-200 ${active ? "scale-110" : ""}`}>
                {icon}
              </span>
              <span className={`relative text-xs font-medium transition-colors ${active ? "text-reborn-accent" : ""}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
