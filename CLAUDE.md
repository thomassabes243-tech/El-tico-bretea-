@AGENTS.md

# Estado del proyecto — El Mexa Chamba

> Este archivo se lee automáticamente al empezar o retomar cualquier sesión.
> Regla para mí mismo (Claude): **antes de pedirle al dueño del producto un
> dato que ya podría haber dado antes** (precios, si apretó tal botón, IDs,
> etc.), releer esta sección primero. Actualizar este archivo cada vez que
> se cierra algo importante — no esperar a que lo pidan.

## Arquitectura y stack

- **Next.js 16.3.0** (App Router, Turbopack) — ver `AGENTS.md` arriba para
  las diferencias de esta versión respecto al conocimiento de entrenamiento
  (Proxy en vez de Middleware, caché de rutas, etc.). **Leer eso antes de
  tocar rutas, auth o caché.**
- **Prisma 6.19.3 + Postgres (Neon)** — `DATABASE_URL` = conexión pooled,
  `DIRECT_URL` = conexión directa (solo para `prisma migrate deploy`, ver
  `scripts/build-migrate.mjs`, corre automático en cada build de Vercel).
- **Auth.js v5 beta** (`next-auth@5.0.0-beta.32`), JWT, Credentials provider.
- **Vercel** — team `team_WFcOeEmPk9DNRXZylT5GP8hO`, proyecto
  `prj_bj8CEpgSaX8oaoCIeYNLlVCZaXr7`. Producción real:
  `https://mexico-sin-hambre-el-tico-bretea.vercel.app` — **NO**
  `mexicosinhambre.com` (aparece como alias del proyecto en Vercel, pero el
  DNS real del dominio no apunta ahí todavía — devuelve
  DNS_PROBE_FINISHED_NXDOMAIN; hay que usar la URL de `.vercel.app`).
- **Resend** (`src/lib/email.ts`) — recuperación de contraseña por email.
  Un solo API key (`RESEND_API_KEY`), sin contraseña ni 2FA. Sin verificar
  un dominio propio en Resend, solo entrega al correo de la propia cuenta,
  no a usuarios reales — pendiente que el dueño verifique un dominio.
- **PayPal Subscriptions API** (`src/lib/paypal.ts`, `paypal-plans.ts`) —
  ver sección de planes de pago más abajo, es la parte más confundida hoy.
- **Google AdSense** (`src/components/ads/AdSenseSlot.tsx`) — espacio real
  entre resultados de búsqueda, necesita `NEXT_PUBLIC_ADSENSE_SLOT_ID`
  (crear el ad unit en la cuenta de AdSense primero). Además existen
  anuncios propios ("house ads", `AdSlot.tsx`) que no dependen de esto.
- **Rama activa**: `claude/app-second-version-h8ujrh` — este es "El Mexa
  Chamba" (México). La rama `claude/el-tico-bretea-hxg8aq` es un producto
  DISTINTO (Costa Rica, "El Tico Bretea" original) — **no tocar ni mergear**,
  decisión explícita del dueño del producto.

### Decisiones ya tomadas — no reabrir sin motivo nuevo

- `connection_limit=5` en la URL de conexión a Neon (`src/lib/prisma.ts`),
  además de `connect_timeout=20` y `pool_timeout=30`. Motivo: sin esto,
  Prisma calculaba un límite de conexiones pensado para un servidor de
  larga duración, no para funciones serverless — cada invocación en Vercel
  abre su propio pool, y con tráfico concurrente se podían abrir más
  conexiones reales contra Neon de las que el plan gratuito soporta. Esto
  causó el error intermitente "Can't reach database server" (reapareció
  una vez después del primer mitigation con solo los timeouts).
- `secureCookie` en `src/proxy.ts` se deriva de `request.nextUrl.protocol`
  explícito — `getToken()` no lo detecta solo, y sin esto TODO usuario
  logueado en producción era tratado como sin sesión (bug real que llegó a
  producción una vez, commit `533d856`).
- `/cotizaciones` tiene `export const dynamic = "force-dynamic"` — es la
  única página que hace solo `auth()` + `redirect()` sin ninguna otra
  lectura dinámica, lo que la volvía elegible para pre-renderizado estático
  y servía la misma redirección cacheada a cualquiera por 5 minutos.
- Login (`src/lib/rate-limit.ts`: `isLoginRateLimited`/`recordFailedLogin`/
  `clearLoginRateLimit`) cuenta SOLO intentos fallidos y se limpia en un
  login correcto — a diferencia de `checkRateLimit` (usado en
  registro/pánico/alertas), que cuenta todo intento por diseño.
- El PDF del CV se queda gratis para todos (decisión explícita, no
  reabrir) — el beneficio de Premium relacionado al CV es una insignia
  visual en el PDF (`src/lib/cv-pdf.tsx`), no un cobro.
