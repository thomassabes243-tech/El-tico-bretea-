-- CreateTable
CREATE TABLE "advertisements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "ctaLabel" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL DEFAULT 'sparkles',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advertisements_pkey" PRIMARY KEY ("id")
);
