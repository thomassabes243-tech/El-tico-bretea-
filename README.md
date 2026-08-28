# El Tico Bretea

Plataforma para Costa Rica que conecta trabajadores con empresas: perfiles
profesionales, currículums, vacantes, comunidades de empleo por gremio y un
panel administrativo.

Cubierto hasta ahora: autenticación por correo/contraseña con límite de
intentos (anti fuerza bruta y anti spam de cuentas), tipos de usuario
(trabajador, empresa, moderador, admin), registro de trabajador y de
empresa, perfil profesional (con experiencia laboral visible), vacantes
empresariales con aplicaciones que la empresa puede editar, cerrar y dar
seguimiento (enviada/vista/contactada/descartada), compartir vacantes a
WhatsApp/Facebook con vista previa, chat en vivo por
comunidad (con nombre del autor junto a cada mensaje y fotos efímeras sin
límite de cantidad), edición del perfil
propio (trabajador y empresa) con control de privacidad de contacto,
moderación de salas, reportes de usuarios/empresas, panel administrador (usuarios,
empresas, vacantes, moderadores, reportes, publicidad, precios y
almacenamiento), descarga real del CV en PDF (gratis por ahora, mientras no
hay procesador de pagos conectado), Premium activable manualmente desde el
admin (mientras no hay cobro automático), publicidad propia editable desde
el panel para cuentas gratuitas (máx. 1 anuncio cada ~5 min, nunca a
pantalla completa), perfiles guardados para empresas, recomendaciones
(vacantes para el trabajador, candidatos para la empresa) por
categoría/ubicación con prioridad Premium (uso interno, ver nota abajo), y
eliminación de cuenta con confirmación explícita. Teléfono opcional en el
registro (trabajador y empresa). Navegación sin login obligatorio: se puede
explorar vacantes, perfiles públicos y comunidades sin cuenta; el login solo
se pide al intentar aplicar, publicar, chatear o cualquier acción que
modifique datos. Mensaje rotativo invitando a participar en la sección
Comunidades. Hoja de delincuencia opcional y privada en el CV (el
trabajador decide si la sube y si la incluye en cada descarga del PDF; nunca
se muestra en el perfil público). Premium está desactivado de la interfaz
por ahora (no se puede comprar ni se muestra a los usuarios) — el código y
el campo `isPremium` se conservan para reactivarlo más adelante, y el
admin todavía puede activarlo manualmente por cuenta si hace falta. El único
cobro activo hoy es la descarga del CV en PDF. Desde /admin/usuarios,
cualquier Administrador puede buscar cuentas por correo o nombre y
darle/quitarle el rol de Administrador a cualquiera (sin límite de cuántos
puede haber a la vez); no se puede quitar el rol a sí mismo, para no dejar
el panel sin acceso por accidente. Se puede borrar un mensaje o foto propia
del chat, y un moderador puede borrar mensajes ajenos en su sala. Entrada
liviana al chat de comunidad sin registro completo: solo correo + un alias
elegido por la persona (sin contraseña) — el alias se muestra en vez del
nombre real, y por dentro sigue siendo una cuenta identificable para poder
silenciar a quien insulte o abuse (el correo nunca se verifica ni se
muestra públicamente, y no se puede "tomar" un correo que ya tenga cuenta
real). Cualquier cuenta (trabajador o empresa) puede definir ese mismo
alias desde "Editar perfil". Panel admin en /admin/importar-oferta para
convertir publicaciones de Facebook/WhatsApp (texto pegado y/o una imagen)
en una vacante real: la IA (Claude, vía Anthropic API) extrae puesto,
categoría, ubicación, descripción y WhatsApp, el admin revisa/corrige, y al
publicar se guarda como una vacante normal (mismo modelo `JobPosting`, mismo
listado) atribuida a una cuenta "empresa" reservada para importados —
ver sección de despliegue para `ANTHROPIC_API_KEY`.
Pendiente: pagos reales (falta definir procesador compatible con Costa
Rica) y categorías editables desde el panel.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- PostgreSQL + Prisma
- Auth.js (next-auth v5) con credenciales (correo + contraseña)
- Almacenamiento de objetos para fotos de chat (comprimidas con `sharp`,
  TTL de 24h): disco local en desarrollo, S3-compatible (Cloudflare R2)
  en producción — ver `src/lib/storage.ts` y la sección de despliegue

## Desarrollo local

1. Tené una base de datos PostgreSQL corriendo y configurá `DATABASE_URL`
   en `.env` (ver `.env` de ejemplo en este repo). Cuando la app tenga un
   dominio público, actualizá también `NEXT_PUBLIC_SITE_URL` a ese dominio
   — se usa para generar los enlaces para compartir vacantes y sus
   tarjetas de vista previa (Open Graph); mientras quede en
   `http://localhost:3000` esos enlaces no van a funcionar fuera de esta
   máquina.
2. Instalá dependencias:

   ```bash
   npm install
   ```

