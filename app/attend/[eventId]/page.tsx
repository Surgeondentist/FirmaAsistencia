import { notFound } from "next/navigation";
import { AttendForm } from "@/components/AttendForm";
import { getEvent } from "@/lib/kv";

export const dynamic = "force-dynamic";

type Props = { params: { eventId: string } };

export default async function AttendPage({ params }: Props) {
  const event = await getEvent(params.eventId);
  if (!event) {
    notFound();
  }

  if (event.status === "closed") {
    return (
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="rounded border border-gray-200 bg-white px-4 py-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900">
            Este evento ya ha cerrado
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Ya no es posible registrar asistencia para &ldquo;{event.name}
            &rdquo;.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-xl font-semibold text-gray-900">{event.name}</h1>
      <p className="mt-1 text-sm text-gray-600">
        Completa el formulario y firma para confirmar tu asistencia.
      </p>
      <div className="mt-8">
        <AttendForm eventId={event.id} />
      </div>
    </main>
  );
}
