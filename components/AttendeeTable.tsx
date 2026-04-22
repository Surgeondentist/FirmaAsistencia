import type { Attendee } from "@/lib/types";

type Props = {
  attendees: Attendee[];
};

export function AttendeeTable({ attendees }: Props) {
  if (attendees.length === 0) {
    return (
      <p className="rounded border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-600">
        Aún no hay registros de asistencia.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 font-medium text-gray-700">Nombre</th>
            <th className="px-3 py-2 font-medium text-gray-700">Documento</th>
            <th className="px-3 py-2 font-medium text-gray-700">Hora envío</th>
            <th className="px-3 py-2 font-medium text-gray-700">Firma</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {attendees.map((a) => (
            <tr key={a.id}>
              <td className="px-3 py-2 text-gray-900">{a.name}</td>
              <td className="px-3 py-2 text-gray-800">{a.documentId}</td>
              <td className="px-3 py-2 text-gray-600">
                {new Date(a.submittedAt).toLocaleString("es-ES")}
              </td>
              <td className="px-3 py-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.signatureDataUrl}
                  alt={`Firma de ${a.name}`}
                  width={150}
                  height={50}
                  className="h-[50px] w-[150px] border border-gray-100 bg-white object-contain"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