- **No existe ningún concepto de "link de pago" en esta app.** Los 3 planes
  de PayPal se crean únicamente apretando el botón "Crear/actualizar planes
  de PayPal" en `/admin/configuracion` — ese botón llama a la API de
  PayPal solo, usando los precios ya guardados en esa misma pantalla. Si el
  dueño creó algo manualmente en paypal.com (ej. un "Payment Link"), es una
  función distinta de PayPal que esta app no usa ni conoce.

## Planes de pago (PayPal Subscriptions)

Tres planes independientes, cada uno con su propio precio y su propio ID de
PayPal guardados en `AppSettings` (tabla singleton). **Estado real (¿ya se
creó cada uno en PayPal, con qué ID?) — NO VERIFICADO desde acá:** no hay
forma de consultar la base de producción ni la cuenta de PayPal desde este
entorno. La única forma confiable de saberlo es abrir
`/admin/configuracion` logueado como admin — esa pantalla muestra en vivo,
para cada plan, "✅ Creado" o "⚠️ Falta crear".

| Plan | Precio de diseño (default en el código) | Para quién | Campo de precio | Campo de ID |
|---|---|---|---|---|
| Premium trabajador | $1500 MXN/mes | Trabajadores (perfil destacado, insignia en CV, sin anuncios) | `premiumPricePesos` | `paypalPremiumPlanId` |
| Plan Profesional (Cotizaciones) | $120 MXN/mes | Empresas/profesionales que ofrecen servicios en Cotizaciones (mejor posición en la bandeja de solicitudes) | `professionalPricePesos` | `paypalProfessionalPlanId` |
| Plan Empleador | $250 MXN/mes | Empresas que publican vacantes (sin límite de vacantes activas simultáneas) | `employerPlanPricePesos` | `paypalEmployerPlanId` |

⚠️ **Pendiente de confirmar con el dueño**: en algún momento reportó haber
puesto $1500 en el campo de Plan Profesional también (pensando en usar "un
mismo plan para los dos lados"), lo cual no es como está diseñado el
sistema — son y deben seguir siendo 3 planes separados, cada uno con su
propio precio. Si ese campo todavía dice $1500 en `/admin/configuracion`,
hay que volver a poner `120` y guardar. Actualizar esta tabla en cuanto se
confirme el estado real.

## Bugs conocidos

| Bug | Estado |
|---|---|
| Login rate-limit contaba intentos correctos como fallidos | ✅ Resuelto (`edf7ee7`) |
| `secureCookie` bloqueaba a todos los logueados en producción | ✅ Resuelto (`533d856`) |
| Crash `toLocaleDateString` en `/vacantes/[id]` (Date llegaba como string tras cache hit) | ✅ Resuelto (`470eb71`) |
| `/cotizaciones` servía redirect cacheado a cualquiera (bug de caché estático) | ✅ Resuelto (`53bba64`, en el commit de fase 1 del rediseño) |
| Neon: "Can't reach database server" intermitente | ⚠️ Mitigado dos veces (`0d20ad8`, `b5e729b`) — reapareció una vez después del primer intento. Vigilar si vuelve a pasar después de `connection_limit=5`; si sigue, el próximo paso es revisar el límite de conexiones del plan de Neon en su propio dashboard (sin acceso a eso desde acá). |

## Pausado a pedido explícito del dueño del producto

No tocar esto hasta que él mismo diga que se retoma:

- Resto del punto 5 del audit de seguridad: semáforo de empleador
  tri-estado, flujo dedicado "Voy al trabajo", confirmación de llegada +
  escalamiento, líneas 089/800 5533 000, expediente de seguridad.
- `apple-touch-icon`.

## Rediseño visual (brief de 19 secciones, ver commits `53bba64`/`d227181`)

- ✅ Fase 1: hero de Inicio con foto real (no ilustración) + buscador con
  más presencia visual.
- ⬜ Fase 2: Buscador + Categorías (ajustes menores, ya cerca del brief).
- ⬜ Fase 3: Cotizaciones / Mis solicitudes.
- ⬜ Fase 4: CV / Perfil.
- ⬜ Fase 5: tipografía DM Sans para texto de cuerpo (cambio grande y
  riesgoso: casi todo el texto tipo "título" hoy es negrita en párrafos
  normales, no `<h1>/<h2>` reales — tocaría muchos archivos), toasts,
  skeletons, responsive fino.

## Variables de entorno pendientes de configurar en Vercel

- `RESEND_API_KEY` — recuperación de contraseña (sin esto, error claro en
  vez de fallar de forma rara).
- `NEXT_PUBLIC_ADSENSE_SLOT_ID` — espacio real de AdSense (crear el ad
  unit en la cuenta de AdSense primero).
- Credenciales de PayPal (`NEXT_PUBLIC_PAYPAL_CLIENT_ID`,
  `PAYPAL_CLIENT_SECRET`) — estado no confirmado desde acá.

## Regla de verificación en producción

Nada se reporta como "confirmado" sin probarlo contra la URL real
(`https://mexico-sin-hambre-el-tico-bretea.vercel.app`, con las
herramientas de Vercel conectadas) y citar exactamente qué se vio ahí.
Verificación solo local o en preview no cuenta como confirmado.
