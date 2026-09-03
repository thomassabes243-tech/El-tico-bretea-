import "dotenv/config";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
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

// ---------------------------------------------------------------------------
// GUARDA DE BASE DE DATOS -- no migrar ni sembrar una base que no es la nuestra
// ---------------------------------------------------------------------------
// Los dos proyectos de Vercel (mexico-sin-hambre y el-tico-bretea-gp9g) están
// conectados al MISMO repo de GitHub, y cada uno construye CUALQUIER rama que
// se pushee, no solo la suya. Como las variables de entorno son por proyecto,
// eso significa que este script se ejecuta también dentro del proyecto de
// Costa Rica, apuntado a la base de datos de Costa Rica -- y ahí aplicaba
// nuestras migraciones sobre datos ajenos. Pasó de verdad: la migración
// 20260903180000 (borrado de filas con id formato UUID) se aplicó contra la
// base de Costa Rica el 3 sep 2026 a las 18:26 UTC, en un build de ESTA rama
// lanzado por el proyecto de ellos.
//
// Las bases YA están separadas (cada proyecto tiene la suya, confirmado por
// los logs de build de ambos) -- lo que faltaba era esta guarda: comparar
// contra qué base estamos por escribir antes de escribir nada.
//
// Se guarda solo una huella (sha256 recortado) del identificador del endpoint
// de Neon, no el host en texto plano: este repo es público.
const EXPECTED_DB_FINGERPRINT = "0d7247d71ad0"; // El Mexa Chamba (México)

// Bases locales de desarrollo: nunca son la base de producción de nadie, así
// que la guarda no aplica (si no, `npm run build` local no migraría nada).
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "host.docker.internal"]);

/** Identificador del endpoint de Neon, sin el sufijo -pooler ni el dominio. */
function dbFingerprint(url) {
  try {
    const host = new URL(url).hostname;
    if (LOCAL_HOSTS.has(host)) return null;
    const endpoint = host.split(".")[0].replace(/-pooler$/, "");
    return createHash("sha256").update(endpoint).digest("hex").slice(0, 12);
  } catch {
    return null;
  }
}

const actualFingerprint = dbFingerprint(process.env.DIRECT_URL ?? "");

if (
  actualFingerprint &&
  actualFingerprint !== EXPECTED_DB_FINGERPRINT &&
  process.env.ALLOW_ANY_DB !== "1"
) {
  console.log(
    [
      "",
      "[build-migrate] ⛔ Base de datos ajena -- no se migra ni se siembra nada.",
      "",
      `  Huella esperada (México): ${EXPECTED_DB_FINGERPRINT}`,
      `  Huella recibida:          ${actualFingerprint}`,
      "",
      "  Este build corre código de El Mexa Chamba (México) pero apunta a otra",
      "  base de datos -- casi seguro es el proyecto de Vercel de El Tico Bretea",
      "  (Costa Rica) construyendo esta rama porque los dos proyectos están",
      "  conectados al mismo repo de GitHub. Se salta migrate + seed para no",
      "  tocar datos ajenos; el resto del build sigue normal.",
      "",
      "  Si en cambio cambiaste la base de México a una nueva (Neon nuevo), esta",
      "  guarda hay que actualizarla: poné acá la huella nueva que muestra esta",
      "  línea, o desactivala temporalmente con la variable ALLOW_ANY_DB=1.",
      "",
    ].join("\n")
  );
  process.exit(0);
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

if ((result.status ?? 1) !== 0) {
  process.exit(result.status ?? 1);
}

// El seed corre acá adentro (y no como un paso aparte del script "build" de
// package.json) para que quede detrás de la misma guarda de base de datos: si
// esta base no es la nuestra, salimos antes y el seed tampoco escribe nada.
const seed = spawnSync("npx", ["tsx", "prisma/seed.ts"], {
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});

process.exit(seed.status ?? 1);
