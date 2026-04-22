export type EventColumnKind = "text" | "signature";

export type EventColumn = {
  id: string;
  label: string;
  kind: EventColumnKind;
};

export type Attendee = {
  id: string;
  submittedAt: string;
  /** Valores por id de columna; en columnas `signature` va el data URL PNG. */
  values: Record<string, string>;
};

export type EventRecord = {
  id: string;
  name: string;
  createdAt: string;
  status: "open" | "closed";
  adminEmail: string;
  /** Columnas del formulario (1–10). Exactamente 0 o 1 columna `signature`. */
  columns: EventColumn[];
  attendees: Attendee[];
};
