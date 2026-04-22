import Link from "next/link";
import { DeleteEventButton } from "@/components/DeleteEventButton";
import type { EventRecord } from "@/lib/types";

type Props = {
  event: EventRecord;
};

export function EventCard({ event }: Props) {
  const count = event.attendees.length;
  const badge =
    event.status === "open" ? (
      <span className="badge-open">Abierto</span>
    ) : (
      <span className="badge-closed">Cerrado</span>
    );

  const created = new Date(event.createdAt).toLocaleString("es-ES");

  return (
    <div className="glass-panel-soft flex flex-col gap-4 transition duration-200 hover:border-violet-300/50 hover:bg-white/90 dark:hover:border-white/25 dark:hover:bg-white/[0.08] sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="theme-heading text-lg font-semibold tracking-tight">
            {event.name}
          </h2>
          {badge}
        </div>
        <p className="theme-muted mt-2 text-xs">{created}</p>
        <p className="theme-sub mt-1 text-sm">
          {count} asistente{count === 1 ? "" : "s"} · {event.columns.length} columna
          {event.columns.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
        <DeleteEventButton eventId={event.id} eventName={event.name} />
        <Link
          href={`/admin/event/${event.id}`}
          className="btn-secondary touch-manipulation sm:min-w-[140px] text-center"
        >
          Ver detalle
        </Link>
      </div>
    </div>
  );
}
