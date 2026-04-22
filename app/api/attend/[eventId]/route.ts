import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getEvent, saveEvent } from "@/lib/kv";
import type { Attendee } from "@/lib/types";

type Body = {
  name?: string;
  documentId?: string;
  signatureDataUrl?: string;
};

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

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const documentId =
    typeof body.documentId === "string" ? body.documentId.trim() : "";
  const signatureDataUrl =
    typeof body.signatureDataUrl === "string"
      ? body.signatureDataUrl.trim()
      : "";

  if (!name || !documentId || !signatureDataUrl) {
    return NextResponse.json(
      { error: "Nombre, documento y firma son obligatorios." },
      { status: 400 }
    );
  }

  if (!signatureDataUrl.startsWith("data:image/png")) {
    return NextResponse.json(
      { error: "La firma debe ser PNG (data URL)." },
      { status: 400 }
    );
  }

  if (signatureDataUrl.length > 20000) {
    return NextResponse.json(
      { error: "La firma supera el tamaño máximo permitido." },
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

  const attendee: Attendee = {
    id: nanoid(6),
    name,
    documentId,
    submittedAt: new Date().toISOString(),
    signatureDataUrl,
  };

  event.attendees.push(attendee);
  await saveEvent(event);

  return NextResponse.json({ success: true });
}
