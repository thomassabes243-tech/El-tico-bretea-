// Migración única: copia SOLO las filas appId='CR' de la base compartida
// (mexico-sin-hambre) a una base nueva y dedicada para El Tico Bretea.
// Corre en un runner de GitHub Actions (con internet normal) porque el
// entorno de Claude que escribió esto no puede conectarse directo a
// Postgres externo (política de red del sandbox: solo HTTPS por proxy).
//
// No borra ni modifica nada en la base de origen -- solo SELECT ahí.
// No toca ninguna fila con appId='MX'.
//
// Deliberadamente no imprime contenido de filas (emails, mensajes, etc.)
// -- este repo es público y los logs de Actions también, así que solo se
// loguean conteos por tabla, nunca datos reales.
import pg from "pg";

const SOURCE_URL = process.env.CR_SOURCE_DATABASE_URL;
const TARGET_URL = process.env.CR_TARGET_DIRECT_URL;

if (!SOURCE_URL || !TARGET_URL) {
  console.error("Faltan CR_SOURCE_DATABASE_URL o CR_TARGET_DIRECT_URL en el entorno.");
  process.exit(1);
}

// Orden de copiado: primero las tablas sin dependencias, después las que
// dependen de ellas -- para que las FK de la base nueva (vacía) nunca
// fallen por insertar un hijo antes que su padre.
//
// Las tablas marcadas `unscoped: true` no tienen columna appId propia
// (heredan protección del padre, ver src/lib/tenant-scope.ts) -- se
// filtran por join contra la tabla padre ya copiada en vez de por su
// propia columna.
const TABLES = [
  { name: "users", filter: `"appId" = 'CR'` },
  { name: "chat_rooms", filter: `"appId" = 'CR'` },
  { name: "advertisements", filter: `"appId" = 'CR'` },
  { name: "safe_meeting_points", filter: `"appId" = 'CR'` },
  { name: "donations", filter: `"appId" = 'CR'` },
  { name: "app_settings", filter: `"appId" = 'CR'` },
  { name: "worker_profiles", filter: `"appId" = 'CR'` },
  { name: "company_profiles", filter: `"appId" = 'CR'` },
  { name: "moderators", filter: `"appId" = 'CR'` },
  { name: "trusted_contacts", filter: `"appId" = 'CR'` },
  {
    name: "password_reset_codes",
    filter: `"userId" IN (SELECT id FROM users WHERE "appId" = 'CR')`,
  },
  {
    name: "worker_references",
    filter: `"workerId" IN (SELECT id FROM worker_profiles WHERE "appId" = 'CR')`,
  },
  { name: "job_postings", filter: `"appId" = 'CR'` },
  {
    name: "portfolio_photos",
    filter: `"companyId" IN (SELECT id FROM company_profiles WHERE "appId" = 'CR')`,
  },
  { name: "push_subscriptions", filter: `"appId" = 'CR'` },
  {
    name: "moderator_assignments",
    filter: `"moderatorId" IN (SELECT id FROM moderators WHERE "appId" = 'CR')`,
  },
  { name: "service_requests", filter: `"appId" = 'CR'` },
  { name: "scam_alerts", filter: `"appId" = 'CR'` },
  { name: "reports", filter: `"appId" = 'CR'` },
  { name: "location_shares", filter: `"appId" = 'CR'` },
  { name: "panic_alerts", filter: `"appId" = 'CR'` },
  { name: "job_applications", filter: `"appId" = 'CR'` },
  { name: "featured_purchases", filter: `"appId" = 'CR'` },
  { name: "saved_workers", filter: `"appId" = 'CR'` },
  { name: "service_quotes", filter: `"appId" = 'CR'` },
  { name: "scam_alert_confirmations", filter: `"appId" = 'CR'` },
  { name: "scam_alert_flags", filter: `"appId" = 'CR'` },
  { name: "chat_messages", filter: `"appId" = 'CR'` },
  {
    name: "chat_room_blocks",
    filter: `"chatRoomId" IN (SELECT id FROM chat_rooms WHERE "appId" = 'CR')`,
  },
  { name: "service_reviews", filter: `"appId" = 'CR'` },
  { name: "chat_files", filter: `"appId" = 'CR'` },
];

function quoteIdent(name) {
  return `"${name}"`;
}

async function copyTable(source, target, table) {
  const { rows } = await source.query(`SELECT * FROM ${quoteIdent(table.name)} WHERE ${table.filter}`);
  const sourceCount = rows.length;

  let inserted = 0;
  for (const row of rows) {
    const columns = Object.keys(row);
    const values = columns.map((c) => row[c]);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    const columnList = columns.map(quoteIdent).join(", ");
    await target.query(
      `INSERT INTO ${quoteIdent(table.name)} (${columnList}) VALUES (${placeholders})`,
      values
    );
    inserted++;
  }

  const { rows: countRows } = await target.query(
    `SELECT count(*)::int AS c FROM ${quoteIdent(table.name)} WHERE ${table.filter}`
  );
  const targetCount = countRows[0].c;

  const ok = sourceCount === inserted && inserted === targetCount;
  console.log(
    `${ok ? "OK  " : "FAIL"} ${table.name.padEnd(28)} origen=${sourceCount}  insertadas=${inserted}  destino=${targetCount}`
  );
  return { table: table.name, sourceCount, inserted, targetCount, ok };
}

async function main() {
  const source = new pg.Client({ connectionString: SOURCE_URL });
  const target = new pg.Client({ connectionString: TARGET_URL });
  await source.connect();
  await target.connect();

  console.log("Conectado a origen y destino. Copiando", TABLES.length, "tablas...\n");

  const results = [];
  for (const table of TABLES) {
    results.push(await copyTable(source, target, table));
  }

  await source.end();
  await target.end();

  console.log("\n--- Resumen ---");
  const totalRows = results.reduce((sum, r) => sum + r.sourceCount, 0);
  const failed = results.filter((r) => !r.ok);
  console.log(`Total de filas copiadas: ${totalRows}`);
  if (failed.length > 0) {
    console.error(`\n${failed.length} tabla(s) con discrepancia de conteo:`, failed.map((r) => r.table).join(", "));
    process.exit(1);
  }
  console.log("Todas las tablas coinciden: origen = insertadas = destino.");
}

main().catch((err) => {
  console.error("Error durante la migración:", err.message);
  process.exit(1);
});
