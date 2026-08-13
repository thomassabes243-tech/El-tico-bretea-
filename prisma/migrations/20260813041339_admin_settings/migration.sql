-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "cvPriceColones" INTEGER NOT NULL DEFAULT 1090,
    "premiumPriceColones" INTEGER NOT NULL DEFAULT 1500,
    "freeDailyFileLimit" INTEGER NOT NULL DEFAULT 5,
    "companyDailyFileLimit" INTEGER NOT NULL DEFAULT 10,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);
