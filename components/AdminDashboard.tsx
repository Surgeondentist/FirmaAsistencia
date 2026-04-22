"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { EventCard } from "@/components/EventCard";
import type { EventRecord } from "@/lib/types";

type Props = {
  events: EventRecord[];
};

export function AdminDashboard({ events: initialEvents }: Props) {
  const router = useRouter();
  const [events, setEvents] = useState(initialEvents);

  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);
  const [modalOpen, setModalOpen] = useState(false);
  const [eventName, setEventName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [lastShare, setLastShare] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: eventName.trim() }),
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
        setEventName("");
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
      <header className="flex flex-col gap-6 border-b border-white/10 pb-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/90">
            Panel
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Eventos
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
            Crea un evento y comparte el enlace con los participantes.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setModalOpen(true);
              setCreateError(null);
            }}
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
        <div className="glass-panel-soft mt-10 border-violet-400/20">
          <p className="text-sm font-semibold text-violet-100">
            Enlace del último evento creado
          </p>
          <p className="mt-2 break-all font-mono text-xs leading-relaxed text-slate-200 sm:text-sm">
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
        <p className="mt-12 text-center text-sm text-slate-400">
          No hay eventos todavía. Crea el primero con el botón de arriba.
        </p>
      ) : null}

      {modalOpen ? (
        <div className="modal-scrim">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-new-event-title"
            className="modal-panel"
          >
            <h2
              id="modal-new-event-title"
              className="text-lg font-semibold tracking-tight text-white"
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
              {createError ? (
                <p
                  className="rounded-xl border border-red-400/35 bg-red-500/15 px-3 py-2 text-sm text-red-100"
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
