import { createHash } from "node:crypto";

// Fixed by the branch, never selected through deployment environment variables.
export const APP_ID = "CR";
const EXPECTED_ENDPOINT = "df457a9a2652";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
const digest = (value) => createHash("sha256").update(value).digest("hex");

function databaseIdentity(value, label) {
  let url;
  try { url = new URL(value); } catch { throw new Error(`${label}: URL de base inválida.`); }
  if (!["postgres:", "postgresql:"].includes(url.protocol) || url.pathname.length < 2) {
    throw new Error(`${label}: se requiere una base PostgreSQL explícita.`);
  }
  const host = url.hostname.replace(/-pooler(?=\.)/, "");
  return {
    local: LOCAL_HOSTS.has(host),
    endpoint: digest(host.split(".")[0]).slice(0, 12),
    identity: `${host}:${url.port || "5432"}${url.pathname}?schema=${url.searchParams.get("schema") || "public"}`,
  };
}

export function assertDatabaseIsolation(env = process.env) {
  const database = databaseIdentity(env.DATABASE_URL, "DATABASE_URL");
  const direct = databaseIdentity(env.DIRECT_URL || env.DATABASE_URL, "DIRECT_URL");
  if (database.identity !== direct.identity) {
    throw new Error(`${APP_ID}: DATABASE_URL y DIRECT_URL apuntan a bases distintas.`);
  }
  const localDevelopment = !env.VERCEL && ["development", "test"].includes(env.NODE_ENV);
  if (localDevelopment && database.local) return;
  if (database.local || database.endpoint !== EXPECTED_ENDPOINT) {
    throw new Error(`${APP_ID}: base ajena o no verificada; acceso bloqueado.`);
  }
}

export function storageIdentityHash(endpoint, bucket) {
  const url = new URL(endpoint);
  if (url.protocol !== "https:" || !bucket || url.username || url.password || url.search || url.hash) {
    throw new Error("Identidad de almacenamiento inválida.");
  }
  return digest(`${url.origin}${url.pathname.replace(/\/$/, "")}\n${bucket}`);
}

export function assertStorageIsolation(env = process.env) {
  assertDatabaseIsolation(env);
  const expected = env[`${APP_ID}_STORAGE_IDENTITY_SHA256`];
  const actual = storageIdentityHash(env.STORAGE_S3_ENDPOINT, env.STORAGE_S3_BUCKET);
  if (!expected || actual !== expected) {
    throw new Error(`${APP_ID}: almacenamiento ajeno o no verificado; acceso bloqueado.`);
  }
}
