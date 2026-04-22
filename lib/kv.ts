import { createClient } from "@vercel/kv";
import { normalizeEvent } from "@/lib/eventNormalize";
import type { EventRecord } from "./types";

/**
 * Vercel Storage / Upstash suele inyectar STORAGE_KV_REST_*.
 * En local o despliegues manuales se usan KV_REST_* (compatibilidad @vercel/kv).
 */
function kvUrl(): string | undefined {
  return (
    process.env.KV_REST_API_URL?.trim() ||
    process.env.STORAGE_KV_REST_API_URL?.trim()
  );
}

function kvToken(): string | undefined {
  return (
    process.env.KV_REST_API_TOKEN?.trim() ||
    process.env.STORAGE_KV_REST_API_TOKEN?.trim()
  );
}

const kv = (() => {
  const url = kvUrl();
  const token = kvToken();
  if (!url || !token) {
    return null;
  }
  return createClient({ url, token });
})();

function client() {
  if (!kv) {
    throw new Error(
      "Redis: define KV_REST_API_URL y KV_REST_API_TOKEN, o las que inyecta Vercel Storage (STORAGE_KV_REST_API_URL y STORAGE_KV_REST_API_TOKEN)."
    );
  }
  return kv;
}

const EVENT_PREFIX = "event:";
const EVENTS_LIST_KEY = "events:list";
const OWNER_EVENTS_PREFIX = "owner:";

function eventKey(id: string) {
  return `${EVENT_PREFIX}${id}`;
}

function ownerEventIdsKey(ownerId: string) {
  return `${OWNER_EVENTS_PREFIX}${ownerId}:events`;
}

export async function getEvent(id: string): Promise<EventRecord | null> {
  const data = await client().get<string>(eventKey(id));
  if (!data) return null;
  const parsed =
    typeof data === "string"
      ? (JSON.parse(data) as EventRecord)
      : (data as unknown as EventRecord);
  return normalizeEvent(parsed);
}

export async function saveEvent(event: EventRecord): Promise<void> {
  await client().set(eventKey(event.id), JSON.stringify(event));
}

export async function listEventIds(): Promise<string[]> {
  const list = await client().get<string[]>(EVENTS_LIST_KEY);
  return Array.isArray(list) ? list : [];
}

export async function registerEventId(id: string): Promise<void> {
  const current = await listEventIds();
  if (!current.includes(id)) {
    await client().set(EVENTS_LIST_KEY, [id, ...current]);
  }
}

export async function unregisterEventId(id: string): Promise<void> {
  const current = await listEventIds();
  const next = current.filter((x) => x !== id);
  await client().set(EVENTS_LIST_KEY, next);
}

/** Índice por dueño (Google `sub`). */
export async function listEventIdsForOwner(ownerId: string): Promise<string[]> {
  const list = await client().get<string[]>(ownerEventIdsKey(ownerId));
  return Array.isArray(list) ? list : [];
}

export async function registerEventIdForOwner(
  ownerId: string,
  id: string
): Promise<void> {
  const key = ownerEventIdsKey(ownerId);
  const current = await listEventIdsForOwner(ownerId);
  if (!current.includes(id)) {
    await client().set(key, [id, ...current]);
  }
}

export async function unregisterEventIdFromOwner(
  ownerId: string,
  id: string
): Promise<void> {
  const key = ownerEventIdsKey(ownerId);
  const current = await listEventIdsForOwner(ownerId);
  const next = current.filter((x) => x !== id);
  await client().set(key, next);
}

/** Quita el id de la lista global (legacy) y de la lista del dueño si aplica. */
export async function removeEventFromAllLists(event: EventRecord): Promise<void> {
  await unregisterEventId(event.id);
  if (event.ownerId) {
    await unregisterEventIdFromOwner(event.ownerId, event.id);
  }
}

export async function deleteEvent(id: string): Promise<void> {
  await client().del(eventKey(id));
}
