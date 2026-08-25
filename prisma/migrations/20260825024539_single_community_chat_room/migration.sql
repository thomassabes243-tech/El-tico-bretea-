-- AlterTable
ALTER TABLE "chat_rooms" DROP COLUMN "category",
ADD COLUMN     "slug" TEXT NOT NULL DEFAULT 'general';

-- DropEnum
DROP TYPE "CommunityCategory";

-- CreateIndex
CREATE UNIQUE INDEX "chat_rooms_slug_key" ON "chat_rooms"("slug");

