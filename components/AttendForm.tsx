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
      <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-6 text-center">
        <p className="font-medium text-emerald-900">¡Listo!</p>
        <p className="mt-2 text-sm text-emerald-800">
          Tu asistencia ha sido registrada correctamente.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-800"
        >
          Nombre completo
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>
      <div>
        <label
          htmlFor="documentId"
          className="block text-sm font-medium text-gray-800"
        >
          Número de documento
        </label>
        <input
          id="documentId"
          name="documentId"
          required
          value={documentId}
          onChange={(e) => setDocumentId(e.target.value)}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-base shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>
      <div>
        <span className="block text-sm font-medium text-gray-800">Firma</span>
        <p className="mt-0.5 text-xs text-gray-500">
          Usa el dedo o el ratón en el recuadro.
        </p>
        <div className="mt-2">
          <SignatureCanvas ref={sigRef} />
        </div>
      </div>
      {error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-gray-900 px-4 py-3 text-base font-medium text-white hover:bg-gray-800 disabled:opacity-60"
      >
        {loading ? "Enviando…" : "Enviar asistencia"}
      </button>
    </form>
  );
}
