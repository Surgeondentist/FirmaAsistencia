# Firma y asistencia

Aplicación web mínima para que un administrador cree eventos de asistencia, comparta un enlace temporal, recoja nombre, documento y firma manuscrita por participante, cierre el evento y descargue todo en un **Excel (.xlsx)** con las firmas como imágenes en la hoja.

Stack: Next.js 14 (App Router), Tailwind CSS, Vercel KV, NextAuth (Google: cualquier usuario con email), generación de Excel con ExcelJS, despliegue en Vercel.

## Requisitos

- Node.js 18+
- Cuenta Vercel con KV (o Redis compatible vía `@vercel/kv`)
- Proyecto Google Cloud solo para **OAuth** de inicio de sesión (NextAuth): credenciales OAuth cliente web

## Instalación local

1. `npm install`
2. Copia `.env.example` a `.env.local` y completa las variables (ver sección siguiente).
3. `npm run dev` y abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno (`.env.local`)

| Variable | Descripción |
|----------|-------------|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth de Google para NextAuth. |
| `NEXTAUTH_SECRET` | Secreto para firmar cookies de sesión. |
| `NEXTAUTH_URL` | URL pública de la app (en local: `http://localhost:3000`). |
| `KV_*` o `STORAGE_KV_*` | Credenciales del almacén Redis/KV. |

El panel `/admin` admite **cualquier** cuenta Google con correo verificado; cada usuario solo lista y gestiona eventos con su `ownerId` (Google `sub`). Los eventos antiguos sin `ownerId` siguen visibles para el correo guardado en `adminEmail`.

## Configuración en Google Cloud (OAuth para el panel)

1. Crea un proyecto (o usa uno existente).
2. APIs y servicios → Credenciales → Crear credenciales → **ID de cliente OAuth** (aplicación web).
3. Orígenes autorizados: `http://localhost:3000` (y tu dominio en producción). URI de redirección: `http://localhost:3000/api/auth/callback/google` (y el equivalente en producción).
4. Pantalla de consentimiento OAuth con tu correo de contacto.
5. Rellena `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en `.env.local`.

## Vercel KV

1. En el dashboard de Vercel, crea un almacén KV para el proyecto.
2. Conecta el almacén al proyecto y copia `KV_REST_API_URL`, `KV_REST_API_TOKEN`, etc., a las variables de entorno (local y producción).

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. Configura las mismas variables de entorno que en `.env.local`, con `NEXTAUTH_URL` apuntando a tu dominio de producción.
3. Despliega; las rutas `/api/*` y el uso de KV funcionan en el entorno serverless.

## Dominio personalizado (ej. `firmero.redshell.cloud`)

1. **DNS** (donde gestionas `redshell.cloud`): crea un registro que apunte al hosting, por ejemplo **CNAME** `firmero` → `cname.vercel-dns.com` (o el valor que indique Vercel al añadir el dominio).
2. **Vercel**: proyecto → *Settings* → *Domains* → añade `firmero.redshell.cloud`, verifica y espera a que el certificado SSL quede activo.
3. **Variables de entorno en Vercel** (y en `.env.local` si pruebas contra producción):
   - `NEXTAUTH_URL=https://firmero.redshell.cloud` (sin `/` al final).
4. **Google Cloud Console** (credencial OAuth “aplicación web”):
   - *Orígenes JavaScript autorizados*: `https://firmero.redshell.cloud`
   - *URI de redirección autorizadas*: `https://firmero.redshell.cloud/api/auth/callback/google`
   - Mantén también las entradas de `http://localhost:3000` si sigues desarrollando en local.
5. **Redeploy** del proyecto en Vercel tras cambiar variables o dominios.

El enlace del logo inferior usa la misma base que `NEXTAUTH_URL` (en local abre `localhost:3000`).

## Rutas principales

- `/attend/[eventId]` — Formulario público de asistencia.
- `/admin` — Lista de **tus** eventos y creación de nuevos (sesión Google).
- `/admin/event/[eventId]` — Detalle, firmas y cierre con descarga **.xlsx**.

## Scripts

- `npm run dev` — Desarrollo.
- `npm run build` — Compilación de producción.
- `npm run start` — Servidor tras `build`.
- `npm run lint` — ESLint.
