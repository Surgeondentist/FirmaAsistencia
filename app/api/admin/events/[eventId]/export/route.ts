import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isEventOwnedByUser } from "@/lib/eventOwnership";
import {
  buildEventXlsxBuffer,
  contentDispositionAttachment,
  xlsxAttachmentFilename,
} from "@/lib/eventExportXlsx";
import { getEvent } from "@/lib/kv";

/** Descarga Excel con el estado actual del evento (no modifica abierto/cerrado). */
export async function GET(
  _req: Request,
  { params }: { params: { eventId: string } }
) {
  const session = await getServerSession(authOptions);
  const ownerId = session?.user?.id?.trim();
  const ownerEmail = session?.user?.email?.trim() ?? "";
  if (!ownerId || !ownerEmail) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { eventId } = params;
  const event = await getEvent(eventId);
  if (!event) {
    return NextResponse.json({ error: "Evento no encontrado." }, { status: 404 });
  }

  if (!isEventOwnedByUser(event, ownerId, ownerEmail)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  try {
    const buffer = await buildEventXlsxBuffer(event);
    const filename = xlsxAttachmentFilename(event);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": contentDispositionAttachment(filename),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "No se pudo generar el archivo Excel.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
