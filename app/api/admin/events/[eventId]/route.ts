import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, isAdminEmail } from "@/lib/auth";
import { deleteEvent, getEvent, unregisterEventId } from "@/lib/kv";

export async function DELETE(
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

  await deleteEvent(eventId);
  await unregisterEventId(eventId);
  return NextResponse.json({ ok: true });
}
