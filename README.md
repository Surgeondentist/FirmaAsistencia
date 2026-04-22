# Firma y asistencia

Aplicación web mínima para que un administrador cree eventos de asistencia, comparta un enlace temporal, recoja nombre, documento y firma manuscrita por participante, cierre el evento y exporte todo a una hoja de Google (firmas como imágenes ligeras en celdas).

Stack: Next.js 14 (App Router), Tailwind CSS, Vercel KV, NextAuth (Google, un solo correo admin), Google Sheets + Drive (cuenta de servicio), despliegue en Vercel.

## Requisitos

- Node.js 18+
- Cuenta Vercel con KV
- Proyecto Google Cloud con APIs de Sheets y Drive
- Cuenta de servicio con acceso a una carpeta de Drive compartida

## Instalación local

1. `npm install`
2. Copia `.env.example` a `.env.local` y completa todas las variables (ver sección siguiente).
3. `npm run dev` y abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno (`.env.local`)

| Variable | Descripción |
|----------|-------------|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth de Google para NextAuth. |
| `NEXTAUTH_SECRET` | Secreto para firmar cookies de sesión. |
| `NEXTAUTH_URL` | URL pública de la app (en local: `http://localhost:3000`). |
| `ADMIN_EMAIL` | Único correo que puede usar el panel `/admin`. |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Email de la cuenta de servicio. |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Clave privada del JSON (incluye saltos de línea como `\n`). |
| `GOOGLE_DRIVE_FOLDER_ID` | Carpeta de Drive donde se crean hojas e imágenes de firmas (compartida con la cuenta de servicio). |
| `KV_*` | Credenciales del almacén Vercel KV. |

## Configuración en Google Cloud

1. Crea un proyecto y habilita **Google Sheets API** y **Google Drive API**.
2. Crea una **cuenta de servicio**, descarga el JSON y copia `client_email` y `private_key` a las variables `GOOGLE_SERVICE_ACCOUNT_*`.
3. Crea una carpeta en Drive, copia su ID de la URL y asígnalo a `GOOGLE_DRIVE_FOLDER_ID`.
4. Comparte esa carpeta con el email de la cuenta de servicio (rol Editor).
5. Crea credenciales **OAuth 2.0** (tipo aplicación web o escritorio según prefieras; para NextAuth suele usarse cliente web) y rellena `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.

## Vercel KV

1. En el dashboard de Vercel, crea un almacén KV para el proyecto.
2. Conecta el almacén al proyecto y copia `KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc., a las variables de entorno (local y producción).

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Configura las mismas variables de entorno que en `.env.local`, con `NEXTAUTH_URL` apuntando a tu dominio de producción.
3. Despliega; las rutas `/api/*` y el uso de KV funcionan en el entorno serverless.

## Rutas principales

- `/attend/[eventId]` — Formulario público de asistencia.
- `/admin` — Lista de eventos y creación (solo el correo de `ADMIN_EMAIL`).
- `/admin/event/[eventId]` — Detalle, firmas y cierre con exportación a Sheets.

## Scripts

- `npm run dev` — Desarrollo.
- `npm run build` — Compilación de producción.
- `npm run start` — Servidor tras `build`.
- `npm run lint` — ESLint.
