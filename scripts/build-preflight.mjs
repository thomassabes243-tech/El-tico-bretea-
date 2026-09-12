import "dotenv/config";
import { assertDatabaseIsolation, assertStorageIsolation } from "../src/lib/resource-isolation.mjs";

// Offline compilation is allowed. Deployments must prove database identity.
if (process.env.VERCEL || process.env.DATABASE_URL || process.env.DIRECT_URL) {
  assertDatabaseIsolation();
}

if (process.env.STORAGE_S3_ENDPOINT || process.env.STORAGE_S3_BUCKET) {
  assertStorageIsolation();
}
