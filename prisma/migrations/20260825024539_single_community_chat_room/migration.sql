-- Esta migración falló repetidamente en producción (P3018: índice único
-- duplicado en chat_rooms.slug) porque la base ya tenía varias filas de
-- chat_rooms -- restos del seed.ts de la rama de Costa Rica, que corrió
-- contra esta base mientras el Production Branch de Vercel todavía
-- apuntaba ahí. Antes de agregar la restricción única, se consolidan
-- todas las filas en una sola (la más antigua), moviendo mensajes,
-- bloqueos y asignaciones de moderador en vez de perderlos -- por si
-- alguna llegó a tener contenido real, no solo el seed.
DO $$
DECLARE
  survivor_id TEXT;
BEGIN
  SELECT id INTO survivor_id FROM "chat_rooms" ORDER BY "createdAt" ASC LIMIT 1;

  IF survivor_id IS NOT NULL THEN
    UPDATE "chat_messages" SET "chatRoomId" = survivor_id
      WHERE "chatRoomId" != survivor_id;

    UPDATE "chat_room_blocks" SET "chatRoomId" = survivor_id
      WHERE "chatRoomId" != survivor_id
      AND NOT EXISTS (
        SELECT 1 FROM "chat_room_blocks" b2
        WHERE b2."chatRoomId" = survivor_id AND b2."userId" = "chat_room_blocks"."userId"
      );
    DELETE FROM "chat_room_blocks" WHERE "chatRoomId" != survivor_id;

    UPDATE "moderator_assignments" SET "chatRoomId" = survivor_id
      WHERE "chatRoomId" != survivor_id
      AND NOT EXISTS (
        SELECT 1 FROM "moderator_assignments" a2
        WHERE a2."chatRoomId" = survivor_id AND a2."moderatorId" = "moderator_assignments"."moderatorId"
      );
    DELETE FROM "moderator_assignments" WHERE "chatRoomId" != survivor_id;

    DELETE FROM "chat_rooms" WHERE id != survivor_id;

    UPDATE "chat_rooms" SET name = 'Comunidad' WHERE id = survivor_id;
  END IF;
END $$;

-- AlterTable
ALTER TABLE "chat_rooms" DROP COLUMN "category",
ADD COLUMN     "slug" TEXT NOT NULL DEFAULT 'general';

-- DropEnum
DROP TYPE "CommunityCategory";

-- CreateIndex
CREATE UNIQUE INDEX "chat_rooms_slug_key" ON "chat_rooms"("slug");
