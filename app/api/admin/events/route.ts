import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth/next";
import { authOptions, isAdminEmail } from "@/lib/auth";
import { registerEventId, saveEvent } from "@/lib/kv";
import type { EventRecord } from "@/lib/types";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!isAdminEmail(email ?? null)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  let body: { name?: string };
  try {
    body = (await req.json()) as { name?: string };
  } catch {
    return NextResponse.json(
      { error: "Cuerpo JSON inválido." },
      { status: 400 }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json(
      { error: "El nombre del evento es obligatorio." },
      { status: 400 }
    );
  }

  const id = nanoid(8);
  const baseUrl =
    process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

  const event: EventRecord = {
    id,
    name,
    createdAt: new Date().toISOString(),
    status: "open",
    adminEmail: email!,
    attendees: [],
  };

  await saveEvent(event);
  await registerEventId(id);

  return NextResponse.json({
    id,
    shareUrl: `${baseUrl}/attend/${id}`,
  });
}
