"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { EventCard } from "@/components/EventCard";
import type { EventRecord } from "@/lib/types";

type Props = {
  events: EventRecord[];
};

const MAX_COLUMNS = 10;

export function AdminDashboard({ events: initialEvents }: Props) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  const [modalOpen, setModalOpen] = useState(false);
  const [eventName, setEventName] = useState("");
  const [columnCount, setColumnCount] = useState(3);
  const [labels, setLabels] = useState(["Nombre", "Documento", "Firma"]);
  const [signatureColumnIndex, setSignatureColumnIndex] = useState<number | null>(
    2
  );

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [lastShare, setLastShare] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function openModal() {
    setModalOpen(true);
    setCreateError(null);
    setEventName("");
    setColumnCount(3);
    setLabels(["Nombre", "Documento", "Firma"]);
    setSignatureColumnIndex(2);
  }

  function updateColumnCount(n: number) {
    setColumnCount(n);
    setLabels((prev) => {
      const next = prev.slice(0, n);
      while (next.length < n) {
        next.push(`Campo ${next.length + 1}`);
      }
      return next;
    });
    setSignatureColumnIndex((prev) => {
      if (prev === null) return null;
      if (n <= 0) return null;
      if (prev >= n) return n - 1;
      return prev;
    });
  }

  function setLabelAt(index: number, value: string) {
    setLabels((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: eventName.trim(),
          columnCount,
          labels: labels.slice(0, columnCount),
          signatureColumnIndex,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        id?: string;
        shareUrl?: string;
      };
      if (!res.ok) {
        setCreateError(data.error ?? "No se pudo crear el evento.");
        return;
      }
      if (data.shareUrl) {
        setLastShare(data.shareUrl);
        setModalOpen(false);
        router.refresh();
      }
    } catch {
      setCreateError("Error de red.");
    } finally {
      setCreating(false);
    }
  }

  async function copyShare() {
    if (!lastShare) return;
    try {
      await navigator.clipboard.writeText(lastShare);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="flex flex-col gap-6 border-b border-slate-200/90 pb-10 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="theme-eyebrow text-xs font-semibold uppercase tracking-[0.2em]">
            Panel
          </p>
          <h1 className="theme-heading mt-2 text-3xl font-semibold tracking-tight">
            Eventos
          </h1>
          <p className="theme-sub mt-2 max-w-xl text-sm leading-relaxed">
            Crea un evento con las columnas que necesites (hasta {MAX_COLUMNS}) y
            comparte el enlace con los participantes.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={openModal}
            className="btn-primary w-auto min-w-[160px] touch-manipulation"
          >
            Crear evento
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin" })}
            className="btn-ghost touch-manipulation"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      {lastShare ? (
        <div className="glass-panel-soft mt-10 border-violet-200/60 dark:border-violet-400/20">
          <p className="text-sm font-semibold text-violet-800 dark:text-violet-100">
            Enlace del último evento creado
          </p>
          <p className="theme-mono-link mt-2 break-all font-mono text-xs leading-relaxed sm:text-sm">
            {lastShare}
          </p>
          <button
            type="button"
            onClick={copyShare}
            className="btn-secondary mt-4 touch-manipulation"
          >
            {copied ? "Copiado" : "Copiar al portapapeles"}
          </button>
        </div>
      ) : null}

      <ul className="mt-10 space-y-4">
        {events.map((ev) => (
          <li key={ev.id}>
            <EventCard event={ev} />
          </li>
        ))}
      </ul>

      {events.length === 0 ? (
        <p className="theme-muted mt-12 text-center text-sm">
          No hay eventos todavía. Crea el primero con el botón de arriba.
        </p>
      ) : null}

      {modalOpen ? (
        <div className="modal-scrim">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-new-event-title"
            className="modal-panel max-h-[90vh] overflow-y-auto"
          >
            <h2
              id="modal-new-event-title"
              className="theme-heading text-lg font-semibold tracking-tight"
            >
              Nuevo evento
            </h2>
            <form onSubmit={createEvent} className="mt-6 space-y-5">
              <div>
                <label htmlFor="eventName" className="glass-label">
                  Nombre del evento
                </label>
                <input
                  id="eventName"
                  required
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="glass-input text-sm touch-manipulation"
                />
              </div>

              <div>
                <label htmlFor="columnCount" className="glass-label">
                  Número de columnas (1–{MAX_COLUMNS})
                </label>
                <select
                  id="columnCount"
                  value={columnCount}
                  onChange={(e) => updateColumnCount(Number(e.target.value))}
                  className="glass-input mt-2 text-sm touch-manipulation"
                >
                  {Array.from({ length: MAX_COLUMNS }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <fieldset className="space-y-3">
                <legend className="glass-label">Nombres de columnas</legend>
                <p className="glass-hint -mt-1">
                  Cada participante verá estos títulos en el formulario público.
                </p>
                {Array.from({ length: columnCount }, (_, i) => (
                  <div key={i}>
                    <label htmlFor={`col-label-${i}`} className="sr-only">
                      Columna {i + 1}
                    </label>
                    <input
                      id={`col-label-${i}`}
                      value={labels[i] ?? ""}
                      onChange={(e) => setLabelAt(i, e.target.value)}
                      placeholder={`Campo ${i + 1}`}
                      className="glass-input text-sm touch-manipulation"
                    />
                  </div>
                ))}
              </fieldset>

              <fieldset className="space-y-2">
                <legend className="glass-label">Firma manuscrita</legend>
                <p className="glass-hint -mt-1">
                  Opcional: una sola columna puede pedir firma en el lienzo. El resto
                  son campos de texto.
                </p>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200/90 bg-slate-50/90 px-4 py-3 text-sm text-slate-700 touch-manipulation dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200">
                  <input
                    type="radio"
                    name="sigCol"
                    className="mt-1"
                    checked={signatureColumnIndex === null}
                    onChange={() => setSignatureColumnIndex(null)}
                  />
                  <span>Sin firma (solo campos de texto)</span>
                </label>
                {Array.from({ length: columnCount }, (_, i) => (
                  <label
                    key={i}
                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200/90 bg-slate-50/90 px-4 py-3 text-sm text-slate-700 touch-manipulation dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
                  >
                    <input
                      type="radio"
                      name="sigCol"
                      className="mt-1"
                      checked={signatureColumnIndex === i}
                      onChange={() => setSignatureColumnIndex(i)}
                    />
                    <span>
                      Firma en la columna {i + 1}:{" "}
                      <span className="font-medium text-slate-900 dark:text-white">
                        {(labels[i] ?? "").trim() || `Campo ${i + 1}`}
                      </span>
                    </span>
                  </label>
                ))}
              </fieldset>

              {createError ? (
                <p
                  className="rounded-xl border border-red-300/60 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-400/35 dark:bg-red-500/15 dark:text-red-100"
                  role="alert"
                >
                  {createError}
                </p>
              ) : null}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-ghost touch-manipulation sm:min-w-0"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary w-full sm:w-auto sm:min-w-[120px] touch-manipulation"
                >
                  {creating ? "Creando…" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
