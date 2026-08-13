import { cleanupExpiredChatFiles } from "../src/lib/storage";
import { prisma } from "../src/lib/prisma";

// Tarea programable (cron) para producción: borra del disco y de la base
// de datos los archivos de chat vencidos (Sección 8/21). La app también
// hace este borrado de forma perezosa en cada listado de mensajes, así que
// correr esto periódicamente es un refuerzo, no un requisito estricto.
async function main() {
  const deleted = await cleanupExpiredChatFiles();
  console.log(`Archivos de chat vencidos eliminados: ${deleted}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
