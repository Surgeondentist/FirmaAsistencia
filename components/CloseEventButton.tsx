"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  eventId: string;
  disabled: boolean;
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
      const type = res.headers.get("content-type") ?? "";

      if (!res.ok) {
        if (type.includes("application/json")) {
          const data = (await res.json()) as { error?: string };
          setError(data.error ?? "No se pudo cerrar el evento.");
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
      setDone(true);
      router.refresh();
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
            Cerrando y generando Excel…
          </span>
        ) : (
          "Cerrar evento y descargar Excel"
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
            El evento quedó cerrado y se descargó el archivo{" "}
            <span className="font-mono text-xs">.xlsx</span> con la tabla y las firmas.
          </p>
        </div>
      ) : null}
    </div>
  );
}
