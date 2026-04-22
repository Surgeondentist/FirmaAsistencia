import Link from "next/link";
import type { EventRecord } from "@/lib/types";

type Props = {
  event: EventRecord;
};

export function EventCard({ event }: Props) {
  const count = event.attendees.length;
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

  const created = new Date(event.createdAt).toLocaleString("es-ES");

  return (
    <div className="flex flex-col gap-2 rounded border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-medium text-gray-900">{event.name}</h2>
          {badge}
        </div>
        <p className="mt-1 text-sm text-gray-500">{created}</p>
        <p className="text-sm text-gray-600">
          {count} asistente{count === 1 ? "" : "s"}
        </p>
      </div>
      <Link
        href={`/admin/event/${event.id}`}
        className="inline-flex shrink-0 justify-center rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
      >
        Ver detalle
      </Link>
    </div>
  );
}
