# El Tico Bretea

Plataforma para Costa Rica que conecta trabajadores con empresas: perfiles
profesionales, currículums, vacantes, comunidades de empleo por gremio y un
panel administrativo.

Cubierto hasta ahora: autenticación por correo/contraseña, tipos de usuario
(trabajador, empresa, moderador, admin), registro de trabajador y de
empresa, perfil profesional, vacantes empresariales con aplicaciones que la
empresa puede editar y cerrar, chat en vivo por comunidad (con fotos
efímeras y límites diarios), edición del perfil propio (trabajador y
empresa) con control de privacidad de contacto, moderación de salas, reportes de usuarios/empresas, panel administrador (usuarios,
empresas, vacantes, moderadores, reportes, publicidad, precios/límites y
almacenamiento), descarga real del CV en PDF (gratis por ahora, mientras no
hay procesador de pagos conectado), Premium activable manualmente desde el
admin (mientras no hay cobro automático), publicidad propia editable desde
el panel para cuentas gratuitas (máx. 1 anuncio cada ~5 min, nunca a
pantalla completa), perfiles guardados para empresas, recomendaciones
(vacantes para el trabajador, candidatos para la empresa) por
categoría/ubicación con prioridad Premium, y eliminación de cuenta con
confirmación explícita.
Pendiente: pagos reales (falta definir procesador compatible con Costa
Rica) y categorías editables desde el panel.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- PostgreSQL + Prisma
- Auth.js (next-auth v5) con credenciales (correo + contraseña)
- Almacenamiento local de objetos para fotos de chat (comprimidas con
  `sharp`, TTL de 24h) — swappable a S3/R2 detrás de `src/lib/storage.ts`

## Desarrollo local

1. Tené una base de datos PostgreSQL corriendo y configurá `DATABASE_URL`
   en `.env` (ver `.env` de ejemplo en este repo).
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

- `npm run chat:cleanup` — borra del disco y la base de datos los archivos
  de chat vencidos (pensado para correr como cron en producción; la app
  también lo hace de forma perezosa).

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
  de cada vacante) la empresa puede editar cualquier campo o cerrarla. Una
  vacante cerrada desaparece de las búsquedas y deja de aceptar
  aplicaciones nuevas, sin necesidad de pasar por el admin.
