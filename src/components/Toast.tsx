"use client";

import { useEffect, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "streak";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let addToastFn: ((message: string, type?: ToastType) => void) | null = null;

export function toast(message: string, type: ToastType = "success") {
  addToastFn?.(message, type);
}

const DURATION = 3000;

const icons: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
  streak: "🔥",
};

const styles: Record<ToastType, { wrapper: string; bar: string }> = {
  success: {
    wrapper: "border-green-500/30 bg-[#0a0a0a]/95 text-green-300",
    bar: "bg-green-500",
  },
  error: {
    wrapper: "border-red-500/30 bg-[#0a0a0a]/95 text-red-300",
    bar: "bg-red-500",
  },
  info: {
    wrapper: "border-reborn-accent/30 bg-[#0a0a0a]/95 text-reborn-accent",
    bar: "bg-reborn-accent",
  },
  streak: {
    wrapper: "border-orange-500/30 bg-[#0a0a0a]/95 text-orange-300",
    bar: "bg-orange-500",
  },
};

function ToastItem({ toast: t, onRemove }: { toast: ToastItem; onRemove: () => void }) {
  const s = styles[t.type];

  return (
    <div
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl overflow-hidden
        animate-in ${s.wrapper}`}
      style={{ minWidth: 220, maxWidth: 320 }}
    >
      <span className="text-base flex-shrink-0">{icons[t.type]}</span>
      <span className="flex-1">{t.message}</span>
      <button
        onClick={onRemove}
        className="opacity-40 hover:opacity-80 transition-opacity text-xs ml-1 flex-shrink-0"
        aria-label="Cerrar"
      >
        ✕
      </button>
      {/* Timer bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${s.bar} opacity-50`}
        style={{
          animation: `shrink-x ${DURATION}ms linear forwards`,
        }}
      />
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
    setTimeout(() => remove(id), DURATION);
  }, [remove]);

  useEffect(() => {
    addToastFn = add;
    return () => { addToastFn = null; };
  }, [add]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={() => remove(t.id)} />
        </div>
      ))}
    </div>
  );
}
