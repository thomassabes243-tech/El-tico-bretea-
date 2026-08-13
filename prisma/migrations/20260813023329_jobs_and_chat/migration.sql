-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('ENVIADA', 'VISTA', 'DESCARTADA', 'CONTACTADA');

-- CreateEnum
CREATE TYPE "ChatMessageType" AS ENUM ('TEXT', 'JOB_SHARE');

-- CreateTable
CREATE TABLE "job_postings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "laborCategory" "LaborCategory" NOT NULL,
    "location" TEXT NOT NULL,
    "contractType" "JobType" NOT NULL,
    "quantity" INTEGER,
    "salary" TEXT,
    "schedule" TEXT,
    "experienceRequired" TEXT,
    "educationRequired" TEXT,
    "requirements" TEXT,
    "whatsapp" TEXT,
    "contactEmail" TEXT,
    "deadline" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_applications" (
    "id" TEXT NOT NULL,
    "jobPostingId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "message" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'ENVIADA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" TEXT NOT NULL,
    "chatRoomId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "type" "ChatMessageType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT,
    "jobPostingId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_files" (
    "id" TEXT NOT NULL,
    "messageId" TEXT,
    "uploaderId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chat_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_room_blocks" (
    "id" TEXT NOT NULL,
    "chatRoomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "blockedById" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_room_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_jobPostingId_workerId_key" ON "job_applications"("jobPostingId", "workerId");

-- CreateIndex
CREATE INDEX "chat_messages_chatRoomId_createdAt_idx" ON "chat_messages"("chatRoomId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "chat_room_blocks_chatRoomId_userId_key" ON "chat_room_blocks"("chatRoomId", "userId");

-- AddForeignKey
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "job_postings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "worker_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "job_postings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_files" ADD CONSTRAINT "chat_files_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "chat_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_files" ADD CONSTRAINT "chat_files_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room_blocks" ADD CONSTRAINT "chat_room_blocks_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "chat_rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room_blocks" ADD CONSTRAINT "chat_room_blocks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_room_blocks" ADD CONSTRAINT "chat_room_blocks_blockedById_fkey" FOREIGN KEY ("blockedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
