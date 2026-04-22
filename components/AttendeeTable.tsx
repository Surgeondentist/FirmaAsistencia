import type { Attendee } from "@/lib/types";

type Props = {
  attendees: Attendee[];
};

export function AttendeeTable({ attendees }: Props) {
  if (attendees.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-white/20 bg-white/[0.04] px-6 py-10 text-center text-sm text-slate-400 backdrop-blur-md">
        Aún no hay registros de asistencia.
      </p>
    );
  }

  return (
    <div className="glass-table-wrap overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.06]">
            <th
              scope="col"
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400"
            >
              Nombre
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400"
            >
              Documento
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400"
            >
              Hora envío
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400"
            >
              Firma
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {attendees.map((a) => (
            <tr
              key={a.id}
              className="bg-transparent transition hover:bg-white/[0.04]"
            >
              <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-100">
                {a.name}
              </td>
              <td className="px-4 py-3 text-slate-300">{a.documentId}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                {new Date(a.submittedAt).toLocaleString("es-ES")}
              </td>
              <td className="px-4 py-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.signatureDataUrl}
                  alt={`Firma de ${a.name}`}
                  width={150}
                  height={50}
                  className="h-[50px] w-[150px] rounded-lg border border-white/15 bg-white/90 object-contain shadow-inner"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
