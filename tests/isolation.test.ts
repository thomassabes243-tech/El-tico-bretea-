import test from "node:test";
import assert from "node:assert/strict";
import { assertDatabaseIsolation, assertStorageIsolation, storageIdentityHash } from "../src/lib/resource-isolation.mjs";
import { scopeTenantArgs } from "../src/lib/tenant-scope";

const own = "postgresql://synthetic:synthetic@ep-fancy-sky-avquigt1.us-east-1.aws.neon.tech/app";
const foreign = "postgresql://synthetic:synthetic@ep-young-sunset-ac2hz3ar.sa-east-1.aws.neon.tech/app";
const env = { DATABASE_URL: own, NODE_ENV: "production" } as const;

test("accepts own pooled/direct pair and optional direct URL", () => {
  assert.doesNotThrow(() => assertDatabaseIsolation(env));
  assert.doesNotThrow(() => assertDatabaseIsolation({ ...env, DATABASE_URL: own.replace(".us-east-1", "-pooler.us-east-1"), DIRECT_URL: own }));
});
test("rejects opposite country on either connection, even with old override", () => {
  for (const urls of [{ DATABASE_URL: foreign }, { DIRECT_URL: foreign }, { DATABASE_URL: foreign, DIRECT_URL: own }]) {
    assert.throws(() => assertDatabaseIsolation({ ...env, ...urls, ALLOW_ANY_DB: "1" }));
  }
});
test("rejects same endpoint with different database or schema", () => {
  assert.throws(() => assertDatabaseIsolation({ ...env, DIRECT_URL: own + "_other" }));
  assert.throws(() => assertDatabaseIsolation({ ...env, DIRECT_URL: own + "?schema=other" }));
});
test("fails closed for missing/malformed URLs and local production", () => {
  for (const DATABASE_URL of [undefined, "", "invalid", "https://example.com/app", "postgresql://localhost/app"]) {
    assert.throws(() => assertDatabaseIsolation({ ...env, DATABASE_URL }));
  }
  assert.doesNotThrow(() => assertDatabaseIsolation({ DATABASE_URL: "postgresql://localhost/test", NODE_ENV: "test" }));
  assert.throws(() => assertDatabaseIsolation({ DATABASE_URL: "postgresql://localhost/test", NODE_ENV: "test", VERCEL: "1" }));
});
test("storage requires its own reviewed bucket pin", () => {
  const storage = { ...env, STORAGE_S3_ENDPOINT: "https://example.r2.cloudflarestorage.com", STORAGE_S3_BUCKET: "mx-test" };
  assert.throws(() => assertStorageIsolation(storage));
  const pinned = { ...storage, MX_STORAGE_IDENTITY_SHA256: storageIdentityHash(storage.STORAGE_S3_ENDPOINT, storage.STORAGE_S3_BUCKET) };
  assert.doesNotThrow(() => assertStorageIsolation(pinned));
  assert.throws(() => assertStorageIsolation({ ...pinned, STORAGE_S3_BUCKET: "cr-test" }));
  assert.throws(() => assertStorageIsolation({ ...pinned, STORAGE_S3_ENDPOINT: "https://other.r2.cloudflarestorage.com" }));
});
test("read/update/delete filters cannot select the other country", () => {
  for (const op of ["findUnique", "findMany", "count", "update", "updateManyAndReturn", "deleteMany"]) {
    assert.deepEqual(scopeTenantArgs("User", op, { where: { id: "x", appId: "CR" } }).where, { id: "x", appId: "MX" });
  }
});
test("rejects explicit foreign tenant writes including nested operations", () => {
  for (const [op, args] of [
    ["create", { data: { appId: "CR" } }],
    ["createMany", { data: [{ appId: "CR" }] }],
    ["update", { data: { appId: { set: "CR" } } }],
    ["upsert", { update: { appId: "CR" }, create: {} }],
    ["create", { data: { workerProfile: { create: { appId: "CR" } } } }],
  ] as const) assert.throws(() => scopeTenantArgs("User", op, args));
  assert.deepEqual(scopeTenantArgs("User", "create", { data: { email: "test@example.com" } }).data, { email: "test@example.com", appId: "MX" });
});

test("real Prisma model and raw operations are blocked before a database connection", async () => {
  const previous = { DATABASE_URL: process.env.DATABASE_URL, DIRECT_URL: process.env.DIRECT_URL };
  process.env.DATABASE_URL = foreign;
  delete process.env.DIRECT_URL;
  try {
    const { prisma } = await import("../src/lib/prisma");
    await assert.rejects(prisma.user.findMany(), /base ajena o no verificada/);
    await assert.rejects(prisma.$queryRaw`SELECT 1`, /base ajena o no verificada/);
    await prisma.$disconnect();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});
