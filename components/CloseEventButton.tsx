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
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);

  async function onClose() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/close`, {
        method: "POST",
      });
      const data = (await res.json()) as { error?: string; sheetUrl?: string };
      if (!res.ok) {
        setError(data.error ?? "No se pudo cerrar ni exportar.");
        return;
      }
      if (data.sheetUrl) {
        setSheetUrl(data.sheetUrl);
        router.refresh();
      }
    } catch {
      setError("Error de red.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={onClose}
        className="btn-primary w-full sm:w-auto touch-manipulation disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
              aria-hidden
            />
            Cerrando y exportando…
          </span>
        ) : (
          "Cerrar evento y exportar"
        )}
      </button>
      {error ? (
        <p
          className="rounded-xl border border-red-400/35 bg-red-500/15 px-4 py-3 text-sm text-red-100"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {sheetUrl ? (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-50 backdrop-blur-md">
          <p className="font-semibold text-emerald-100">Hoja de Google creada</p>
          <a
            href={sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block break-all text-violet-200 underline decoration-violet-400/50 underline-offset-2 transition hover:text-white"
          >
            {sheetUrl}
          </a>
        </div>
      ) : null}
    </div>
  );
}
