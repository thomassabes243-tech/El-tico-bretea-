import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HardDrive, Trash2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { isCloudStorageConfigured } from "@/lib/storage";
import { runCleanupNow } from "./actions";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AdminAlmacenamientoPage() {
  const now = new Date();
  const [activeAgg, expiredCount, activeCount] = await Promise.all([
    prisma.chatFile.aggregate({ where: { expiresAt: { gt: now } }, _sum: { sizeBytes: true } }),
    prisma.chatFile.count({ where: { expiresAt: { lte: now } } }),
    prisma.chatFile.count({ where: { expiresAt: { gt: now } } }),
  ]);

  const cloudConfigured = isCloudStorageConfigured();
  const onVercel = Boolean(process.env.VERCEL);

  return (
    <div>
      <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Almacenamiento</h1>
      <p className="mt-1 text-sm text-navy-800/60">
        Archivos efímeros del chat: se comprimen automáticamente y se eliminan 24h después de
        subirse. El perfil y el CV nunca se borran por este mecanismo.
      </p>

      {cloudConfigured ? (
        <Card className="mt-4 flex items-start gap-3 border-success-600/25 bg-success-600/5 p-4">
          <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-success-600" />
          <div>
            <p className="text-sm font-semibold text-navy-900">Almacenamiento en la nube configurado</p>
            <p className="mt-0.5 text-xs text-navy-800/60">
              Las fotos del chat y los documentos del CV se guardan en el bucket S3-compatible
              configurado (STORAGE_S3_*).
            </p>
          </div>
        </Card>
      ) : (
        <Card className="mt-4 flex items-start gap-3 border-cr-red-600/25 bg-cr-red-100/40 p-4">
          <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-cr-red-600" />
          <div>
            <p className="text-sm font-semibold text-navy-900">Almacenamiento en la nube no configurado</p>
            <p className="mt-0.5 text-xs leading-relaxed text-navy-800/70">
              {onVercel
                ? "Ahora mismo, subir fotos en el chat o el documento del CV va a fallar con un aviso de \"almacenamiento no disponible\": este servidor (Vercel) no tiene disco propio para guardarlas."
                : "En desarrollo local las fotos se guardan en disco (.data/chat-uploads), pero eso no funciona en producción (Vercel)."}
              {" "}Agregá las variables <code className="rounded bg-white/60 px-1 py-0.5">STORAGE_S3_ENDPOINT</code>,{" "}
              <code className="rounded bg-white/60 px-1 py-0.5">STORAGE_S3_BUCKET</code>,{" "}
              <code className="rounded bg-white/60 px-1 py-0.5">STORAGE_S3_ACCESS_KEY_ID</code> y{" "}
              <code className="rounded bg-white/60 px-1 py-0.5">STORAGE_S3_SECRET_ACCESS_KEY</code>{" "}
              en Vercel (un bucket de Cloudflare R2 gratis alcanza) y volvé a desplegar. Instrucciones
              completas en el README, sección &quot;Despliegue en producción&quot;.
            </p>
          </div>
        </Card>
      )}

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <HardDrive className="h-5 w-5 text-navy-700" />
          <p className="mt-3 text-2xl font-extrabold text-navy-900">{activeCount}</p>
          <p className="text-xs text-navy-800/50">Archivos activos</p>
        </Card>
        <Card className="p-4">
          <HardDrive className="h-5 w-5 text-navy-700" />
          <p className="mt-3 text-2xl font-extrabold text-navy-900">
            {formatBytes(activeAgg._sum.sizeBytes ?? 0)}
          </p>
          <p className="text-xs text-navy-800/50">Espacio en uso</p>
        </Card>
        <Card className="p-4">
          <HardDrive className="h-5 w-5 text-cr-red-600" />
          <p className="mt-3 text-2xl font-extrabold text-navy-900">{expiredCount}</p>
          <p className="text-xs text-navy-800/50">Vencidos, pendientes de borrar</p>
        </Card>
      </div>

      <form
        action={async () => {
          "use server";
          await runCleanupNow();
        }}
        className="mt-5"
      >
        <Button type="submit" variant="outline">
          <Trash2 className="h-4 w-4" /> Borrar vencidos ahora
        </Button>
      </form>
      <p className="mt-2 text-xs text-navy-800/45">
        El borrado también ocurre automáticamente cada vez que alguien abre una sala de chat.
        En producción, <code className="rounded bg-sand-100 px-1 py-0.5">npm run chat:cleanup</code>{" "}
        puede programarse como tarea periódica (cron) para reforzarlo.
      </p>
    </div>
  );
}
