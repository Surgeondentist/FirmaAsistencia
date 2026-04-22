import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getEvent, saveEvent } from "@/lib/kv";
import type { Attendee, EventRecord } from "@/lib/types";

const MAX_SIGNATURE_CHARS = 6_000_000;
const MAX_TEXT_FIELD_CHARS = 2000;

type Body = {
  values?: Record<string, string>;
};

function trimValues(
  event: EventRecord,
  raw: Record<string, string> | undefined
): Record<string, string> | null {
  if (!raw || typeof raw !== "object") return null;
  const out: Record<string, string> = {};
  for (const col of event.columns) {
    const v = typeof raw[col.id] === "string" ? raw[col.id].trim() : "";
    out[col.id] = v;
  }
  return out;
}

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  const { eventId } = params;
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { error: "Cuerpo JSON inválido." },
      { status: 400 }
    );
  }

  const event = await getEvent(eventId);
  if (!event) {
    return NextResponse.json({ error: "Evento no encontrado." }, { status: 404 });
  }
  if (event.status === "closed") {
    return NextResponse.json(
      { error: "Este evento ya está cerrado." },
      { status: 409 }
    );
  }

  const values = trimValues(event, body.values);
  if (!values) {
    return NextResponse.json(
      { error: "Faltan los datos del formulario (values)." },
      { status: 400 }
    );
  }

  for (const col of event.columns) {
    const v = values[col.id] ?? "";
    if (col.kind === "text") {
      if (!v) {
        return NextResponse.json(
          { error: `El campo «${col.label}» es obligatorio.` },
          { status: 400 }
        );
      }
      if (v.length > MAX_TEXT_FIELD_CHARS) {
        return NextResponse.json(
          { error: `El campo «${col.label}» es demasiado largo.` },
          { status: 400 }
        );
      }
    }
    if (col.kind === "signature") {
      if (!v || !v.startsWith("data:image/png")) {
        return NextResponse.json(
          { error: "La firma debe ser una imagen PNG (data URL)." },
          { status: 400 }
        );
      }
      if (v.length > MAX_SIGNATURE_CHARS) {
        return NextResponse.json(
          { error: "La firma supera el tamaño máximo permitido." },
          { status: 400 }
        );
      }
    }
  }

  const attendee: Attendee = {
    id: nanoid(6),
    submittedAt: new Date().toISOString(),
    values,
  };

  event.attendees.push(attendee);
  await saveEvent(event);

  return NextResponse.json({ success: true });
}
