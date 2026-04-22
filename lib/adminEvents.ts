import { getEvent, listEventIds } from "@/lib/kv";
import type { EventRecord } from "@/lib/types";

export async function loadEventsForAdmin(): Promise<EventRecord[]> {
  const ids = await listEventIds();
  const events = await Promise.all(ids.map((id) => getEvent(id)));
  const list = events.filter((e): e is EventRecord => e !== null);
  list.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return list;
}
