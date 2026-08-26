import "dotenv/config";
import { spawnSync } from "node:child_process";

// DIRECT_URL solo la usa `prisma migrate deploy` (el Prisma Client en
// tiempo de ejecución nunca la usa, solo DATABASE_URL) -- ver el comentario
// en prisma/schema.prisma. Si por algún motivo la variable no llegó a estar
// definida (típicamente: se agregó en Vercel pero quedó sin tildar para el
// entorno que se está desplegando), usamos DATABASE_URL como respaldo en
// vez de que todo el build falle: migrar a través de la conexión agrupada
// funciona igual para la inmensa mayoría de migraciones. Cuando DIRECT_URL
// sí está bien configurada, se usa tal cual (sin tocar nada).
if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

// Esta migración quedó marcada como "fallida" en _prisma_migrations en el
// deploy anterior (índice único duplicado en chat_rooms.slug, cuando la base
// de producción todavía tenía varias filas de ChatRoom). Por diseño, Prisma
// se niega a aplicar CUALQUIER migración nueva mientras esa marca siga ahí
// (error P3009), aunque la causa original ya no exista. La transacción
// fallida no llegó a aplicar nada (Postgres la revirtió sola), así que
// "rolled-back" refleja la realidad: no hay nada que deshacer, solo hay que
// limpiar la marca para que Prisma vuelva a intentarla. Se ignora el
// resultado a propósito: si ya está resuelta, correr esto de nuevo no debe
// hacer fallar el build.
spawnSync(
  "npx",
  ["prisma", "migrate", "resolve", "--rolled-back", "20260825024539_single_community_chat_room"],
  { stdio: "inherit", env: process.env, shell: process.platform === "win32" }
);

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
