import { google } from "googleapis";
import type { drive_v3, sheets_v4 } from "googleapis";
import { Readable } from "stream";
import type { EventRecord } from "./types";

/**
 * En cuentas personales de Google, los archivos creados por la cuenta de servicio
 * pueden contar contra una cuota distinta. Tras crear el archivo, transferir
 * propiedad a un usuario (Gmail) hace que "pesen" en su Drive.
 * @see https://developers.google.com/drive/api/v3/reference/permissions/create
 */
function driveTransferOwnerEmail(): string | null {
  const explicit = process.env.GOOGLE_DRIVE_TRANSFER_OWNER_EMAIL?.trim();
  if (explicit) return explicit.toLowerCase();
  const admin = process.env.ADMIN_EMAIL?.trim();
  return admin ? admin.toLowerCase() : null;
}

async function transferFileOwnershipToUser(
  drive: drive_v3.Drive,
  fileId: string
): Promise<void> {
  const email = driveTransferOwnerEmail();
  if (!email) return;
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "owner",
      type: "user",
      emailAddress: email,
    },
    transferOwnership: true,
    supportsAllDrives: true,
  });
}

function getPrivateKey(): string {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY ?? "";
  return raw.replace(/\\n/g, "\n");
}

function getJwtClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = getPrivateKey();
  if (!email || !key) {
    throw new Error("Faltan credenciales del service account de Google.");
  }
  return new google.auth.JWT({
    email,
    key,
    scopes: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/spreadsheets",
    ],
  });
}

function parsePngBase64(signatureDataUrl: string): Buffer {
  const prefix = "data:image/png;base64,";
  if (!signatureDataUrl.startsWith(prefix)) {
    throw new Error("Firma no es PNG en base64.");
  }
  const b64 = signatureDataUrl.slice(prefix.length);
  return Buffer.from(b64, "base64");
}

export async function exportToGoogleSheets(
  event: EventRecord
): Promise<string> {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID no está configurado.");
  }

  const auth = getJwtClient();
  await auth.authorize();

  const drive = google.drive({ version: "v3", auth });
  const sheets = google.sheets({ version: "v4", auth });

  const exportDate = new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const title = `${event.name} — ${exportDate}`;

  const createRes = await drive.files.create({
    requestBody: {
      name: title,
      mimeType: "application/vnd.google-apps.spreadsheet",
      parents: [folderId],
    },
    fields: "id, webViewLink",
    supportsAllDrives: true,
  });

  const spreadsheetId = createRes.data.id;
  if (!spreadsheetId) {
    throw new Error("No se pudo crear la hoja de cálculo.");
  }

  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets(properties(sheetId,title))",
  });
  const sheetId = meta.data.sheets?.[0]?.properties?.sheetId ?? 0;

  const header = [["N°", "Nombre", "Documento", "Hora envío", "Firma"]];
  const rows: (string | number)[][] = event.attendees.map((a, i) => [
    i + 1,
    a.name,
    a.documentId,
    new Date(a.submittedAt).toLocaleString("es-ES"),
    "",
  ]);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `A1:E${1 + rows.length}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [...header, ...rows],
    },
  });

  const formulaRequests: sheets_v4.Schema$Request[] = [];

  for (let i = 0; i < event.attendees.length; i++) {
    const attendee = event.attendees[i];
    const rowIndex = i + 1;
    let cell: sheets_v4.Schema$Request;

    try {
      const png = parsePngBase64(attendee.signatureDataUrl);
      const upload = await drive.files.create({
        requestBody: {
          name: `firma_${attendee.id}.png`,
          parents: [folderId],
        },
        media: {
          mimeType: "image/png",
          body: Readable.from(png),
        },
        fields: "id",
        supportsAllDrives: true,
      });
      const fileId = upload.data.id;
      if (!fileId) {
        throw new Error("Sin id de archivo");
      }
      await drive.permissions.create({
        fileId,
        requestBody: { role: "reader", type: "anyone" },
        supportsAllDrives: true,
      });
      await transferFileOwnershipToUser(drive, fileId);
      const formula = `=IMAGE("https://drive.google.com/uc?id=${fileId}")`;
      cell = {
        updateCells: {
          range: {
            sheetId,
            startRowIndex: rowIndex,
            endRowIndex: rowIndex + 1,
            startColumnIndex: 4,
            endColumnIndex: 5,
          },
          rows: [
            {
              values: [
                {
                  userEnteredValue: {
                    formulaValue: formula,
                  },
                },
              ],
            },
          ],
          fields: "userEnteredValue",
        },
      };
    } catch {
      cell = {
        updateCells: {
          range: {
            sheetId,
            startRowIndex: rowIndex,
            endRowIndex: rowIndex + 1,
            startColumnIndex: 4,
            endColumnIndex: 5,
          },
          rows: [
            {
              values: [
                {
                  userEnteredValue: {
                    stringValue: "Error al cargar firma",
                  },
                },
              ],
            },
          ],
          fields: "userEnteredValue",
        },
      };
    }
    formulaRequests.push(cell);
  }

  const dimensionRequests: sheets_v4.Schema$Request[] = [
    {
      updateDimensionProperties: {
        range: {
          sheetId,
          dimension: "COLUMNS",
          startIndex: 4,
          endIndex: 5,
        },
        properties: { pixelSize: 160 },
        fields: "pixelSize",
      },
    },
  ];

  if (event.attendees.length > 0) {
    dimensionRequests.push({
      updateDimensionProperties: {
        range: {
          sheetId,
          dimension: "ROWS",
          startIndex: 1,
          endIndex: 1 + event.attendees.length,
        },
        properties: { pixelSize: 80 },
        fields: "pixelSize",
      },
    });
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [...formulaRequests, ...dimensionRequests],
    },
  });

  await transferFileOwnershipToUser(drive, spreadsheetId);

  const link =
    createRes.data.webViewLink ??
    `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
  return link;
}
