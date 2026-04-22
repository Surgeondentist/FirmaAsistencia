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
    const message = formatGoogleExportError(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function formatGoogleExportError(e: unknown): string {
  const raw =
    e instanceof Error ? e.message : "Error al exportar a Google Sheets.";
  if (/storage quota has been exceeded|quota exceeded|storageQuotaExceeded/i.test(raw)) {
    return (
      "La cuota de Google Drive está llena. El espacio cuenta contra la cuenta " +
      "que es dueña de la carpeta donde exportas (la que compartiste con la " +
      "cuenta de servicio): libera espacio, vacía la papelera o usa otra carpeta " +
      "de una cuenta con almacenamiento disponible."
    );
  }
  if (/insufficientPermissions|403|permission denied/i.test(raw)) {
    return (
      "Google rechazó el acceso. Comprueba que la carpeta de Drive esté " +
      "compartida con el email de la cuenta de servicio, con rol Editor."
    );
  }
  return raw;
}
