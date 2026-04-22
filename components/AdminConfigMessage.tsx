type Reason = "session" | "kv";

type Props = {
  /** Si no se indica, se muestran ambos bloques de ayuda. */
  reason?: Reason;
};

/**
 * Mensaje cuando falla la sesión o KV por variables de entorno en producción.
 * Usa solo utilidades Tailwind estándar para verse bien aunque el deploy no tenga el tema glass.
 */
export function AdminConfigMessage({ reason }: Props) {
  const showSession = !reason || reason === "session";
  const showKv = !reason || reason === "kv";

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full rounded-2xl border border-amber-200 bg-amber-50/90 p-8 shadow-lg">
        <h1 className="text-xl font-semibold text-amber-950">
          Configuración del servidor incompleta
        </h1>

        {reason === "session" ? (
          <p className="mt-3 text-sm font-medium text-amber-950/95">
            Falló la lectura de la sesión (NextAuth). Revisa sobre todo{" "}
            <code className="rounded bg-amber-100/80 px-1 font-mono text-xs">
              NEXTAUTH_SECRET
            </code>{" "}
            y{" "}
            <code className="rounded bg-amber-100/80 px-1 font-mono text-xs">
              NEXTAUTH_URL
            </code>
            .
          </p>
        ) : null}
        {reason === "kv" ? (
          <p className="mt-3 text-sm font-medium text-amber-950/95">
            Falló la conexión a Redis (almacén de eventos). Si vinculaste{" "}
            <strong>Vercel Storage / Upstash</strong>, revisa que existan{" "}
            <code className="rounded bg-amber-100/80 px-1 font-mono text-xs">
              STORAGE_KV_REST_API_URL
            </code>{" "}
            y{" "}
            <code className="rounded bg-amber-100/80 px-1 font-mono text-xs">
              STORAGE_KV_REST_API_TOKEN
            </code>{" "}
            (las añade la integración). La app también acepta{" "}
            <code className="font-mono text-xs">KV_REST_*</code> manual.
          </p>
        ) : null}

        {!reason ? (
          <p className="mt-3 text-sm leading-relaxed text-amber-900/90">
            No se pudo cargar el panel. En Vercel revisa{" "}
            <strong className="font-semibold">Settings → Environment Variables</strong>{" "}
            y vuelve a desplegar.
          </p>
        ) : null}

        {showSession ? (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/80">
              Sesión e inicio de sesión (NextAuth + Google)
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-amber-950/85">
              <li>
                <code className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-xs">
                  NEXTAUTH_SECRET
                </code>{" "}
                — obligatorio en producción (cadena larga aleatoria).
              </li>
              <li>
                <code className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-xs">
                  NEXTAUTH_URL
                </code>{" "}
                — URL exacta del sitio, sin barra final (ej.{" "}
                <code className="font-mono text-xs">https://firmero.vercel.app</code>).
              </li>
              <li>
                <code className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-xs">
                  GOOGLE_CLIENT_ID
                </code>{" "}
                y{" "}
                <code className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-xs">
                  GOOGLE_CLIENT_SECRET
                </code>
              </li>
              <li>
                <code className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-xs">
                  ADMIN_EMAIL
                </code>{" "}
                — mismo correo con el que iniciarás sesión.
              </li>
            </ul>
          </div>
        ) : null}

        {showKv ? (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/80">
              Redis / Vercel KV (eventos y asistentes)
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-amber-950/85">
              <li>
                <strong>Vercel Storage (icono rojo):</strong>{" "}
                <code className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-xs">
                  STORAGE_KV_REST_API_URL
                </code>{" "}
                y{" "}
                <code className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-xs">
                  STORAGE_KV_REST_API_TOKEN
                </code>
                — la app las usa solas.
              </li>
              <li>
                Opcional:{" "}
                <code className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-xs">
                  KV_REST_API_URL
                </code>{" "}
                /{" "}
                <code className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-xs">
                  KV_REST_API_TOKEN
                </code>{" "}
                si prefieres nombres clásicos (mismo valor que las{" "}
                <code className="font-mono text-xs">STORAGE_*</code>).
              </li>
            </ul>
          </div>
        ) : null}

        <p className="mt-6 text-xs text-amber-900/70">
          Tras guardar variables: <strong>Redeploy</strong>. Para el detalle técnico:{" "}
          <strong>Deployments</strong> → último deploy → <strong>Logs</strong>.
        </p>
      </div>
    </main>
  );
}
