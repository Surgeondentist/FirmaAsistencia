import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { AdminConfigMessage } from "@/components/AdminConfigMessage";
import { AttendeeTable } from "@/components/AttendeeTable";
import { CloseEventButton } from "@/components/CloseEventButton";
import { ExportEventXlsxButton } from "@/components/ExportEventXlsxButton";
import { CopyPublicEventLinkButton } from "@/components/CopyPublicEventLinkButton";
import { DeleteEventButton } from "@/components/DeleteEventButton";
import { authOptions } from "@/lib/auth";
import { isEventOwnedByUser } from "@/lib/eventOwnership";
import { getEvent } from "@/lib/kv";

export const dynamic = "force-dynamic";

type Props = { params: { eventId: string } };

export default async function AdminEventPage({ params }: Props) {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch {
    return <AdminConfigMessage reason="session" />;
  }

  const ownerId = session?.user?.id?.trim();
  const ownerEmail = session?.user?.email?.trim() ?? "";
  if (!ownerId || !ownerEmail) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center sm:py-20">
        <div className="glass-panel">
          <h1 className="theme-heading text-xl font-semibold tracking-tight">
            Inicia sesión
          </h1>
          <p className="theme-sub mt-3 text-sm leading-relaxed">
            Necesitas una cuenta de Google para ver este evento.
          </p>
          <Link href="/admin" className="btn-secondary mt-8 inline-flex">
            Ir al panel
          </Link>
        </div>
      </main>
    );
  }

  let event;
  try {
    event = await getEvent(params.eventId);
  } catch {
    return <AdminConfigMessage reason="kv" />;
  }
  if (!event) {
    notFound();
  }

  if (!isEventOwnedByUser(event, ownerId, ownerEmail)) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center sm:py-20">
        <div className="glass-panel">
          <h1 className="theme-heading text-xl font-semibold tracking-tight">
            No autorizado
          </h1>
          <p className="theme-sub mt-3 text-sm leading-relaxed">
            Este evento pertenece a otra cuenta. Solo puedes gestionar los que
            creaste tú.
          </p>
          <Link href="/admin" className="btn-secondary mt-8 inline-flex">
            Volver a mis eventos
          </Link>
        </div>
      </main>
    );
  }

  const badge =
    event.status === "open" ? (
      <span className="badge-open">Abierto</span>
    ) : (
      <span className="badge-closed">Cerrado</span>
    );

  const baseUrl =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const publicAttendUrl = `${baseUrl}/attend/${event.id}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:py-12">
      <Link href="/admin" className="link-back">
        <svg
          className="theme-muted h-4 w-4"
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

      <header className="mt-8 flex flex-col gap-4 border-b border-slate-200/90 pb-8 dark:border-white/10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="theme-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              {event.name}
            </h1>
            {badge}
          </div>
          <p className="theme-muted mt-3 text-sm">
            Creado:{" "}
            <span className="theme-sub font-medium">
              {new Date(event.createdAt).toLocaleString("es-ES")}
            </span>
          </p>
          <p className="theme-muted mt-2 text-sm">Enlace público</p>
          <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
            <span className="theme-mono-link min-w-0 flex-1 break-all font-mono text-xs leading-relaxed">
              {publicAttendUrl}
            </span>
            <CopyPublicEventLinkButton url={publicAttendUrl} />
          </div>
        </div>
        <DeleteEventButton
          eventId={event.id}
          eventName={event.name}
          redirectTo="/admin"
        />
      </header>

      <section className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="glass-panel-soft">
          <h2 className="theme-muted text-sm font-semibold uppercase tracking-wider">
            Exportar (Excel)
          </h2>
          <p className="theme-muted mt-2 text-sm leading-relaxed">
            Descarga un{" "}
            <span className="theme-mono-link font-mono text-xs">.xlsx</span> con
            las columnas, la hora de envío y las firmas (si las hay). El evento
            puede seguir abierto o cerrado; esto no cambia el estado.
          </p>
          <div className="mt-4">
            <ExportEventXlsxButton eventId={event.id} />
          </div>
        </div>
        <div className="glass-panel-soft">
          <h2 className="theme-muted text-sm font-semibold uppercase tracking-wider">
            Cerrar evento
          </h2>
          <p className="theme-muted mt-2 text-sm leading-relaxed">
            Bloquea nuevos envíos desde el enlace público. Puedes exportar el
            Excel antes o después de cerrar.
          </p>
          <div className="mt-4">
            <CloseEventButton
              eventId={event.id}
              disabled={event.status === "closed"}
            />
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="theme-heading text-lg font-semibold tracking-tight">
          Asistentes
        </h2>
        <div className="mt-4">
          <AttendeeTable columns={event.columns} attendees={event.attendees} />
        </div>
      </section>
    </main>
  );
}
