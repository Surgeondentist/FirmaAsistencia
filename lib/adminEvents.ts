import { getEvent, listEventIds, listEventIdsForOwner } from "@/lib/kv";
import { isEventOwnedByUser } from "@/lib/eventOwnership";
import type { EventRecord } from "@/lib/types";

/**
 * Eventos visibles para el usuario: índice `owner:{sub}:events` más legacy en `events:list`
 * sin `ownerId` cuyo `adminEmail` coincide con el correo de la sesión.
 */
export async function loadEventsForOwner(
  ownerId: string,
  ownerEmail: string
): Promise<EventRecord[]> {
  const fromOwner = await listEventIdsForOwner(ownerId);
  const globalIds = await listEventIds();
  const idSet = new Set<string>(fromOwner);

  for (const id of globalIds) {
    if (idSet.has(id)) continue;
    const e = await getEvent(id);
    if (!e) continue;
    if (!e.ownerId && isEventOwnedByUser(e, ownerId, ownerEmail)) {
      idSet.add(id);
    }
  }

  const events = (
    await Promise.all(Array.from(idSet, (id) => getEvent(id)))
  ).filter((e): e is EventRecord => e !== null);

  events.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return events;
}
