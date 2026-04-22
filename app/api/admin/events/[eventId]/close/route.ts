import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { isEventOwnedByUser } from "@/lib/eventOwnership";
import { getEvent, registerEventIdForOwner, saveEvent } from "@/lib/kv";

export async function POST(
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

  if (event.status === "closed") {
    return NextResponse.json({ error: "El evento ya estaba cerrado." }, { status: 400 });
  }

  if (!event.ownerId) {
    event.ownerId = ownerId;
    await registerEventIdForOwner(ownerId, event.id);
  }

  event.status = "closed";
  await saveEvent(event);

  return NextResponse.json({ ok: true });
}
