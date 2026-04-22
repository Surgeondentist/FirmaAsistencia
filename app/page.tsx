import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 sm:py-24">
      <div className="glass-panel text-center">
        <p className="theme-eyebrow text-xs font-semibold uppercase tracking-[0.2em]">
          Asistencia digital
        </p>
        <h1 className="theme-heading mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Firma y asistencia
        </h1>
        <p className="theme-sub mx-auto mt-4 max-w-md text-pretty text-sm leading-relaxed sm:text-base">
          Los participantes acceden con el enlace que comparte el administrador,
          firman en el dispositivo y queda todo listo para exportar.
        </p>
        <Link
          href="/admin"
          className="btn-primary mt-10 max-w-xs mx-auto"
        >
          Panel de administración
        </Link>
      </div>
    </main>
  );
}
