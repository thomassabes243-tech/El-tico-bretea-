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

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
