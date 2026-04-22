/**
 * Mensaje cuando falla la sesión o KV por variables de entorno en producción.
 * Usa solo utilidades Tailwind estándar para verse bien aunque el deploy no tenga el tema glass.
 */
export function AdminConfigMessage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full rounded-2xl border border-amber-200 bg-amber-50/90 p-8 shadow-lg">
        <h1 className="text-xl font-semibold text-amber-950">
          Configuración del servidor incompleta
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-amber-900/90">
          No se pudo cargar el panel. En Vercel revisa{" "}
          <strong className="font-semibold">Settings → Environment Variables</strong>{" "}
          y vuelve a desplegar.
        </p>
        <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-amber-950/85">
          <li>
            <code className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-xs">
              NEXTAUTH_SECRET
            </code>{" "}
            (obligatorio en producción)
          </li>
          <li>
            <code className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-xs">
              NEXTAUTH_URL
            </code>{" "}
            = URL exacta del sitio (ej.{" "}
            <code className="font-mono text-xs">https://firmero.vercel.app</code>)
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
            </code>
          </li>
          <li>
            Tras iniciar sesión, hacen falta{" "}
            <code className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-xs">
              KV_REST_API_URL
            </code>{" "}
            y{" "}
            <code className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-xs">
              KV_REST_API_TOKEN
            </code>
          </li>
        </ul>
        <p className="mt-6 text-xs text-amber-900/70">
          En <strong>Deployments</strong> abre el último deploy → <strong>Logs</strong>{" "}
          para ver el error exacto. El digest solo sirve para soporte interno.
        </p>
      </div>
    </main>
  );
}
