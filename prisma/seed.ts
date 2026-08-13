import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COMMUNITIES: { name: string; category: "CONSTRUCCION" | "HOTELES_TURISMO" | "PROFESIONALES" }[] = [
  { name: "Construcción", category: "CONSTRUCCION" },
  { name: "Hoteles y turismo", category: "HOTELES_TURISMO" },
  { name: "Profesionales", category: "PROFESIONALES" },
];

async function main() {
  for (const community of COMMUNITIES) {
    const existing = await prisma.chatRoom.findFirst({ where: { category: community.category } });
    if (!existing) {
      await prisma.chatRoom.create({ data: community });
    }
  }
  console.log("Comunidades base creadas.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
