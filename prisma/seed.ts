import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CURRENT_APP } from "../src/lib/tenant";

const prisma = new PrismaClient();

const DEMO_MODERATOR_EMAIL = process.env.SEED_MODERATOR_EMAIL || "moderador.demo@mexicosinhambre.com";
const DEMO_MODERATOR_PASSWORD = process.env.SEED_MODERATOR_PASSWORD || "moderador12345";
const DEMO_ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || "admin.demo@mexicosinhambre.com";
const DEMO_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || "admin12345";

// Las contraseñas de arriba (admin12345 / moderador12345) son las de
// desarrollo, documentadas públicamente en el README. Si SEED_ADMIN_PASSWORD
// / SEED_MODERATOR_PASSWORD (y opcionalmente los *_EMAIL) están configuradas
// como variables de entorno, se usan esas en su lugar — así una cuenta de
// producción no queda con una contraseña conocida por cualquiera que lea
// el repo. El seed es idempotente (upsert): si la cuenta ya existe, no le
// toca la contraseña — así que para CAMBIAR una contraseña ya sembrada hay
// que hacerlo desde el panel admin, no volviendo a correr el seed.

async function main() {
  const room = await prisma.chatRoom.upsert({
    where: { slug_appId: { slug: "general", appId: CURRENT_APP } },
    create: { slug: "general", name: "Comunidad", appId: CURRENT_APP },
    update: {},
  });
  console.log("Sala de comunidad creada.");

  const passwordHash = await bcrypt.hash(DEMO_MODERATOR_PASSWORD, 10);
  const moderatorUser = await prisma.user.upsert({
    where: { email: DEMO_MODERATOR_EMAIL },
    create: { email: DEMO_MODERATOR_EMAIL, passwordHash, role: "MODERATOR" },
    update: {},
  });

  const moderator = await prisma.moderator.upsert({
    where: { userId: moderatorUser.id },
    create: { userId: moderatorUser.id },
    update: {},
  });

  await prisma.moderatorAssignment.upsert({
    where: { moderatorId_chatRoomId: { moderatorId: moderator.id, chatRoomId: room.id } },
    create: { moderatorId: moderator.id, chatRoomId: room.id },
    update: {},
  });

  console.log(`Moderador demo listo: ${DEMO_MODERATOR_EMAIL}`);

  const adminPasswordHash = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: DEMO_ADMIN_EMAIL },
    create: { email: DEMO_ADMIN_EMAIL, passwordHash: adminPasswordHash, role: "ADMIN" },
    update: {},
  });
  console.log(`Admin demo listo: ${DEMO_ADMIN_EMAIL}`);

  await prisma.appSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
  });
  console.log("Configuración de precios/límites inicializada.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
