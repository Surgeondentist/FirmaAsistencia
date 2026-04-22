import { kv } from "@vercel/kv";
import type { EventRecord } from "./types";

const EVENT_PREFIX = "event:";
const EVENTS_LIST_KEY = "events:list";

function eventKey(id: string) {
  return `${EVENT_PREFIX}${id}`;
}

export async function getEvent(id: string): Promise<EventRecord | null> {
  const data = await kv.get<string>(eventKey(id));
  if (!data) return null;
  if (typeof data === "string") {
    return JSON.parse(data) as EventRecord;
  }
  return data as unknown as EventRecord;
}

export async function saveEvent(event: EventRecord): Promise<void> {
  await kv.set(eventKey(event.id), JSON.stringify(event));
}

export async function listEventIds(): Promise<string[]> {
  const list = await kv.get<string[]>(EVENTS_LIST_KEY);
  return Array.isArray(list) ? list : [];
}

export async function registerEventId(id: string): Promise<void> {
  const current = await listEventIds();
  if (!current.includes(id)) {
    await kv.set(EVENTS_LIST_KEY, [id, ...current]);
  }
}
