import type { EventColumn } from "./types";

export function signatureColumn(columns: EventColumn[]): EventColumn | undefined {
  return columns.find((c) => c.kind === "signature");
}

export function textColumns(columns: EventColumn[]): EventColumn[] {
  return columns.filter((c) => c.kind === "text");
}
