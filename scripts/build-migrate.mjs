import "dotenv/config";
import { spawnSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

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

// Esta base de datos también la usó, en algún momento, la otra rama del
// mismo proyecto (comparte historia de commits con nombres de carpeta de
// migración iguales pero contenido distinto en un par de casos -- ver
// commits "Consolida las filas huérfanas..." y "Arregla choque de nombres
// de columna..."). Cada vez que una migración falla ahí a mitad de camino,
// queda marcada como "fallida" en _prisma_migrations, y por diseño Prisma
// se niega a aplicar CUALQUIER migración nueva mientras exista una marca
// así (error P3009), sin importar cuál haya fallado ni si la causa
// original ya se corrigió. En vez de ir hardcodeando acá, una por una,
// cada migración puntual que falló en el pasado, se resuelven TODAS las
// que sigan marcadas como fallidas (finished_at NULL, nunca revertida) --
// ninguna de esas transacciones llegó a aplicar nada (Postgres las revirtió
// solas), así que "rolled-back" refleja la realidad en todos los casos.
try {
  const prisma = new PrismaClient();
  const failed = await prisma.$queryRaw`
    SELECT migration_name FROM "_prisma_migrations"
    WHERE finished_at IS NULL AND rolled_back_at IS NULL
  `;
  await prisma.$disconnect();

  for (const { migration_name } of failed) {
    console.log(`[build-migrate] Resolviendo migración fallida: ${migration_name}`);
    spawnSync(
      "npx",
      ["prisma", "migrate", "resolve", "--rolled-back", migration_name],
      { stdio: "inherit", env: process.env, shell: process.platform === "win32" }
    );
  }
} catch (err) {
  // Si _prisma_migrations ni siquiera existe todavía (primera vez que se
  // migra esta base), no hay nada que resolver -- se sigue con el deploy
  // normal, que la va a crear.
  console.log("[build-migrate] No se pudo revisar migraciones fallidas previas (probablemente no hay ninguna todavía):", err.message);
}

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
