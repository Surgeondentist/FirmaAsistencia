import { Buffer } from "node:buffer";
import ExcelJS from "exceljs";
import type { EventRecord } from "./types";

function parsePngBase64(signatureDataUrl: string): Buffer | null {
  const prefix = "data:image/png;base64,";
  if (!signatureDataUrl.startsWith(prefix)) return null;
  try {
    return Buffer.from(signatureDataUrl.slice(prefix.length), "base64");
  } catch {
    return null;
  }
}

/** Nombre seguro para archivo (Windows / cabeceras HTTP). */
export function xlsxAttachmentFilename(event: EventRecord): string {
  const safe =
    event.name
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80) || "evento";
  return `${safe}-asistencia.xlsx`;
}

export function contentDispositionAttachment(filename: string): string {
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_") || "asistencia.xlsx";
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export async function buildEventXlsxBuffer(event: EventRecord): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Firma Asistencia";
  const sheet = workbook.addWorksheet("Asistencia");

  const cols = event.columns;
  const totalDataCols = 1 + cols.length + 1;
  for (let c = 1; c <= totalDataCols; c++) {
    sheet.getColumn(c).width = c === 1 ? 6 : c === totalDataCols ? 22 : 24;
  }

  const headerCells: (string | undefined)[] = [undefined, "N°"];
  for (const col of cols) {
    headerCells.push(col.label);
  }
  headerCells.push("Hora envío");
  const h = sheet.getRow(1);
  h.values = headerCells;
  h.font = { bold: true };
  h.height = 22;

  const sigColIndex = cols.findIndex((c) => c.kind === "signature");

  for (let i = 0; i < event.attendees.length; i++) {
    const a = event.attendees[i];
    const excelRow = i + 2;
    const row = sheet.getRow(excelRow);
    const rowVals: (string | number | undefined)[] = [undefined, i + 1];
    for (const col of cols) {
      if (col.kind === "signature") {
        rowVals.push("");
      } else {
        rowVals.push(a.values[col.id] ?? "");
      }
    }
    rowVals.push(new Date(a.submittedAt).toLocaleString("es-ES"));
    row.values = rowVals;
    row.height = sigColIndex >= 0 ? 96 : 22;

    if (sigColIndex >= 0) {
      const sigCol = cols[sigColIndex];
      if (sigCol) {
        const dataUrl = a.values[sigCol.id] ?? "";
        const png = parsePngBase64(dataUrl);
        if (png && png.length > 0) {
          const imageId = workbook.addImage({
            buffer: Buffer.from(png) as unknown as ExcelJS.Buffer,
            extension: "png",
          });
          sheet.addImage(imageId, {
            tl: { col: 1 + sigColIndex, row: excelRow - 1 },
            ext: { width: 160, height: 72 },
          });
        }
      }
    }
  }

  const buf = await workbook.xlsx.writeBuffer();
  return Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
}
