import Link from "next/link";

export default function AdminEventNotFound() {
  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center sm:py-20">
      <div className="glass-panel">
        <h1 className="theme-heading text-xl font-semibold tracking-tight">
          Evento no encontrado
        </h1>
        <Link href="/admin" className="btn-secondary mt-8 inline-flex">
          Volver al panel
        </Link>
      </div>
    </main>
  );
}
