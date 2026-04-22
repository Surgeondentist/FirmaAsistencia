import type { Attendee, EventColumn } from "@/lib/types";

type Props = {
  columns: EventColumn[];
  attendees: Attendee[];
};

export function AttendeeTable({ columns, attendees }: Props) {
  if (attendees.length === 0) {
    return (
      <p className="theme-muted rounded-2xl border border-dashed border-slate-300/70 bg-slate-50/80 px-6 py-10 text-center text-sm backdrop-blur-md dark:border-white/20 dark:bg-white/[0.04]">
        Aún no hay registros de asistencia.
      </p>
    );
  }

  return (
    <div className="glass-table-wrap overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200/90 bg-slate-100/80 dark:border-white/10 dark:bg-white/[0.06]">
            {columns.map((col) => (
              <th
                key={col.id}
                scope="col"
                className="theme-muted px-4 py-3 text-xs font-semibold uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
            <th
              scope="col"
              className="theme-muted px-4 py-3 text-xs font-semibold uppercase tracking-wider"
            >
              Hora envío
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/80 dark:divide-white/10">
          {attendees.map((a) => (
            <tr
              key={a.id}
              className="bg-transparent transition hover:bg-slate-100/70 dark:hover:bg-white/[0.04]"
            >
              {columns.map((col) => (
                <td key={col.id} className="theme-sub px-4 py-3 align-top">
                  {col.kind === "signature" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.values[col.id] ?? ""}
                      alt={`${col.label}`}
                      width={150}
                      height={50}
                      className="h-[50px] w-[150px] rounded-lg border border-slate-200 bg-white object-contain shadow-inner dark:border-white/15 dark:bg-white/90"
                    />
                  ) : (
                    <span className="theme-heading font-medium">
                      {a.values[col.id] ?? "—"}
                    </span>
                  )}
                </td>
              ))}
              <td className="theme-muted whitespace-nowrap px-4 py-3">
                {new Date(a.submittedAt).toLocaleString("es-ES")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
