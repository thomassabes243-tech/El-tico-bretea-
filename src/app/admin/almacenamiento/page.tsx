import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { HardDrive, Trash2 } from "lucide-react";
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

  return (
    <div>
      <h1 className="text-xl font-extrabold tracking-tight text-navy-900">Almacenamiento</h1>
      <p className="mt-1 text-sm text-navy-800/60">
        Archivos efímeros del chat: se comprimen automáticamente y se eliminan 24h después de
        subirse. El perfil y el CV nunca se borran por este mecanismo.
      </p>

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
