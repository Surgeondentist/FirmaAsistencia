"use client";

import { useRef, useState } from "react";
import {
  SignatureCanvas,
  type SignatureCanvasHandle,
} from "@/components/SignatureCanvas";
import { signatureColumn } from "@/lib/eventColumns";
import type { EventRecord } from "@/lib/types";

type Props = {
  event: EventRecord;
};

export function AttendForm({ event }: Props) {
  const sigRef = useRef<SignatureCanvasHandle>(null);
  const sigCol = signatureColumn(event.columns);
  const textCols = event.columns.filter((c) => c.kind === "text");

  const [textValues, setTextValues] = useState<Record<string, string>>(() => {
    const o: Record<string, string> = {};
    for (const c of textCols) {
      o[c.id] = "";
    }
    return o;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function setText(id: string, value: string) {
    setTextValues((prev) => ({ ...prev, [id]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const values: Record<string, string> = { ...textValues };
    for (const c of event.columns) {
      if (c.kind === "text") {
        values[c.id] = (values[c.id] ?? "").trim();
        if (!values[c.id]) {
          setError(`Completa el campo «${c.label}».`);
          return;
        }
      }
    }

    if (sigCol) {
      const signatureDataUrl = sigRef.current?.getSignatureDataUrl() ?? null;
      if (!signatureDataUrl) {
        setError("Dibuja tu firma en el recuadro.");
        return;
      }
      values[sigCol.id] = signatureDataUrl;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/attend/${event.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
      });
      const data = (await res.json()) as { error?: string; success?: boolean };
      if (!res.ok) {
        setError(data.error ?? "No se pudo registrar la asistencia.");
        return;
      }
      setDone(true);
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div
        className="rounded-xl border border-emerald-300/60 bg-emerald-50/95 px-4 py-8 text-center backdrop-blur-md dark:border-emerald-400/30 dark:bg-emerald-500/10"
        role="status"
      >
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-100/90 dark:border-emerald-400/40 dark:bg-emerald-500/20"
          aria-hidden
        >
          <svg
            className="h-6 w-6 text-emerald-700 dark:text-emerald-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <title>Correcto</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="mt-4 text-lg font-semibold text-emerald-900 dark:text-emerald-100">
          ¡Listo!
        </p>
        <p className="mt-2 text-sm leading-relaxed text-emerald-800/95 dark:text-emerald-100/90">
          Tu asistencia ha sido registrada correctamente.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {textCols.map((col) => (
        <div key={col.id}>
          <label htmlFor={col.id} className="glass-label">
            {col.label}
          </label>
          <input
            id={col.id}
            name={col.id}
            required
            autoComplete="off"
            value={textValues[col.id] ?? ""}
            onChange={(e) => setText(col.id, e.target.value)}
            className="glass-input touch-manipulation"
          />
        </div>
      ))}

      {sigCol ? (
        <div>
          <span className="glass-label">{sigCol.label}</span>
          <p className="glass-hint mt-1">
            Usa el dedo o el ratón en el recuadro.
          </p>
          <div className="mt-3">
            <SignatureCanvas ref={sigRef} />
          </div>
        </div>
      ) : null}

      {error ? (
        <p
          className="rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-800 backdrop-blur-md dark:border-red-400/35 dark:bg-red-500/15 dark:text-red-100"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary touch-manipulation"
      >
        {loading ? "Enviando…" : "Enviar asistencia"}
      </button>
    </form>
  );
}
