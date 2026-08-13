# El Tico Bretea

Plataforma para Costa Rica que conecta trabajadores con empresas: perfiles
profesionales, currículums, vacantes, comunidades de empleo por gremio y un
panel administrativo.

Cubierto hasta ahora: autenticación por correo/contraseña, tipos de usuario
(trabajador, empresa, moderador, admin), registro de trabajador y de
empresa, perfil profesional, vacantes empresariales con aplicaciones, chat
en vivo por comunidad (con fotos efímeras y límites diarios), moderación de
salas, reportes de usuarios/empresas, y un panel administrador (usuarios,
empresas, vacantes, moderadores, reportes, precios/límites y
almacenamiento). Pendiente: pagos reales (falta definir procesador
compatible con Costa Rica), generación de PDF del CV, publicidad y
categorías editables desde el panel.

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
  secciones aún no construidas (pagos, PDF del CV) muestran un estado
  honesto de "próximamente" en lugar de una interacción falsa.
