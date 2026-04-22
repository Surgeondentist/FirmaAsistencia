import Link from "next/link";

export default function AdminEventNotFound() {
  return (
    <main className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-lg font-semibold text-gray-900">Evento no encontrado</h1>
      <Link href="/admin" className="mt-4 inline-block text-sm underline">
        Volver al panel
      </Link>
    </main>
  );
}
