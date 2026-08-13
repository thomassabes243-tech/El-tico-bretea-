import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const COMMUNITIES: { name: string; category: "CONSTRUCCION" | "HOTELES_TURISMO" | "PROFESIONALES" }[] = [
  { name: "Construcción", category: "CONSTRUCCION" },
  { name: "Hoteles y turismo", category: "HOTELES_TURISMO" },
  { name: "Profesionales", category: "PROFESIONALES" },
];

const DEMO_MODERATOR_EMAIL = "moderador.demo@eltico.cr";
const DEMO_MODERATOR_PASSWORD = "moderador12345";

async function main() {
  const rooms = [];
  for (const community of COMMUNITIES) {
    const existing = await prisma.chatRoom.findFirst({ where: { category: community.category } });
    const room = existing ?? (await prisma.chatRoom.create({ data: community }));
    rooms.push(room);
  }
  console.log("Comunidades base creadas.");

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

  for (const room of rooms) {
    await prisma.moderatorAssignment.upsert({
      where: { moderatorId_chatRoomId: { moderatorId: moderator.id, chatRoomId: room.id } },
      create: { moderatorId: moderator.id, chatRoomId: room.id },
      update: {},
    });
  }

  console.log(
    `Moderador demo listo: ${DEMO_MODERATOR_EMAIL} / ${DEMO_MODERATOR_PASSWORD} (asignado a las 3 salas)`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
