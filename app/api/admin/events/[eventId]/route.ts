import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isEventOwnedByUser } from "@/lib/eventOwnership";
import { deleteEvent, getEvent, removeEventFromAllLists } from "@/lib/kv";

export async function DELETE(
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

  await removeEventFromAllLists(event);
  await deleteEvent(eventId);
  return NextResponse.json({ ok: true });
}
