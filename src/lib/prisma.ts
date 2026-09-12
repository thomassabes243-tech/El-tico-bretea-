import { PrismaClient } from "@prisma/client";
import { assertDatabaseIsolation } from "./resource-isolation.mjs";

function createClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }).$extends({
    name: "database-isolation",
    query: {
      async $allOperations({ args, query }) {
        assertDatabaseIsolation();
        return query(args);
      },
    },
  });
}
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createClient> | undefined;
};
export const prisma = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
