import Link from "next/link";
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
    <div className="glass-panel-soft flex flex-col gap-4 transition duration-200 hover:border-white/25 hover:bg-white/[0.08] sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold tracking-tight text-white">
            {event.name}
          </h2>
          {badge}
        </div>
        <p className="mt-2 text-xs text-slate-400">{created}</p>
        <p className="mt-1 text-sm text-slate-300">
          {count} asistente{count === 1 ? "" : "s"}
        </p>
      </div>
      <Link
        href={`/admin/event/${event.id}`}
        className="btn-secondary shrink-0 touch-manipulation sm:min-w-[140px]"
      >
        Ver detalle
      </Link>
    </div>
  );
}
