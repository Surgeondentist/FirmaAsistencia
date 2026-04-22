import type { EventRecord } from "@/lib/types";

function emailsEqual(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * El usuario de la sesión puede gestionar el evento si coincide `ownerId` (Google `sub`)
 * o, en datos legacy sin `ownerId`, si `adminEmail` coincide con su correo.
 */
export function isEventOwnedByUser(
  event: EventRecord,
  ownerId: string,
  ownerEmail: string
): boolean {
  if (event.ownerId) {
    return event.ownerId === ownerId;
  }
  return emailsEqual(event.adminEmail, ownerEmail);
}
