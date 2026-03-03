"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

type Mode = "login" | "register" | "forgot";

// Mock dashboard preview for left panel
function DashboardPreview() {
  return (
    <div className="w-full space-y-3">
      {/* Progress card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">⚡</span>
            <span className="text-xs font-semibold text-white/70">Progreso del día</span>
          </div>
          <span className="text-lg font-bold text-white">62%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
            style={{ width: "62%" }}
          />
        </div>
      </div>

      {/* Streak */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="text-xl">🔥</span>
        <div>
          <span className="text-xl font-bold text-orange-400">7</span>
          <span className="text-sm text-orange-300/70 ml-1">días de racha</span>
        </div>
        <span className="ml-auto text-xs text-orange-400/70 bg-orange-500/10 border border-orange-500/20 rounded-full px-2.5 py-1">
          1 semana 🌟
        </span>
      </div>

      {/* Goal card */}
      <div className="bg-white/5 border border-blue-500/20 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-white/80">🎯 Aprender Python</span>
          <span className="text-xs bg-blue-500/15 text-blue-400 border border-blue-500/25 rounded-full px-2 py-0.5 font-semibold">
            2/3
          </span>
        </div>
        <div className="space-y-1.5">
          {[
            { done: true, text: "Módulo de variables y tipos" },
            { done: true, text: "Practicar bucles for y while" },
            { done: false, text: "Resolver ejercicios de funciones" },
          ].map((task, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 text-xs rounded-lg px-2.5 py-2 border ${
                task.done
                  ? "bg-green-500/5 border-green-500/15 text-white/35"
                  : "bg-white/3 border-white/8 text-white/65"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded border-2 flex-shrink-0 flex items-center justify-center ${
                  task.done ? "bg-green-500 border-green-500" : "border-white/25"
                }`}
              >
                {task.done && (
                  <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className={task.done ? "line-through" : ""}>{task.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function AuthForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const supabase = getSupabaseBrowser();

  useEffect(() => {
    if (searchParams.get("mode") === "register") setMode("register");
  }, [searchParams]);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) router.replace(next);
    };
    check();
  }, [supabase, router, next]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=login`,
        });
        if (error) throw error;
        setVerificationSent(true);
      } else if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName || email.split("@")[0] } },
        });
        if (error) throw error;
        setVerificationSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = next;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      if (msg.includes("Invalid login credentials")) {
        setError("Email o contraseña incorrectos.");
      } else if (msg.includes("User already registered")) {
        setError("Ya existe una cuenta con este email. Inicia sesión.");
      } else if (msg.includes("Password should be at least")) {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    const isForgot = mode === "forgot";
    return (
      <div className="min-h-screen flex items-center justify-center bg-reborn-bg px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-reborn-text mb-3">
            {isForgot ? "Revisa tu email" : "Revisa tu email"}
          </h2>
          <p className="text-reborn-text-secondary mb-6">
            {isForgot
              ? <>Hemos enviado un enlace para restablecer tu contraseña a <span className="text-reborn-text font-medium">{email}</span>.</>
              : <>Hemos enviado un enlace de verificación a <span className="text-reborn-text font-medium">{email}</span>. Haz clic en el enlace para activar tu cuenta.</>
            }
          </p>
          <button
            onClick={() => { setVerificationSent(false); setMode("login"); }}
            className="text-sm text-reborn-accent hover:underline"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-reborn-bg">
      {/* Left panel — dashboard preview, hidden on mobile */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden border-r border-reborn-border flex-col justify-center p-12">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-reborn-accent/8 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-reborn-accent/20 to-transparent" />

        <div className="relative max-w-sm">
          {/* Branding */}
          <Link href="/" className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-reborn-accent to-purple-500 flex items-center justify-center shadow-lg shadow-reborn-accent/20">
              <span className="text-white font-bold">R</span>
            </div>
            <div>
              <p className="text-lg font-bold text-reborn-text leading-none">Reborn</p>
              <p className="text-xs text-reborn-muted">from zero to hero</p>
            </div>
          </Link>

          <h2 className="text-2xl font-bold text-reborn-text mb-2 leading-tight">
            Tu dashboard personal<br />
            <span className="gradient-text">de IA</span>
          </h2>
          <p className="text-sm text-reborn-text-secondary mb-8 leading-relaxed">
            Los 4 mejores posts de IA cada día, más un plan de acción personalizado para alcanzar tus metas con IA.
          </p>

          <DashboardPreview />

          <div className="mt-8 flex items-center gap-2 flex-wrap">
            {[
              { icon: "🤖", label: "Curado por Claude" },
              { icon: "🔥", label: "Sistema de rachas" },
              { icon: "🎯", label: "Plan con IA" },
              { icon: "📰", label: "Diario" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-xs text-reborn-muted bg-reborn-card/60 border border-reborn-border rounded-full px-3 py-1.5"
              >
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-3 mb-8 lg:hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-reborn-accent to-purple-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <div>
            <p className="text-base font-bold text-reborn-text leading-none">Reborn</p>
            <p className="text-xs text-reborn-muted">from zero to hero</p>
          </div>
        </Link>

        <div className="w-full max-w-sm">
          {/* Mode toggle — only show for login/register */}
          {mode !== "forgot" && (
            <div className="flex bg-reborn-card border border-reborn-border rounded-xl p-1 mb-7">
              <button
                onClick={() => { setMode("login"); setError(null); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  mode === "login"
                    ? "bg-reborn-accent text-white"
                    : "text-reborn-text-secondary hover:text-reborn-text"
                }`}
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => { setMode("register"); setError(null); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  mode === "register"
                    ? "bg-reborn-accent text-white"
                    : "text-reborn-text-secondary hover:text-reborn-text"
                }`}
              >
                Crear cuenta
              </button>
            </div>
          )}

          <h2 className="text-2xl font-bold text-reborn-text mb-1">
            {mode === "login" ? "Bienvenido de vuelta" : mode === "register" ? "Empieza tu transformación" : "Restablecer contraseña"}
          </h2>
          <p className="text-sm text-reborn-text-secondary mb-5">
            {mode === "login"
              ? "Accede a tu dashboard personal."
              : mode === "register"
              ? "Crea tu cuenta gratis y define tus metas con IA."
              : "Introduce tu email y te enviaremos un enlace para restablecer tu contraseña."}
          </p>

          {mode === "register" && (
            <div className="bg-reborn-accent/5 border border-reborn-accent/15 rounded-xl p-4 mb-5">
              <ul className="space-y-1.5">
                {[
                  "4 artículos de IA curados cada día",
                  "Hasta 3 metas personales con plan de IA",
                  "Tareas diarias adaptadas a tu progreso",
                  "Racha de hábitos y gamificación",
                ].map((benefit) => (
                  <li key={benefit} className="flex items-center gap-2 text-xs text-reborn-text-secondary">
                    <span className="text-green-400 font-bold flex-shrink-0">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-reborn-muted mt-3 border-t border-reborn-border/50 pt-2">
                Completamente gratis · Sin tarjeta de crédito
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-reborn-text-secondary mb-1.5">
                  Nombre
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre"
                  autoComplete="name"
                  className="w-full bg-reborn-card border border-reborn-border rounded-lg px-4 py-2.5 text-sm text-reborn-text placeholder:text-reborn-muted focus:outline-none focus:border-reborn-accent transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-reborn-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                autoFocus={mode === "login"}
                autoComplete="email"
                className="w-full bg-reborn-card border border-reborn-border rounded-lg px-4 py-2.5 text-sm text-reborn-text placeholder:text-reborn-muted focus:outline-none focus:border-reborn-accent transition-colors"
              />
            </div>

            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-reborn-text-secondary">
                    Contraseña
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => { setMode("forgot"); setError(null); }}
                      className="text-xs text-reborn-muted hover:text-reborn-accent transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    className="w-full bg-reborn-card border border-reborn-border rounded-lg px-4 py-2.5 pr-10 text-sm text-reborn-text placeholder:text-reborn-muted focus:outline-none focus:border-reborn-accent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-reborn-muted hover:text-reborn-text-secondary transition-colors"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-reborn-accent hover:bg-reborn-accent-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>{mode === "login" ? "Entrando..." : mode === "register" ? "Creando cuenta..." : "Enviando..."}</span>
                </>
              ) : (
                <span>
                  {mode === "login" ? "Iniciar sesión" : mode === "register" ? "Crear cuenta gratis →" : "Enviar enlace de recuperación"}
                </span>
              )}
            </button>
          </form>

          {mode === "forgot" ? (
            <p className="text-center text-xs text-reborn-muted mt-5">
              <button
                onClick={() => { setMode("login"); setError(null); }}
                className="text-reborn-accent hover:underline"
              >
                ← Volver al inicio de sesión
              </button>
            </p>
          ) : (
            <p className="text-center text-xs text-reborn-muted mt-5">
              {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
              <button
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }}
                className="text-reborn-accent hover:underline"
              >
                {mode === "login" ? "Regístrate gratis" : "Inicia sesión"}
              </button>
            </p>
          )}

          {/* Mobile social proof */}
          <div className="mt-8 lg:hidden">
            <div className="flex items-center gap-3 justify-center flex-wrap">
              {[
                { icon: "📰", label: "4 artículos diarios" },
                { icon: "🤖", label: "Curado por Claude" },
                { icon: "🔥", label: "Rachas de hábitos" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-reborn-muted/70 bg-reborn-card/60 border border-reborn-border/50 rounded-full px-3 py-1.5">
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-reborn-bg">
          <div className="w-8 h-8 rounded-full border-2 border-reborn-accent border-t-transparent animate-spin" />
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
