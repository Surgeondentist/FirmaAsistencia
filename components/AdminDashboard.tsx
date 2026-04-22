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
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Eventos</h1>
          <p className="mt-1 text-sm text-gray-600">
            Crea un evento y comparte el enlace con los participantes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setModalOpen(true);
              setCreateError(null);
            }}
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Crear evento
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/admin" })}
            className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {lastShare ? (
        <div className="mt-6 rounded border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-800">
            Enlace del último evento creado
          </p>
          <p className="mt-1 break-all text-sm text-gray-700">{lastShare}</p>
          <button
            type="button"
            onClick={copyShare}
            className="mt-3 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-100"
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
        <p className="mt-8 text-center text-sm text-gray-500">
          No hay eventos todavía.
        </p>
      ) : null}

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-lg"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              Nuevo evento
            </h2>
            <form onSubmit={createEvent} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="eventName"
                  className="block text-sm font-medium text-gray-800"
                >
                  Nombre del evento
                </label>
                <input
                  id="eventName"
                  required
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              {createError ? (
                <p className="text-sm text-red-700">{createError}</p>
              ) : null}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
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
