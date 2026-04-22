"use client";

import { useRef, useState } from "react";
import {
  SignatureCanvas,
  type SignatureCanvasHandle,
} from "@/components/SignatureCanvas";

type Props = {
  eventId: string;
};

export function AttendForm({ eventId }: Props) {
  const sigRef = useRef<SignatureCanvasHandle>(null);
  const [name, setName] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const signatureDataUrl = sigRef.current?.getSignatureDataUrl() ?? null;
    if (!signatureDataUrl) {
      setError("Dibuja tu firma en el recuadro.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/attend/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          documentId: documentId.trim(),
          signatureDataUrl,
        }),
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
        className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-8 text-center backdrop-blur-md"
        role="status"
      >
        <div
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/20"
          aria-hidden
        >
          <svg
            className="h-6 w-6 text-emerald-200"
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
        <p className="mt-4 text-lg font-semibold text-emerald-100">¡Listo!</p>
        <p className="mt-2 text-sm leading-relaxed text-emerald-100/90">
          Tu asistencia ha sido registrada correctamente.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="glass-label">
          Nombre completo
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="glass-input touch-manipulation"
        />
      </div>
      <div>
        <label htmlFor="documentId" className="glass-label">
          Número de documento
        </label>
        <input
          id="documentId"
          name="documentId"
          required
          value={documentId}
          onChange={(e) => setDocumentId(e.target.value)}
          className="glass-input touch-manipulation"
        />
      </div>
      <div>
        <span className="glass-label">Firma</span>
        <p className="glass-hint mt-1">
          Usa el dedo o el ratón en el recuadro.
        </p>
        <div className="mt-3">
          <SignatureCanvas ref={sigRef} />
        </div>
      </div>
      {error ? (
        <p
          className="rounded-xl border border-red-400/35 bg-red-500/15 px-4 py-3 text-sm text-red-100 backdrop-blur-md"
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
