"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  eventId: string;
  disabled: boolean;
};

export function CloseEventButton({ eventId, disabled }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onClose() {
    setError(null);
    setDone(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/close`, {
        method: "POST",
      });

      if (!res.ok) {
        const type = res.headers.get("content-type") ?? "";
        if (type.includes("application/json")) {
          const data = (await res.json()) as { error?: string };
          setError(data.error ?? "No se pudo cerrar el evento.");
        } else {
          setError(`Error ${res.status}`);
        }
        return;
      }

      setDone(true);
      router.refresh();
    } catch {
      setError("Error de red.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={onClose}
        className="btn-primary w-full touch-manipulation sm:w-auto disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              aria-hidden
            />
            Cerrando…
          </span>
        ) : (
          "Cerrar evento"
        )}
      </button>
      {error ? (
        <p
          className="rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-400/35 dark:bg-red-500/15 dark:text-red-100"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {done ? (
        <div className="rounded-xl border border-emerald-300/60 bg-emerald-50/95 p-4 text-sm text-emerald-900 backdrop-blur-md dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-50">
          <p className="font-semibold text-emerald-900 dark:text-emerald-100">Listo</p>
          <p className="mt-2 leading-relaxed text-emerald-800/95 dark:text-emerald-100/90">
            El evento quedó cerrado. Nadie podrá enviar más asistencias desde el
            enlace público.
          </p>
        </div>
      ) : null}
    </div>
  );
}
