import type { Attendee, EventColumn, EventRecord } from "./types";

const LEGACY_NAME = "__legacy_name";
const LEGACY_DOC = "__legacy_doc";
const LEGACY_SIG = "__legacy_sig";

const LEGACY_COLUMNS: EventColumn[] = [
  { id: LEGACY_NAME, label: "Nombre", kind: "text" },
  { id: LEGACY_DOC, label: "Documento", kind: "text" },
  { id: LEGACY_SIG, label: "Firma", kind: "signature" },
];

type LegacyAttendeeJson = {
  id: string;
  submittedAt: string;
  name?: string;
  documentId?: string;
  signatureDataUrl?: string;
  values?: Record<string, string>;
};

function normalizeAttendee(a: LegacyAttendeeJson): Attendee {
  if (a.values && typeof a.values === "object" && Object.keys(a.values).length > 0) {
    return {
      id: a.id,
      submittedAt: a.submittedAt,
      values: { ...a.values },
    };
  }
  return {
    id: a.id,
    submittedAt: a.submittedAt,
    values: {
      [LEGACY_NAME]: a.name ?? "",
      [LEGACY_DOC]: a.documentId ?? "",
      [LEGACY_SIG]: a.signatureDataUrl ?? "",
    },
  };
}

/** Asegura `columns` y `attendees[].values` (migra JSON antiguo sin columnas). */
export function normalizeEvent(raw: EventRecord): EventRecord {
  const base = { ...raw, attendees: raw.attendees.map((x) => normalizeAttendee(x as LegacyAttendeeJson)) };
  if (raw.columns && Array.isArray(raw.columns) && raw.columns.length > 0) {
    return base;
  }
  return {
    ...base,
    columns: [...LEGACY_COLUMNS],
  };
}
