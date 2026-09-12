import "dotenv/config";
import { spawnSync } from "node:child_process";
import { assertDatabaseIsolation } from "../src/lib/resource-isolation.mjs";

// Explicit maintenance command, never part of build. Fail before connecting.
assertDatabaseIsolation();
const env = { ...process.env, DIRECT_URL: process.env.DIRECT_URL || process.env.DATABASE_URL };
const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit", env, shell: process.platform === "win32",
});
// Failed migrations need individual review; never automatically mark rolled back.
process.exit(result.status ?? 1);
