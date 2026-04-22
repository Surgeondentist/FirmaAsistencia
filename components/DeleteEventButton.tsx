"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  eventId: string;
  eventName: string;
  /** Tras eliminar, navegar aquí (p. ej. `/admin`) en lugar de solo refrescar. */
  redirectTo?: string;
};

export function DeleteEventButton({ eventId, eventName, redirectTo }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    const ok = window.confirm(
      `¿Eliminar el evento «${eventName}»? Se borrarán también todos los registros de asistencia. Esta acción no se puede deshacer.`
    );
    if (!ok) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        window.alert(data.error ?? "No se pudo eliminar.");
        return;
      }
      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
      } else {
        router.refresh();
      }
    } catch {
      window.alert("Error de red.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={onDelete}
      className="rounded-xl border border-red-300/70 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-800 transition hover:bg-red-100/90 disabled:opacity-50 touch-manipulation dark:border-red-400/40 dark:bg-red-500/10 dark:text-red-100 dark:hover:bg-red-500/20"
    >
      {loading ? "…" : "Eliminar"}
    </button>
  );
}
