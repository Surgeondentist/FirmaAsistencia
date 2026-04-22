import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, isAdminEmail } from "@/lib/auth";
import {
  buildEventXlsxBuffer,
  contentDispositionAttachment,
  xlsxAttachmentFilename,
} from "@/lib/eventExportXlsx";
import { getEvent, saveEvent } from "@/lib/kv";

export async function POST(
  _req: Request,
  { params }: { params: { eventId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!isAdminEmail(session?.user?.email ?? null)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { eventId } = params;
  const event = await getEvent(eventId);
  if (!event) {
    return NextResponse.json({ error: "Evento no encontrado." }, { status: 404 });
  }

  event.status = "closed";
  await saveEvent(event);

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
