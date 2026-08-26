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

// Esta base de datos de producción también la usa otra rama del mismo
// proyecto (claude/app-second-version-h8ujrh), que en algún momento intentó
// una migración con este mismo nombre y falló (índice único duplicado en
// chat_rooms.slug). Prisma deja esa migración marcada como "fallida" en
// _prisma_migrations y por diseño se niega a aplicar CUALQUIER migración
// nueva -- de cualquier rama -- mientras esa marca siga ahí (error P3009).
// La transacción fallida no llegó a aplicar nada (Postgres la revirtió
// sola), así que "rolled-back" refleja la realidad: no hay nada que
// deshacer, solo hay que limpiar la marca para poder seguir. Se ignora el
// resultado a propósito: una vez resuelta, reintentar esto en el próximo
// build no debe hacer fallar todo el deploy.
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
