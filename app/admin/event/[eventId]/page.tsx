import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { AdminConfigMessage } from "@/components/AdminConfigMessage";
import { AttendeeTable } from "@/components/AttendeeTable";
import { CloseEventButton } from "@/components/CloseEventButton";
import { authOptions, isAdminEmail } from "@/lib/auth";
import { getEvent } from "@/lib/kv";

export const dynamic = "force-dynamic";

type Props = { params: { eventId: string } };

export default async function AdminEventPage({ params }: Props) {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch {
    return <AdminConfigMessage />;
  }

  if (!isAdminEmail(session?.user?.email ?? null)) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center sm:py-20">
        <div className="glass-panel">
          <h1 className="text-xl font-semibold tracking-tight text-white">
            No autorizado
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Esta sección solo está disponible para el administrador.
          </p>
          <Link href="/admin" className="btn-secondary mt-8 inline-flex">
            Volver al inicio de sesión
          </Link>
        </div>
      </main>
    );
  }

  let event;
  try {
    event = await getEvent(params.eventId);
  } catch {
    return <AdminConfigMessage />;
  }
  if (!event) {
    notFound();
  }

  const badge =
    event.status === "open" ? (
      <span className="badge-open">Abierto</span>
    ) : (
      <span className="badge-closed">Cerrado</span>
    );

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:py-12">
      <Link href="/admin" className="link-back">
        <svg
          className="h-4 w-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
        Volver a eventos
      </Link>

      <header className="mt-8 flex flex-col gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {event.name}
            </h1>
            {badge}
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Creado:{" "}
            <span className="text-slate-200">
              {new Date(event.createdAt).toLocaleString("es-ES")}
            </span>
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Enlace público:{" "}
            <span className="break-all font-mono text-xs text-violet-200/90">
              {`${
                process.env.NEXTAUTH_URL?.replace(/\/$/, "") ??
                "http://localhost:3000"
              }/attend/${event.id}`}
            </span>
          </p>
        </div>
      </header>

      <section className="mt-8">
        <div className="glass-panel-soft">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Exportación
          </h2>
          <div className="mt-4">
            <CloseEventButton
              eventId={event.id}
              disabled={event.status === "closed"}
            />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight text-white">
          Asistentes
        </h2>
        <div className="mt-4">
          <AttendeeTable attendees={event.attendees} />
        </div>
      </section>
    </main>
  );
}
