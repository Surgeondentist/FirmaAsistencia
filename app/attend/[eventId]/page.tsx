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
      <main className="mx-auto max-w-md px-4 py-12 sm:py-16">
        <div className="glass-panel text-center">
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10"
            aria-hidden
          >
            <svg
              className="h-7 w-7 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <title>Cerrado</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 00-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-xl font-semibold tracking-tight text-white">
            Este evento ya ha cerrado
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Ya no es posible registrar asistencia para{" "}
            <span className="font-medium text-white">
              &ldquo;{event.name}&rdquo;
            </span>
            .
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8 sm:py-12">
      <header className="mb-8 text-center sm:text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/90">
          Registro de asistencia
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {event.name}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Completa el formulario y firma para confirmar tu asistencia.
        </p>
      </header>
      <div className="glass-panel">
        <AttendForm eventId={event.id} />
      </div>
    </main>
  );
}
