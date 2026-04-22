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
    <div className="space-y-3">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={onClose}
        className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
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
        <p className="text-sm text-red-700">{error}</p>
      ) : null}
      {sheetUrl ? (
        <div className="rounded border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-medium">Hoja de Google creada</p>
          <a
            href={sheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block break-all text-emerald-800 underline"
          >
            {sheetUrl}
          </a>
        </div>
      ) : null}
    </div>
  );
}