3. Aplicá las migraciones y sembrá los datos base:

   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

   El seed crea las 3 comunidades, la configuración de precios/límites por
   defecto, y dos cuentas demo:

   - Moderador: `moderador.demo@eltico.cr` / `moderador12345` (asignado a
     las 3 salas)
   - Admin: `admin.demo@eltico.cr` / `admin12345` (acceso a `/admin`)

4. Levantá el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abrí [http://localhost:3000](http://localhost:3000).

### Otras tareas

- `npm run chat:cleanup` — borra del almacenamiento y la base de datos los
  archivos de chat vencidos (pensado para correr como cron en producción;
  la app también lo hace de forma perezosa).

## Despliegue en producción

Pensado para Vercel + Neon (Postgres) + Cloudflare R2 (fotos de chat),
todos con capa gratuita. `.env.example` documenta cada variable.

1. **Base de datos — [neon.tech](https://neon.tech)**: creá un proyecto
   gratis. Copiá dos cadenas de conexión: la de **"Pooled connection"**
   (va en `DATABASE_URL`) y la de **"Direct connection"** (va en
   `DIRECT_URL`, la usan las migraciones). Neon te las muestra por
   separado en el panel del proyecto.

2. **Vercel — [vercel.com](https://vercel.com)**: iniciá sesión con
   GitHub, "Add New" → "Project", importá este repositorio, elegí la
   rama a desplegar, y antes de darle a "Deploy" agregá las variables de
   entorno (ver `.env.example`): `DATABASE_URL`, `DIRECT_URL`,
   `AUTH_SECRET` (random, ej. `openssl rand -base64 32`),
   `AUTH_TRUST_HOST=true`, y `NEXT_PUBLIC_SITE_URL` (el dominio que
   Vercel te asigna; se puede completar después del primer deploy y
   volver a desplegar).

3. **Fotos del chat y documentos del CV — [Cloudflare R2](https://dash.cloudflare.com)**
   (necesario para poder subir fotos/documentos; sin esto esa función
   directamente no funciona): Vercel no tiene disco propio para guardar
   archivos, así que sin esto subir una foto en el chat o el documento del
   CV falla con un aviso claro de "almacenamiento no disponible" (podés
   confirmar el estado en `/admin/almacenamiento`). Creá un bucket R2
   gratis, generá credenciales de API (S3-compatible) y agregá
   `STORAGE_S3_ENDPOINT`, `STORAGE_S3_BUCKET`, `STORAGE_S3_ACCESS_KEY_ID`,
   `STORAGE_S3_SECRET_ACCESS_KEY` a las variables de entorno de Vercel, y
   volvé a desplegar.

4. **Importar oferta con IA — [console.anthropic.com](https://console.anthropic.com)**
   (opcional; sin esto, `/admin/importar-oferta` sigue existiendo pero el
   botón "Procesar con IA" muestra un aviso claro en vez de fallar):
   generá una API key en Settings → API Keys y agregá `ANTHROPIC_API_KEY`
   en Vercel. Nunca se expone al navegador, solo la usan rutas de
   servidor.

5. **Auto-publicación de changas desde el chat de Comunidad (Gemini) —
   [aistudio.google.com/apikey](https://aistudio.google.com/apikey)**
   (opcional; sin esto, el chat sigue funcionando normal, simplemente
   nunca auto-publica vacantes): generá una API key gratis y agregá
   `GEMINI_API_KEY` en Vercel. Nunca se expone al navegador, solo la usan
   rutas de servidor (ver `src/lib/job-auto-detect.ts`).

6. **Cuenta admin propia** (opcional, recomendado): el build también
   corre el seed automáticamente (comunidades de chat, configuración de
   precios/límites, cuenta admin + moderador). Sin más configuración,
   esa cuenta admin queda con el correo/contraseña de desarrollo que
   están documentados en este mismo README — o sea, públicos. Antes del
   primer deploy, agregá `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD` (y
   opcionalmente `SEED_MODERATOR_EMAIL`/`SEED_MODERATOR_PASSWORD`) en
   Vercel para que tu admin real tenga una contraseña propia desde el
   inicio (ver `.env.example`).

Las migraciones de Prisma y el seed se aplican solos en cada build
(`npm run build` corre `prisma migrate deploy && tsx prisma/seed.ts`
antes de `next build`), así que no hace falta correr nada a mano ni
compartir ninguna cadena de conexión con nadie más — el seed es
idempotente, no le toca nada a una cuenta que ya existe.

Pendiente de definir para producción real (no depende de código): un
procesador de pagos para Costa Rica (Premium/CV/donaciones cobran de
verdad hoy solo se activan manualmente desde el admin).

## Notas de diseño

- Identidad: azul marino + rojo (bandera de Costa Rica) para la marca, y un
  acento morado inspirado en el billete de ₡10,000 (sin reproducirlo) para
  precios/Premium.
- Las escenas de Arenal, Guanacaste, Monteverde y montañas cafetaleras son
  ilustraciones vectoriales propias (`src/components/brand/scenery/`), no
  fotografías: este entorno de desarrollo bloquea el acceso a bancos de
  imágenes como Unsplash/Pexels, así que se optó por vectores originales
  sin ningún problema de derechos.
- Ningún botón de la interfaz simula una función que no existe todavía: las
  secciones aún no construidas (pagos) muestran un estado honesto de
  "próximamente" en lugar de una interacción falsa.
- Publicidad (`src/components/ads/AdSlot.tsx`): mientras no haya una red
  publicitaria externa contratada, se muestran anuncios propios solo a
  cuentas gratuitas. Los anuncios se administran desde `/admin/publicidad`
  (crear, pausar/activar, borrar) sin tocar código; si no hay ninguno
  cargado en la base de datos se usan dos anuncios de respaldo (Premium y
  CV). El mismo componente se puede apuntar a un proveedor externo más
  adelante.
- Premium (`src/app/admin/usuarios/page.tsx`): mientras no hay cobro
  automático, el admin puede otorgar o quitar Premium manualmente a
  cualquier trabajador desde `/admin/usuarios`.
- Editar perfil (`/perfil/editar`): trabajador y empresa pueden actualizar
  todos sus datos después de registrarse. El trabajador también controla
  ahí la visibilidad de su perfil público y de cada dato de contacto
  (teléfono, WhatsApp, correo, expectativa salarial), todo oculto por
  defecto salvo la visibilidad general del perfil. Si una empresa
  verificada cambia su identificación legal, la verificación se revoca
  automáticamente hasta que el admin la revise de nuevo.
- Vacantes propias: desde `/vacantes/[id]/aplicantes` (el panel de gestión
  de cada vacante) la empresa puede editar cualquier campo o cerrarla. Al
  cerrar elige el motivo (puesto lleno o búsqueda caducada), que se
  muestra en la vista pública, en el panel de gestión y en "Mis vacantes"
  del perfil. Una vacante cerrada desaparece de las búsquedas y deja de
  aceptar aplicaciones nuevas, sin necesidad de pasar por el admin.
- Estado de aplicaciones: en ese mismo panel la empresa marca cada
  aplicante como vista, contactada o descartada; el trabajador ve ese
  estado reflejado en "Mis aplicaciones" dentro de su perfil.
- Experiencia laboral: el resumen de experiencia, empresas anteriores y
  puestos previos que se piden en el registro ahora se muestran en el
  perfil propio, el perfil público y el CV en PDF (antes se guardaban
  pero no aparecían en ningún lado).
- Compartir vacante (`/vacantes/[id]`): botones directos a WhatsApp y
  Facebook, más copiar enlace. Cada vacante genera su propia tarjeta de
  vista previa (Open Graph, `opengraph-image.tsx`) con el puesto, la
  empresa y la categoría, para que al pegar el link en esas apps se vea
  una tarjeta con marca en vez de un link pelado. Depende de
  `NEXT_PUBLIC_SITE_URL` — ver sección de Desarrollo local.
- Vacantes compartidas en la comunidad: si una empresa comparte una
  vacante en el chat de su gremio y luego la cierra, la tarjeta en el
  chat se actualiza sola a "Vacante cerrada" (antes seguía mostrándose
  como activa aunque ya no lo estuviera).
- Foto de trabajador y logo de empresa: se pedían en el registro pero no
  se mostraban en ningún lado. Ahora aparecen como avatar real en el
  perfil propio y público (`AvatarImage`, con vuelta automática a las
  iniciales si la URL no carga). No se agregaron al CV en PDF: es texto
  libre sin validar que sea una imagen real, y una URL inválida podría
  romper la generación del PDF.
- Reportar vacantes: `ReportTargetType.JOB_POSTING` existía en el modelo
  y el panel admin ya tenía la etiqueta lista, pero nadie podía reportar
  una vacante — ahora hay un botón "Reportar" en cada vacante, igual que
  ya existía para perfiles de trabajador y empresa.
- Límite de intentos (`src/lib/rate-limit.ts`): no había ninguna
  protección contra fuerza bruta en el login ni contra creación masiva de
  cuentas falsas. El login se limita por correo (8 intentos cada 15 min);
  el registro se limita por IP (10 por hora, compartido entre trabajador y
  empresa). Respaldado por la base de datos (tabla `RateLimitBucket`), no
  en memoria de proceso, para que el límite funcione de verdad en
  serverless (Vercel), donde cada visita puede caer en una instancia
  distinta sin memoria compartida.
- Pasada de preparación para producción: se detectó que el almacenamiento
  de fotos del chat usaba disco local, que no persiste en Vercel — ahora
  usa S3-compatible (Cloudflare R2) cuando hay credenciales configuradas,
  con disco local como respaldo solo para desarrollo (ver sección de
  despliegue). También se agregaron cabeceras de seguridad básicas
  (`next.config.ts`), `robots.txt`/`sitemap.xml`, páginas de error/404
  con la marca de la app, `.env.example`, y la separación de conexión
  agrupada/directa de Prisma que recomienda Neon para entornos
  serverless.
