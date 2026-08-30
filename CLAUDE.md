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

| Plan | Precio (default en el código) | Para quién | Campo de precio | Campo de ID |
|---|---|---|---|---|
| Premium trabajador | $120 MXN/mes | Trabajadores (perfil destacado, insignia, sin anuncios) | `premiumPricePesos` | `paypalPremiumPlanId` |
| Plan Profesional (Cotizaciones) | $120 MXN/mes | Empresas/profesionales que ofrecen servicios en Cotizaciones (mejor posición en la bandeja de solicitudes) | `professionalPricePesos` | `paypalProfessionalPlanId` |
| Plan Empleador | $120 MXN/mes | Empresas que publican vacantes (sin límite de vacantes activas simultáneas) | `employerPlanPricePesos` | `paypalEmployerPlanId` |

✅ **Confirmado por el dueño (esta vez sí, a propósito, no un error como la
vez pasada)**: los 3 planes quedan al mismo precio, **$120 MXN/mes**.
Premium trabajador bajó de $1500 y Plan Empleador bajó de $250; Plan
Profesional no cambió (ya estaba en $120). Aplicado con la migración de
datos `20260830060000_plan_precios_unificados_120` (además de bajar los
`@default` del schema para instalaciones nuevas) — actualiza la fila
singleton ya existente en producción (que un `@default` de schema no
toca) y pone en `NULL` los IDs de plan de PayPal de Premium y Empleador
(Profesional no cambió de precio, su ID se dejó intacto) para que
`/admin/configuracion` los marque "⚠️ Falta crear". **Pendiente que el
dueño entre a `/admin/configuracion` y apriete "Crear/actualizar planes de
PayPal"** una vez que este cambio esté desplegado — esa API llama a PayPal
con las credenciales reales de producción, que no existen en este entorno,
así que ese último paso no se pudo hacer desde acá.

## Bugs conocidos

| Bug | Estado |
|---|---|
| Login rate-limit contaba intentos correctos como fallidos | ✅ Resuelto (`edf7ee7`) |
| `secureCookie` bloqueaba a todos los logueados en producción | ✅ Resuelto (`533d856`) |
| Crash `toLocaleDateString` en `/vacantes/[id]` (Date llegaba como string tras cache hit) | ✅ Resuelto (`470eb71`) |
| `/cotizaciones` servía redirect cacheado a cualquiera (bug de caché estático) | ✅ Resuelto (`53bba64`, en el commit de fase 1 del rediseño) |
| Neon: "Can't reach database server" intermitente | ⚠️ Mitigado dos veces (`0d20ad8`, `b5e729b`) — reapareció una vez después del primer intento. Vigilar si vuelve a pasar después de `connection_limit=5`; si sigue, el próximo paso es revisar el límite de conexiones del plan de Neon en su propio dashboard (sin acceso a eso desde acá). |
| Cotizaciones: el perfil público (`/empresas/[id]`) no mostraba nada del perfil de servicios (ni categoría, ni descripción, ni fotos, ni calificación, ni teléfono) aunque el profesional ya lo hubiera completado — de ahí que "no se viera bien ninguno de los dos lados" | ✅ Resuelto (`dbc2b27`) — agrega la sección "Cotizaciones" completa a esa pantalla, más años de experiencia y PDF de portafolio como campos nuevos |
| "Ofrecer mis servicios" (Cotizaciones): al terminar y enviar el formulario de perfil de servicios, la app volvía a pedir el correo electrónico y luego tiraba "Ya existe una cuenta con ese correo" como si fuera un error bloqueante | ✅ Resuelto — ver detalle abajo |
| **CRÍTICO** — Registro de trabajador (wizard de 6 pasos): el click en "Continuar" del penúltimo paso (Disponibilidad → Referencias) a veces enviaba el formulario de una, saltando el último paso, SIN que "Crear mi cuenta" se haya tocado nunca — de ahí el reporte de "loop" y de login inconsistente con la misma contraseña | ✅ Resuelto — ver detalle abajo |

### Detalle: registro se auto-enviaba al pasar del penúltimo al último paso (WorkerRegistrationForm / JobPostingForm)

Causa real, confirmada reproduciendo con Playwright (con logging temporal
adentro del propio componente, no solo mirando la pantalla): el botón
"Continuar"/"Siguiente" (`type="button"`) y el botón final "Crear mi
cuenta"/"Publicar vacante" (`type="submit"`) se renderizaban con un
`if/else` en la MISMA posición del árbol de React, sin ningún `key`
distinto entre ambos. Sin `key`, React no los trata como elementos
distintos — al llegar al último paso, en vez de desmontar el botón viejo y
montar uno nuevo, React **reutiliza el mismo nodo `<button>` del DOM y le
cambia el atributo `type` de "button" a "submit" en el lugar**.

