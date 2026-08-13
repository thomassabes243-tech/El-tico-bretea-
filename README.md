# El Tico Bretea

Plataforma para Costa Rica que conecta trabajadores con empresas: perfiles
profesionales, currículums, vacantes y comunidades de empleo por gremio.

Esta primera entrega cubre la base del proyecto: autenticación por
correo/contraseña, tipos de usuario (trabajador, empresa, moderador),
registro de trabajador y de empresa, perfil profesional, búsqueda de
personal, y las páginas de privacidad/términos/transparencia. El resto del
alcance descrito en el brief (vacantes, chats, pagos, PDF de CV, panel
admin) se construye en próximas entregas.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- PostgreSQL + Prisma
- Auth.js (next-auth v5) con credenciales (correo + contraseña)

## Desarrollo local

1. Tené una base de datos PostgreSQL corriendo y configurá `DATABASE_URL`
   en `.env` (ver `.env` de ejemplo en este repo).
2. Instalá dependencias:

   ```bash
   npm install
   ```

3. Aplicá las migraciones y sembrá las comunidades base:

   ```bash
   npx prisma migrate dev
   npm run db:seed
   ```

4. Levantá el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abrí [http://localhost:3000](http://localhost:3000).

## Notas de diseño

- Identidad: azul marino + rojo, con un detalle tipo bandera de Costa Rica
  (`src/components/brand/Logo.tsx`).
- Ningún botón de la interfaz simula una función que no existe todavía:
  las secciones aún no construidas (vacantes, chat, pagos, PDF) muestran un
  estado honesto de "próximamente" en lugar de una interacción falsa.
