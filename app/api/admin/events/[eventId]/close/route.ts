import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, isAdminEmail } from "@/lib/auth";
import { exportToGoogleSheets } from "@/lib/googleSheets";
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
    const sheetUrl = await exportToGoogleSheets(event);
    return NextResponse.json({ sheetUrl });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Error al exportar a Google Sheets.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
