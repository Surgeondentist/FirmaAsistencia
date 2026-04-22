"use client";

import { useState } from "react";

type Props = {
  url: string;
};

export function CopyPublicEventLinkButton({ url }: Props) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 2500);
    }
  }

  const label =
    status === "copied"
      ? "Copiado"
      : status === "error"
        ? "Error al copiar"
        : "Copiar enlace";

  return (
    <button
      type="button"
      onClick={onCopy}
      className="btn-secondary shrink-0 touch-manipulation text-sm"
      aria-label="Copiar enlace público al portapapeles"
    >
      {label}
    </button>
  );
}
