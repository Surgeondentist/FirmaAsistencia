import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { AttendeeTable } from "@/components/AttendeeTable";
import { CloseEventButton } from "@/components/CloseEventButton";
import { authOptions, isAdminEmail } from "@/lib/auth";
import { getEvent } from "@/lib/kv";

export const dynamic = "force-dynamic";

type Props = { params: { eventId: string } };

export default async function AdminEventPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!isAdminEmail(session?.user?.email ?? null)) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-lg font-semibold text-gray-900">No autorizado</h1>
        <p className="mt-2 text-sm text-gray-600">
          Esta sección solo está disponible para el administrador.
        </p>
        <Link
          href="/admin"
          className="mt-6 inline-block text-sm text-gray-800 underline"
        >
          Volver al inicio de sesión
        </Link>
      </main>
    );
  }

  const event = await getEvent(params.eventId);
  if (!event) {
    notFound();
  }

  const badge =
    event.status === "open" ? (
      <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200">
        Abierto
      </span>
    ) : (
      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-gray-200">
        Cerrado
      </span>
    );

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/admin"
        className="text-sm text-gray-600 underline hover:text-gray-900"
      >
        ← Volver a eventos
      </Link>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-gray-900">{event.name}</h1>
        {badge}
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Creado: {new Date(event.createdAt).toLocaleString("es-ES")}
      </p>
      <p className="text-sm text-gray-600">
        Enlace público:{" "}
        <span className="break-all font-mono text-xs text-gray-800">
          {`${
            process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
            "http://localhost:3000"
          }/attend/${event.id}`}
        </span>
      </p>

      <div className="mt-8">
        <CloseEventButton
          eventId={event.id}
          disabled={event.status === "closed"}
        />
      </div>

      <h2 className="mt-10 text-lg font-medium text-gray-900">Asistentes</h2>
      <div className="mt-3">
        <AttendeeTable attendees={event.attendees} />
      </div>
    </main>
  );
}
