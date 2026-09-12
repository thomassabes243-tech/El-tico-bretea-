import { Prisma, PrismaClient } from "@prisma/client";
import { CURRENT_APP } from "@/lib/tenant";

// Modelos que tienen columna appId (ver AppTenant en prisma/schema.prisma).
// Deliberadamente NO incluye modelos que dependen 100% de un padre ya
// filtrado (ej. PortfolioPhoto vía companyId, WorkerReference vía workerId,
// PasswordResetCode, ChatRoomBlock, ModeratorAssignment) ni RateLimitBucket
// (contador de throttling puro, sin implicancia de privacidad si se
// comparte). Si se agrega appId a un modelo nuevo, agregarlo acá también --
// si no, sus consultas quedan sin proteger silenciosamente.
const TENANT_SCOPED_MODELS = new Set<Prisma.ModelName>([
  "User",
  "WorkerProfile",
  "CompanyProfile",
  "JobPosting",
  "JobApplication",
  "ChatRoom",
  "ChatMessage",
  "ChatFile",
  "Moderator",
  "Report",
  "ScamAlert",
  "ScamAlertConfirmation",
  "ScamAlertFlag",
  "PushSubscription",
  "TrustedContact",
  "LocationShare",
  "PanicAlert",
  "ServiceRequest",
  "ServiceQuote",
  "ServiceReview",
  "SavedWorker",
  "FeaturedPurchase",
  "Donation",
  "Advertisement",
  "SafeMeetingPoint",
  "AppSettings",
]);

const READ_OR_FILTER_OPS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
  "update",
  "updateMany",
  "updateManyAndReturn",
  "delete",
  "deleteMany",
]);

// Reject explicit tenant reassignment, including nested create/update payloads.
function rejectForeignTenant(value: unknown): void {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    value.forEach(rejectForeignTenant);
    return;
  }
  for (const [key, item] of Object.entries(value)) {
    if (key === "appId" && item !== CURRENT_APP &&
        !(item && typeof item === "object" &&
          Object.keys(item).length === 1 && "set" in item && item.set === CURRENT_APP)) {
      throw new Error("No se permite escribir datos de otra aplicación.");
    }
    rejectForeignTenant(item);
  }
}

export function scopeTenantArgs(model: string, operation: string, args: Record<string, unknown>) {
  if (!TENANT_SCOPED_MODELS.has(model as Prisma.ModelName)) return args;
  const a = { ...args };
  for (const field of ["data", "create", "update"]) rejectForeignTenant(a[field]);
  if (READ_OR_FILTER_OPS.has(operation)) {
    a.where = { ...(a.where as object | undefined), appId: CURRENT_APP };
  } else if (operation === "create") {
    a.data = { ...(a.data as object), appId: CURRENT_APP };
  } else if (operation === "createMany" || operation === "createManyAndReturn") {
    a.data = Array.isArray(a.data)
      ? a.data.map((d) => ({ ...d, appId: CURRENT_APP }))
      : { ...(a.data as object), appId: CURRENT_APP };
  } else if (operation === "upsert") {
    a.where = { ...(a.where as object | undefined), appId: CURRENT_APP };
    a.create = { ...(a.create as object), appId: CURRENT_APP };
  }
  return a;
}

// Extensión de Prisma que se aplica sola a TODA consulta de los modelos de
// arriba: agrega appId=CURRENT_APP al `where` de lecturas/updates/deletes, y
// a `data` (o al `create`/`update` internos de un upsert) en creaciones --
// para que ninguna consulta de este código pueda devolver ni pisar una fila
// de la otra app, sin depender de que cada ruta nueva se acuerde de
// filtrar a mano. Esto es un parche de contención sobre una base
// compartida, no un reemplazo de tener bases separadas de verdad (ver
// AppTenant en prisma/schema.prisma para el porqué).
export function withTenantScope(client: PrismaClient) {
  return client.$extends({
    name: "tenant-scope",
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          return query(scopeTenantArgs(model, operation, args as Record<string, unknown>));
        },
      },
    },
  });
}
