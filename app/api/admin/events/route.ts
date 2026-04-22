import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth/next";
import { authOptions, isAdminEmail } from "@/lib/auth";
import { registerEventId, saveEvent } from "@/lib/kv";
import type { EventColumn, EventRecord } from "@/lib/types";

const MAX_COLUMNS = 10;

type CreateBody = {
  name?: string;
  columnCount?: number;
  labels?: string[];
  /** Índice 0-based de la columna de firma, o null si no hay firma. */
  signatureColumnIndex?: number | null;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!isAdminEmail(email ?? null)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  let body: CreateBody;
  try {
    body = (await req.json()) as CreateBody;
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

  const columnCount =
    typeof body.columnCount === "number" && Number.isFinite(body.columnCount)
      ? Math.floor(body.columnCount)
      : 0;
  if (columnCount < 1 || columnCount > MAX_COLUMNS) {
    return NextResponse.json(
      { error: `El número de columnas debe estar entre 1 y ${MAX_COLUMNS}.` },
      { status: 400 }
    );
  }

  const labelsIn = Array.isArray(body.labels) ? body.labels : [];
  const labels: string[] = [];
  for (let i = 0; i < columnCount; i++) {
    const t = typeof labelsIn[i] === "string" ? String(labelsIn[i]).trim() : "";
    labels.push(t || `Campo ${i + 1}`);
  }

  let sigIdx: number | null =
    typeof body.signatureColumnIndex === "number" &&
    Number.isFinite(body.signatureColumnIndex)
      ? Math.floor(body.signatureColumnIndex)
      : null;
  if (sigIdx !== null) {
    if (sigIdx < 0 || sigIdx >= columnCount) {
      return NextResponse.json(
        { error: "Índice de columna de firma inválido." },
        { status: 400 }
      );
    }
  }

  const columns: EventColumn[] = [];
  for (let i = 0; i < columnCount; i++) {
    const kind = sigIdx !== null && i === sigIdx ? "signature" : "text";
    columns.push({
      id: nanoid(8),
      label: labels[i]!,
      kind,
    });
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
    columns,
    attendees: [],
  };

  await saveEvent(event);
  await registerEventId(id);

  return NextResponse.json({
    id,
    shareUrl: `${baseUrl}/attend/${id}`,
  });
}
