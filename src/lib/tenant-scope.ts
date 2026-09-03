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
  "delete",
  "deleteMany",
]);

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
          if (!TENANT_SCOPED_MODELS.has(model as Prisma.ModelName)) {
            return query(args);
          }

          const a = args as Record<string, unknown>;

          if (READ_OR_FILTER_OPS.has(operation)) {
            a.where = { ...(a.where as object | undefined), appId: CURRENT_APP };
          } else if (operation === "create") {
            a.data = { appId: CURRENT_APP, ...(a.data as object) };
          } else if (operation === "createMany" || operation === "createManyAndReturn") {
            const data = a.data;
            a.data = Array.isArray(data)
              ? data.map((d) => ({ appId: CURRENT_APP, ...d }))
              : { appId: CURRENT_APP, ...(data as object) };
          } else if (operation === "upsert") {
            a.where = { ...(a.where as object | undefined), appId: CURRENT_APP };
            a.create = { appId: CURRENT_APP, ...(a.create as object) };
          }

          return query(a);
        },
      },
    },
  });
}
