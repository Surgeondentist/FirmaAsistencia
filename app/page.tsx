import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold text-gray-900">
        Firma y asistencia
      </h1>
      <p className="mt-3 text-gray-600">
        Los participantes acceden con el enlace que comparte el administrador.
      </p>
      <Link
        href="/admin"
        className="mt-8 inline-block rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
      >
        Panel de administración
      </Link>
    </main>
  );
}