El problema: `goNext` (el handler de "Continuar") es `async` — valida el
paso con `await trigger(...)` antes de avanzar el estado. Si esa validación
resuelve muy rápido (como pasa acá, son campos opcionales sin validación
real), el cambio de `type` a "submit" en el DOM podía terminar de aplicarse
mientras el navegador **todavía estaba procesando ese mismo click** —
resultado: el click en "Continuar" del penúltimo paso terminaba
disparando el envío del formulario completo, saltando por completo la
pantalla de "Referencias" y sin que el usuario haya tocado "Crear mi
cuenta" en ningún momento. Confirmado con Playwright: clicks 1 a 4 del
wizard avanzaban de paso normalmente; el click 5 (Disponibilidad →
Referencias) disparaba, en la misma interacción, `goNext` Y `onSubmit`.

Esto explica el reporte completo: la cuenta se crea (o falla con "ya
existe" si ya se había intentado antes) de forma inesperada para quien
usa la app, en un momento en el que todavía cree estar completando el
formulario — de ahí la sensación de comportamiento errático/loop, y la
confusión sobre qué contraseña quedó guardada si hubo más de un intento.

Arreglado con 3 cambios:
1. `WorkerRegistrationForm.tsx` y `JobPostingForm.tsx`: `key="continue"` /
   `key="submit"` distintos en cada rama del `if/else` del botón final —
   fuerza a React a desmontar y crear un `<button>` nuevo en vez de mutar
   el existente, eliminando la condición de carrera de raíz.
2. `/api/registro/trabajador` y `/api/registro/empresa`: el
   `findUnique` + `create` para chequear "correo ya existe" tenía la misma
   familia de condición de carrera que ya se había arreglado antes en
   `findOrCreateServiceProfile` (Cotizaciones) — dos registros casi
   simultáneos con el mismo correo (ej. doble-tap) podían hacer que el
   segundo `create()` tirara un P2002 sin capturar (500 crudo, mensaje
   "no se pudo completar el registro") en vez de un 409 claro. Ahora
   capturado explícitamente y devuelve "Ya existe una cuenta con ese
   correo" siempre, venga de donde venga.

Probado de punta a punta con Playwright: registro completo (los 6 pasos,
sin saltar ninguno) → llega a "Referencias" de verdad → clic explícito en
"Crear mi cuenta" → `/perfil` → cierre de sesión → login de nuevo con el
mismo correo y contraseña → entra sin error. Además, dos registros
concurrentes con el mismo correo (simulando un doble-tap real) ahora
devuelven 201 + 409 limpios, nunca un 500.

### Detalle: bug de "vuelve a pedir el correo" / "perfil ya existente" en Cotizaciones

Causa real: `/empresa/servicios/page.tsx` tenía un `redirect("/registro/empresa")`
como fallback para cuando `company` salía `null` — pensado desde antes de que
WORKER pudiera ofrecer servicios, para el caso (excepcional) de una cuenta
COMPANY sin perfil de empresa. Al abrir esto también a WORKER, cualquier caso
en el que `findOrCreateServiceProfile` no lograra crear el perfil (ej. una
condición de carrera con dos visitas casi simultáneas a la página, que hacía
chocar dos `create()` contra el índice único de `userId`) mandaba a un
usuario YA LOGUEADO a `/registro/empresa` — una pantalla de ALTA DE CUENTA
NUEVA (pide correo y contraseña) que además **no tenía ningún chequeo de
sesión**: se mostraba igual a cualquiera, logueado o no. Si la persona
escribía ahí su propio correo (el de la cuenta con la que ya estaba
logueada), `/api/registro/empresa` respondía "Ya existe una cuenta con ese
correo" — el error que el dueño reportó como "perfil ya existente".

Arreglado con tres cambios (commit `0f0ffae`):
1. `src/lib/company-profile.ts`: `findOrCreateServiceProfile` ahora usa
   `prisma.companyProfile.upsert()` en vez de `findUnique` + `create` —
   elimina la condición de carrera de raíz (el choque de `userId` único se
   resuelve de forma atómica en la propia base, nunca llega a lanzar error).
2. `src/app/empresa/servicios/page.tsx`: si `company` sigue sin existir
   después de `findOrCreateServiceProfile`, una cuenta WORKER ahora va a
   `/perfil` (nunca a `/registro/empresa`) — solo una cuenta COMPANY
   (caso legítimo y excepcional) sigue yendo a completar su alta de empresa.
3. `src/app/registro/page.tsx`, `src/app/registro/empresa/page.tsx` y
   `src/app/registro/trabajador/page.tsx`: las tres pantallas de alta de
   cuenta ahora chequean sesión con `auth()` y redirigen a `/perfil` si ya
   hay una — así, ningún bug futuro en otra redirección puede volver a
   mandar a alguien ya logueado a un formulario que le pida el correo de
   nuevo, sea cual sea la ruta por la que llegue ahí.

Probado de punta a punta con Playwright: cuenta WORKER nueva → completa
registro (wizard de 6 pasos) → entra a "Ofrecer mis servicios" desde Inicio
→ llena y guarda el perfil de servicios → sigue en `/empresa/servicios` en
modo edición (sin pedir correo, sin error de duplicado) → recarga la
página y los datos guardados siguen ahí. Además, visitar `/registro`,
`/registro/empresa` y `/registro/trabajador` directamente con una sesión
ya iniciada ahora redirige a `/perfil` en los tres casos.

## Cotizaciones — "Ofrecer mis servicios" ya no es exclusivo de COMPANY

✅ **Confirmado por el dueño**: una cuenta WORKER puede ofrecer servicios
igual que una cuenta COMPANY (electricista/abogado independiente, no solo
empresas registradas). Implementado reusando el mismo `CompanyProfile` de
siempre (mismo perfil de servicios, fotos, PDF, Plan Profesional) — no un
modelo nuevo. `src/lib/company-profile.ts`: `canOfferServices(role)` (true
para COMPANY o WORKER) y `findOrCreateServiceProfile(userId, role)`, que le
crea automáticamente un `CompanyProfile` liviano a una cuenta WORKER la
primera vez que entra a `/empresa/servicios`, usando los datos que ya tenía
cargados en su `WorkerProfile` (nombre, teléfono, zona, categoría como
"actividad") — sin pasar por el registro de empresa completo (que pide
RFC/legalId, sin sentido para un individuo). Se abrió el mismo chequeo de
rol en todas las rutas relacionadas: subir foto/portafolio/PDF, activar el
Plan Profesional, notificaciones push, ver y responder solicitudes
("bandeja de Cotizaciones"), "Mis cotizaciones enviadas". El formulario de
perfil de servicios (`ServiceProfileForm`) ahora también incluye foto de
perfil y teléfono de contacto directamente (antes vivían en la pantalla de
edición general de empresa, a la que una cuenta WORKER no tiene acceso).
Probado de punta a punta con Playwright: cuenta WORKER de prueba pudo
entrar a `/empresa/servicios`, activar "Ofrecer servicios", elegir
categoría, cargar teléfono/zona/años de experiencia/descripción, guardar,
y el perfil público (`/empresas/[id]`) mostró todo correctamente.

## Pausado a pedido explícito del dueño del producto

No tocar esto hasta que él mismo diga que se retoma:

- Resto del punto 5 del audit de seguridad: semáforo de empleador
  tri-estado, flujo dedicado "Voy al trabajo", confirmación de llegada +
  escalamiento, líneas 089/800 5533 000, expediente de seguridad.
- `apple-touch-icon`.

## Pendiente: referencia visual de "otra página"

El dueño mencionó haber mandado una referencia visual de otra página que
quería imitar en estilo, y que el resultado actual no se le parece. En el
historial de la conversación no hay ninguna imagen que sea eso — lo que sí
se mandó fueron capturas de esta misma app (mockups de sus propias
pantallas) y un HTML/Tailwind genérico con un placeholder de imagen roto,
usados como referencia de estilo puntual (ver fase 1 del rediseño). Si
existe esa referencia de una página distinta, hay que pedirle que la
vuelva a mandar en el chat.

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
- ~~`ANTHROPIC_API_KEY`~~ — ya no hace falta, ver "Cambio de proveedor" en
  "IA integrada" más abajo: las 3 funciones de IA (buscador inteligente en
  el Home, "Mejorar mi CV con IA", "Analizar esta oferta") ahora usan
  Gemini, la misma `GEMINI_API_KEY` de abajo.
- `GEMINI_API_KEY` — confirmado por el dueño que ya está cargada en Vercel
  (la usa desde antes "Importar oferta", panel admin). Cubre las 4
  funciones de IA de la app (esas 3 + Importar oferta) — no hace falta una
  clave separada. **Tiene costo real por cada uso**, a la cuenta de Google
  del dueño del producto (no a esta sesión de Claude Code). Sin acceso
  desde acá a la clave real ni a las variables de entorno de Vercel, así
  que no se pudo confirmar en este entorno que el nombre esté escrito
  exactamente así en el panel de Vercel — si el error de "no configurada"
  sigue apareciendo en producción después de este cambio, lo primero a
  revisar es que el nombre de la variable en Vercel sea `GEMINI_API_KEY`
  (no `GOOGLE_API_KEY` ni similar) y que esté tildada para el entorno de
  Production. Mientras tanto, el buscador con IA cae solo a la búsqueda de
  texto normal (nunca deja a alguien sin resultado).

## Rediseño del Home

Dos pasadas. La primera (íconos propios + IA) sigue vigente en su mayor
parte; la segunda (estructura estricta de 8 secciones, la más reciente)
**reemplazó partes de la primera** — anotado abajo qué quedó y qué se sacó.

### Pasada 2 (la vigente): estructura fija de 8 secciones, sin foto de fondo

A pedido explícito y muy detallado del dueño ("NO agregues secciones
adicionales", "menos elementos pero mejor diseñados"), el Home quedó
reducido a EXACTAMENTE: Header (TopBar, sin tocar) → Título ("¿Qué
necesitás hacer hoy?", texto plano, sin tarjeta) → Buscador → Necesito un
servicio / Quiero trabajar → Categorías ("Explorar por oficio") → Chambas
para ti → Seguridad (compacto) → BottomNav.

**Se sacó del Home** (confirmado explícitamente con el dueño antes de
borrar, ver pregunta de esta sesión):
- El hero con foto (`HeroImage`, `/assets/images/hero-worker.jpg`) — la
  foto y el componente siguen en el repo sin usar, no se borraron, por si
  se quieren reusar en otra pantalla más adelante.
- La tarjeta "Comunidad Mexa" (con `CommunityIcon` y el contador real de
  personas) — Comunidad sigue accesible desde el menú inferior, no se
  perdió la función, solo la promoción en el Home.
- Anuncios (AdSense + house ads, `AdSlot`), tarjeta de donación, pie con
  links a Privacidad/Términos/Contacto — **sin otro lugar hoy donde
  vivan**; si hace falta recuperar el acceso a Privacidad/Términos o a
  donar, hay que agregarlo en algún otro lado (ej. `/perfil`), no está en
  ningún otro lugar de la app todavía.
- El botón "Buscar personal" que vivía en el hero — sigue accesible desde
  `/perfil` (cuentas COMPANY) y `/empresa/guardados`, no se perdió.
- "Trabajos Destacados" y "Nuevos Trabajos" como DOS secciones separadas
  — ahora es una sola sección "Chambas para ti" (destacadas primero,
  mismo query `findJobPostingsFeaturedFirst` de siempre) con un solo
  empty state si no hay ninguna.

**Se mantuvo tal cual** (parte de la pasada 1, sigue vigente): cero
emojis, íconos propios `SafetyBadgeIcon`/`ServiceRequestIcon`/
`ServiceOfferIcon` en `src/components/brand/`, `SmartSearchBar` con el
botón "Buscar con IA", ícono de categoría + insignia "Nueva" + salario en
las tarjetas de trabajo, bottom nav con píldora activa. `CommunityIcon`
quedó sin uso en el Home (solo se usaba en la tarjeta que se sacó) pero
sigue en el repo.

El header (`TopBar`) NO se tocó a propósito — es un componente compartido
por toda la app, y el pedido era "trabajá únicamente en la pantalla de
Inicio". El dueño pidió notificaciones + avatar ahí; no existe ningún
sistema de notificaciones en la app hoy, así que agregar una campanita
sin función real hubiera violado su propia regla ("si no tiene una
función clara, eliminalo") — pendiente si en algún momento se quiere
construir notificaciones de verdad.

### Pasada 3: calcar el estilo visual de un archivo HTML de Stitch (Google)

El dueño mandó un archivo `.html` exportado de Stitch (herramienta de IA de
Google para mockups de UI) con la MISMA estructura de 8 secciones de la
pasada 2 (sin foto, sin Comunidad) — pidió "esto tal cual está". Se
recalcó el estilo visual exacto de ese archivo sobre el código real
(colores/tamaños ya existentes de la app, sin agregar una paleta nueva —
el navy/rojo del archivo ya eran casi idénticos a `navy-900`/`mx-red-600`):

- `SmartSearchBar`: buscador más alto (`h-14`), con ícono de lupa y de
  filtros DENTRO del mismo input (antes eran dos pills separadas debajo).
  El link "Buscar con IA" quedó como texto chico al lado del hint
  ("Ej. ayudante, mesero..."), no como pill — sigue funcionando igual.
- Las 2 tarjetas de acción (`Necesito un servicio` / `Quiero trabajar`)
  ahora son más altas (`h-40`), con el mismo ícono propio en dos tamaños:
  chico arriba y gigante desvanecido de fondo (en vez de un ícono chico
  en un círculo) — título en mayúsculas, flecha abajo a la derecha.
- Tarjetas de "Chambas para ti" simplificadas: se sacó el ícono de
  categoría a la izquierda (el archivo de Stitch no lo tenía), la
  insignia Nueva/Destacada pasó a la esquina superior derecha junto al
  título. Salario y verificado se mantienen (son datos reales cuando
  existen, no estaban en el mockup pero tampoco lo contradicen).
- Tarjeta de Seguridad: cambió de rojo a un tono neutro (fondo
  `sand-50`, círculo del ícono en navy tenue) con el botón "Configurar
  protección" en estilo outline (blanco con borde) en vez de sólido rojo
  — así no compite visualmente con las 2 tarjetas de acción de arriba.

No se tocó la tipografía global (el archivo de Stitch usaba Montserrat +
Inter; la app usa Plus Jakarta Sans en todo el resto de las pantallas —
cambiar la fuente global está fuera del alcance de "solo Inicio").

### Pasada 3-pro: fotos reales en las 2 tarjetas de acción + Seguridad

El dueño mandó un tercer archivo de Stitch ("inicio_pro") con la MISMA
estructura de 8 secciones, pero con fotos reales de fondo (oscurecidas)
en las 2 tarjetas de acción y en la tarjeta de Seguridad. Antes de tocar
nada se le preguntó explícitamente (pidió que se le preguntara si había
duda) y confirmó dos cosas: (1) usar el archivo completo como referencia
de estilo, (2) **revertir expresamente su propia regla anterior de "NO
imágenes"** solo para estas 3 áreas — "Sí, quiero fotos reales ahí",
aceptando que tomara más tiempo conseguirlas con licencia.

- **"Necesito un servicio"**: foto de un electricista (Adobe Stock,
  asset `301634773`, licenciada), recortada 900×1125 (4:5) centrada en
  el sujeto → `public/assets/images/servicio-electricista.jpg`.
- **"Quiero trabajar"**: se reusó `hero-worker.jpg` (la foto que ya
  estaba en el repo sin usar desde que se sacó del hero en la pasada 2),
  recortada igual a 900×1125 → `public/assets/images/quiero-trabajar.jpg`.
  El archivo original `hero-worker.jpg` se dejó intacto por si hace
  falta en otro lado.
- **Seguridad**: foto de una persona caminando de espaldas por una calle
  arbolada al atardecer — sin rostro identificable a propósito (Adobe
  Stock, asset `225277315`, licenciada), recortada 1200×~545 (banner
  ancho) → `public/assets/images/seguridad-calle.jpg`.

Tratamiento visual (igual al de "inicio_pro", `object-cover
brightness-[0.4]` sobre la foto): en las 2 tarjetas de acción la foto
ocupa toda la tarjeta, oscurecida (`brightness-[0.45]`) + un velo del
color de marca encima (`bg-mx-red-600/30` o `bg-navy-900/30` con
`mix-blend-multiply`) para que seguidan siendo roja/navy y no compitan
entre sí — el ícono propio (chico arriba + gigante desvanecido de fondo),
el texto y la flecha se mantuvieron sin ningún cambio ("sin quitar
nada"), solo se agregó la foto detrás. En Seguridad se mantuvo el tono
neutro `sand-50` ya decidido en la pasada 2 (para no competir con las 2
tarjetas de arriba) — la foto se agregó ahí pero muy tenue (`opacity-15`)
en vez de al frente como en el archivo de Stitch, para no perder ese tono
neutro que fue una decisión explícita anterior.

`src/components/brand/HeroImage.tsx` (el componente de foto de fondo con
fallback a color sólido si la imagen no carga, ya existía desde el hero
de la pasada 1) se generalizó con una prop `fallbackClassName` (antes el
fallback era siempre `bg-navy-900` fijo) para poder reusarlo en la
tarjeta roja y en la de Seguridad sin que el fallback se vea navy ahí.

Verificado visualmente con Playwright (capturas de las 3 tarjetas) contra
un build de producción local: texto e ícono se leen bien sobre las 3
fotos, ninguna se ve "rota" ni sin foto.

### IA integrada (3 funciones reales, no solo "poner IA" de adorno)

Las 3 funciones que pidió el dueño explícitamente, vía `src/lib/ai.ts`
(fetch directo, sin SDK nuevo, mismo estilo que `paypal.ts`/`email.ts`):

1. **Buscador inteligente** (Home) — descripto arriba.
2. **"Mejorar mi CV con IA"** (`/cv`, `ImproveCvButton`) — sugerencias de
   redacción sobre el perfil ya cargado, en viñetas. Nunca sobreescribe el
   perfil solo; el trabajador copia lo que le sirva a mano.
3. **"Analizar esta oferta"** (`/vacantes/[id]`, `AnalyzeJobButton`) —
   señales que conviene revisar antes de acudir (salario fuera de lo
   típico, poca información del empleador, pagos por adelantado, etc.).
   **Nunca afirma que una oferta es una estafa** — el prompt lo prohíbe
   explícitamente y la UI agrega la aclaración abajo de la respuesta.

Las 3 rutas (`/api/ai/buscar`, `/api/ai/mejorar-cv`, `/api/ai/analizar-oferta`)
requieren sesión iniciada y tienen rate-limit propio (10-20 usos/hora por
usuario) para no dejar que el costo de la API se dispare por abuso. Sin
`GEMINI_API_KEY` configurada, cada una devuelve un 503 con mensaje claro en
vez de fallar de forma críptica.

**Cambio de proveedor (30 ago 2026): de Anthropic a Gemini.** Estas 3
funciones se construyeron originalmente contra la API de Claude
(`ANTHROPIC_API_KEY`) — nunca llegó a configurarse esa clave en Vercel, así
que el botón daba el error genérico "la función de IA no está configurada".
El dueño confirmó que ya había configurado una clave de **Gemini**
(`GEMINI_API_KEY`) para uso de IA en el proyecto — la misma variable que ya
usa, desde antes, la función separada "Importar oferta desde Facebook/
WhatsApp" del panel admin (`src/lib/ai-import.ts`, `/admin/importar-oferta`),
que sí ya llama a Gemini correctamente. `src/lib/ai.ts` se reescribió para
usar ese mismo patrón (`gemini-3.6-flash`, endpoint
`generativelanguage.googleapis.com`) en vez de Anthropic — mismas 3
funciones exportadas (`aiSearchToQuery`, `aiImproveCv`,
`aiAnalyzeJobPosting`), así que las 3 rutas que las consumen no necesitaron
ningún cambio. **No hacía falta una segunda clave**: con `GEMINI_API_KEY`
ya cargada en Vercel para el import de ofertas, alcanza para las 4
funciones de IA de la app.

Diagnóstico de la causa real (no era un mensaje mal armado, apuntaba al
proveedor equivocado de punta a punta): el código viejo llamaba a
`api.anthropic.com` con el header `x-api-key` y chequeaba
`process.env.ANTHROPIC_API_KEY` — un proveedor y una variable de entorno
completamente distintos a Gemini, nunca configurados. El error decía
"Anthropic" porque el código realmente intentaba usar Anthropic, no porque
el texto estuviera mal escrito.

Probado en este entorno (sin acceso a la clave real de producción, que
vive solo en Vercel): con `GEMINI_API_KEY` sin configurar, `isAiConfigured()`
devuelve `false` y las 3 rutas devuelven 503 mencionando `GEMINI_API_KEY`
(antes mencionaban `ANTHROPIC_API_KEY`). Con una clave de prueba inválida
configurada localmente, las 3 rutas (`/api/ai/buscar`, `/api/ai/mejorar-cv`,
`/api/ai/analizar-oferta`) devuelven 502 con el error real y textual de
Gemini ("API key not valid") en vez del 503 de "no configurada" — confirma
que las 3 ya leen `GEMINI_API_KEY` y llaman de verdad al endpoint real de
Gemini (`generativelanguage.googleapis.com`, alcanzable desde acá) con el
formato de request correcto. Falta la prueba final con una clave real
(genera contenido real en vez de solo confirmar la conexión) — eso solo se
puede hacer en producción, con la clave que ya cargó el dueño en Vercel.

**Modelo desactualizado (30 ago 2026, mismo día): `gemini-2.5-flash` ya no
existe.** Con la clave real ya cargada, el dueño probó "Mejorar mi CV con
IA" y Gemini respondió 404: *"This model models/gemini-2.5-flash is no
longer available to new users"*. `gemini-2.5-flash` se da de baja
definitivamente el 16-20 oct 2026, pero ya dejó de estar disponible para
cuentas/API keys nuevas antes de esa fecha (la clave del dueño es nueva).
El mensaje de error de Gemini sugería `models/gemini-3.6-flash` — se
verificó por separado (no se asumió que el nombre sugerido fuera correcto
tal cual) contra varias fuentes independientes (no se pudo acceder a
`ai.google.dev` directamente, bloqueado por la política de red de este
entorno — verificado por búsqueda web) que confirman `gemini-3.6-flash`
como ID real y vigente (GA desde el 21 jul 2026). También existe
`gemini-3.7-flash` (GA desde el 13 ago 2026, más nuevo, mismo precio,
pensado sobre todo para código/agentes) — se optó por `gemini-3.6-flash`
por ser la opción más probada para el tipo de tareas de esta app (texto
conversacional en español, no código).

Se corrigieron **2 archivos** que tenían el modelo viejo hardcodeado (se
revisó todo el repo para confirmar que no quedara ninguno más):
`src/lib/ai.ts` (las 3 funciones de trabajador) y `src/lib/ai-import.ts`
("Importar oferta", panel admin) — este segundo también estaba afectado
por el mismo problema aunque el dueño no lo haya reportado todavía.

Sin una clave real de Gemini en este entorno, no se pudo confirmar que
`gemini-3.6-flash` genere contenido real (mismo límite que el cambio de
proveedor de más arriba) — la única forma real de confirmarlo es que el
dueño vuelva a probar "Mejorar mi CV con IA" en producción.

## Regla de verificación en producción

Nada se reporta como "confirmado" sin probarlo contra la URL real
(`https://mexico-sin-hambre-el-tico-bretea.vercel.app`, con las
herramientas de Vercel conectadas) y citar exactamente qué se vio ahí.
Verificación solo local o en preview no cuenta como confirmado.

## Visibilidad de Premium / "Destacado" en toda la app

Pedido explícito del dueño: que las insignias de Premium (trabajador) y de
"perfil destacado" (Plan Profesional de Cotizaciones) se vean en más
lugares de la app, no solo en las pantallas dedicadas (`/premium`,
`/empresa/servicios`) — la idea es que a alguien se le ocurra pagar
mientras usa la app normalmente, viendo que otros ya lo hicieron.

`src/components/brand/PremiumBadge.tsx` (nuevo): pill con ícono `Sparkles`
y fondo degradado `peso-700→peso-500`, con un prop `label` (default
"Premium", se le pasa "Destacado" para Cotizaciones) — mismo look en toda
la app para que se reconozca de un vistazo. No decide nada (ni orden ni
acceso), solo hace visible un estado que ya existía en la base
(`WorkerProfile.isPremium`, `CompanyProfile.professionalPlanActive`).

Dónde se agregó la insignia junto al nombre:
- `/perfil` (trabajador viendo su propio perfil) y `/perfil` (empresa/
  profesional viendo el suyo, junto al ✓ de verificado).
- `/trabajadores/[id]` (perfil público que ve un empleador).
- `/buscar-personal` (lista de trabajadores que ve un empleador) — además
  la tarjeta completa del trabajador Premium queda con un tinte dorado
  sutil (`border-peso-600/25 bg-peso-100/25`) para que resalte entre las
  gratis sin gritar.
- `/vacantes/[id]/aplicantes` (lista de aplicantes de una vacante, y la
  lista de "Trabajadores recomendados" de la misma pantalla).
- `/empresas/[id]` (perfil público de la empresa/profesional que ve un
  cliente de Cotizaciones), con label "Destacado".
- `/servicios/mis-solicitudes/[id]` (cliente comparando cotizaciones de
  varios profesionales para la misma solicitud) — mismo tratamiento que
  `/buscar-personal`: tarjeta con tinte dorado + insignia "Destacado" para
  el profesional con el Plan Profesional activo.

Además de la insignia, se le dio más peso visual a los propios avisos de
venta (sin agregar pantallas nuevas):
- `/perfil` (trabajador): la tarjeta que antes llevaba a `/premium` ahora
  usa el mismo degradado dorado que la pantalla `/premium` cuando la
  persona TODAVÍA no es Premium (para que se note más en la lista de
  tarjetas); si ya es Premium, se queda con un tinte dorado suave en vez
  del degradado (para no gritar "comprame" a alguien que ya pagó).
- `/perfil` (empresa/profesional): el texto de la tarjeta "Cotizaciones"
  ahora menciona el Plan Profesional cuando la persona ya ofrece servicios
  pero todavía no lo activó.
- `/empresa/vacantes/nueva`: el contador "X/Y vacantes activas del plan
  gratis" (que antes no decía nada del Plan Empleador hasta que la persona
  llegaba al límite y quedaba bloqueada) ahora menciona el precio y "no
  hay límite" en la misma tarjeta, antes de llegar al límite.

Verificado con Playwright contra un build de producción local: se creó una
cuenta de trabajador de prueba, se le puso `isPremium = true` directo en
la base, y se confirmó visualmente la insignia en `/perfil` y en
`/trabajadores/[id]`, además de las dos variantes (con/sin Premium) de la
tarjeta de `/perfil`. Cuenta de prueba borrada al terminar.

### Premium destacado por categoría (30 ago 2026)

Pedido explícito del dueño: mientras alguien explora una categoría puntual
(ej. `/buscar/construccion`), mostrarle ahí mismo —no solo en su propio
perfil— la opción de pagar para destacarse en ese rubro. Aplica a
trabajador y a empresa/profesional de Cotizaciones por igual.

`src/components/brand/PremiumCategoryBanner.tsx` (nuevo): misma tarjeta
degradada dorada que ya se usa para el aviso de Premium en `/perfil`, con
dos variantes (`variant="worker"` / `"company"`) y el nombre de la
categoría interpolado en el texto — funciona igual para cualquier
categoría, no hay nada hardcodeado a una sola.

- `/buscar/[categoria]` (trabajador explorando vacantes por rubro,
  `LaborCategory`): si quien mira está logueado como WORKER y todavía no
  es Premium, ve "Destacá tu perfil en {categoría}" → `/premium`. Si ya es
  Premium, no se le muestra nada (no gritar "comprame" a quien ya pagó).
- `/buscar-personal?categoria=...` (empresa explorando trabajadores por
  rubro): si quien mira está logueado como COMPANY, ya ofrece servicios en
  Cotizaciones pero todavía no tiene el Plan Profesional activo, ve
  "Destacá tu perfil profesional" → `/empresa/servicios`, mientras hay un
  filtro de categoría activo (sin filtro, "todas las categorías", no
  aplica el mismo contexto puntual).

Nota: `/buscar/[categoria]` usa `LaborCategory` (rubros de vacantes:
Construcción, Profesionales, etc.) y `/buscar-personal` filtra por ese
mismo enum — son categorías DE EMPLEO, distintas del `ServiceCategory` de
Cotizaciones (electricistas, plomeros, etc., sin una pantalla pública hoy
para explorarlas por categoría). Por eso el banner de empresa promociona
el Plan Profesional en general (no un "destacado en esta categoría de
Cotizaciones" literal, que no existe todavía como concepto navegable).

Probado con Playwright contra un build de producción local: trabajador de
prueba sin Premium ve el banner en `/buscar/construccion` Y en
`/buscar/profesionales` (confirma que funciona en cualquier categoría, no
solo una); el mismo trabajador ya marcado `isPremium = true` no lo ve;
empresa de prueba con `offersServices = true` y `professionalPlanActive =
false` ve el banner de empresa en `/buscar-personal?categoria=CONSTRUCCION`.
Cuentas de prueba borradas al terminar.

## Decisión de precios: los 3 planes a $120 MXN/mes (30 ago 2026)

Ver tabla y detalle completo en "Planes de pago" arriba. Resumen para no
volver a preguntarlo: fue un pedido explícito y a propósito del dueño (a
diferencia del intento anterior de "todo a $120" que se revirtió en la
misma sesión sin llegar a producción) — Premium trabajador y Plan
Empleador bajan a $120, Plan Profesional se queda igual. Aplicado vía
migración de datos (no alcanza con cambiar el `@default` del schema
porque la fila de `AppSettings` ya existe en producción). Falta que el
dueño apriete "Crear/actualizar planes de PayPal" en `/admin/configuracion`
una vez desplegado esto — ese paso pega contra la cuenta real de PayPal,
imposible de hacer desde este entorno.

## Vacantes de ejemplo (contenido de relleno, 30 ago 2026)

Pedido explícito del dueño: vacantes genéricas para que la app no se vea
vacía a los primeros usuarios, en 2 tandas el mismo día.

**Tanda 1** (10 por categoría, 100 en total): **antes de cargar nada se le
avisó de un problema real**, confirmado con él antes de escribir una sola
fila: las ubicaciones que dio (San José, Heredia, Alajuela, etc.) son de
Costa Rica, pero esta rama es "El Mexa Chamba" — el producto de **México**
(moneda MXN, todo el branding ya armado para México desde el principio de
este proyecto). El dueño confirmó usar ciudades mexicanas en su lugar.
También dio títulos para solo 3 categorías (Construcción, Hoteles y
turismo, Profesionales); confirmó que armara yo las otras 7 (Restaurantes,
Limpieza, Transporte, Seguridad, Oficinas y administración, Ventas y
comercio, Tecnología) con el mismo criterio. Migración:
`prisma/migrations/20260830070000_vacantes_ejemplo_relleno/migration.sql`.

**Tanda 2** (20 más por categoría, 200 nuevas → **300 en total, 30 por
categoría**): el dueño volvió a pedir carga de vacantes, esta vez 30 por
categoría y otra vez con ubicaciones de Costa Rica — como ya habíamos
resuelto ambos puntos en la tanda 1 (ciudades mexicanas, 10 categorías
reales), no hizo falta volver a preguntar eso; se aplicó la misma decisión
directamente. Los primeros 10 títulos que dio para sus 3 categorías eran
idénticos a los ya cargados en la tanda 1, así que solo se agregaron los
20 nuevos de cada lista (sin duplicar). Sí hizo falta preguntar algo nuevo:
qué hacer con las otras 7 categorías, que habían quedado en 10 — el dueño
confirmó subirlas también a 30 (se armaron 20 títulos más por categoría,
mismo criterio que la tanda 1). Migración:
`prisma/migrations/20260830080000_vacantes_ejemplo_relleno_ampliado/migration.sql`
— solo agrega filas a `job_postings` (IDs `_11` a `_30`), reusa las mismas
10 empresas reservadas de la tanda 1, no las vuelve a crear.

Ninguna se cargó en `prisma/seed.ts` (ese script corre en cada build de
Vercel y volvería a intentar insertar en cada deploy) — ambas son
migraciones de datos, se aplican una sola vez y quedan registradas.

**Cómo identificarlas y borrarlas en bloque más adelante** (cuando
empiecen a entrar ofertas reales de empresas de verdad — el dueño pidió
específicamente que quedaran marcadas para esto, sin agregar ninguna
columna nueva al esquema): las 10 empresas reservadas que "publican" estas
vacantes (compartidas por las 2 tandas) tienen `legalId = 'EJEMPLO'` y su
correo sigue el patrón `ejemplo.<categoria>@mexicosinhambre.com` (mismo
patrón ya usado por `IMPORT_SOURCE_EMAIL` en `src/lib/ai-import.ts` para
las ofertas importadas de Facebook/WhatsApp — no es un mecanismo nuevo).
Borrar esas 10 cuentas borra en cascada sus `company_profiles` y las 300
`job_postings` con ellas (las relaciones ya son `onDelete: Cascade`, sin
necesidad de ninguna migración nueva):
```sql
DELETE FROM "users" WHERE "email" LIKE 'ejemplo.%@mexicosinhambre.com';
```
Probado tal cual en este entorno (las 2 veces, antes de cada migración
final): borra las 10 empresas y las 300 vacantes de un solo golpe, sin
dejar nada huérfano. Nombre de cada empresa genérico según el rubro (ej.
"Contratista de Construcción", "Restaurante Local", "Empresa de
Tecnología") — nunca un nombre real. `isVerified = false` en las 10
(correcto: no son empresas verificadas de verdad).

Salarios dentro del rango típico real de `src/lib/salary-guide.ts` (mismo
rango que usa el semáforo de seguridad), con variación por puesto dentro
de cada categoría para que no se vean todas idénticas — el semáforo sale
verde ("dentro de lo típico") en las 300, sin duplicar título+categoría en
ninguna. Ubicación y tipo de contrato repartidos variado entre ~18
ciudades mexicanas y los 5 tipos de contrato existentes. `createdAt`
repartido en las últimas semanas (no todas con la fecha de hoy) para que
no aparezcan todas con la insignia "Nueva" al mismo tiempo.

Verificado con Playwright contra un build de producción local, las 2
tandas: se aplicó cada migración contra la base de datos local, se
confirmaron 10 empresas + 300 vacantes en total (30 exactas por
categoría, sin duplicados de título+categoría), se revisó visualmente
`/buscar/construccion` y `/buscar/seguridad` (30 tarjetas cada una,
semáforo verde, ciudades y tipos de contrato variados) y el detalle de
una vacante individual, sin errores. Se probó el borrado en bloque
documentado arriba después de cargar las 300, confirmando que también
limpia toda la tanda 2, antes de dejar ambas migraciones aplicadas para
producción.

**No se pudo verificar en producción real desde este entorno** (no hay
acceso a la base de datos de producción) — hace falta que el dueño
confirme, después del próximo deploy, que las 300 vacantes (30 por
categoría) aparecen en
`https://mexico-sin-hambre-el-tico-bretea.vercel.app`.
