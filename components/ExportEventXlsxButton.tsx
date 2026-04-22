"use client";

import { useState } from "react";

type Props = {
  eventId: string;
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function filenameFromContentDisposition(header: string | null): string | null {
  if (!header) return null;
  const mStar = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (mStar?.[1]) {
    try {
      return decodeURIComponent(mStar[1].trim());
    } catch {
      return mStar[1];
    }
  }
  const m = header.match(/filename="([^"]+)"/i);
  return m?.[1] ?? null;
}

export function ExportEventXlsxButton({ eventId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onExport() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}/export`);
      const type = res.headers.get("content-type") ?? "";

      if (!res.ok) {
        if (type.includes("application/json")) {
          const data = (await res.json()) as { error?: string };
          setError(data.error ?? "No se pudo exportar.");
        } else {
          setError(`Error ${res.status}`);
        }
        return;
      }

      if (!type.includes("spreadsheetml")) {
        setError("Respuesta inesperada del servidor.");
        return;
      }

      const blob = await res.blob();
      const name =
        filenameFromContentDisposition(res.headers.get("content-disposition")) ??
        `asistencia-${eventId}.xlsx`;
      downloadBlob(blob, name);
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
        disabled={loading}
        onClick={onExport}
        className="btn-secondary w-full touch-manipulation sm:w-auto disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span
              className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden
            />
            Generando Excel…
          </span>
        ) : (
          "Descargar Excel (.xlsx)"
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
    </div>
  );
}
