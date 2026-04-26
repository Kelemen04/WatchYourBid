/*
  Warnings:

  - You are about to drop the column `minimal_price` on the `Auction` table. All the data in the column will be lost.
  - You are about to drop the column `time_interval` on the `Auction` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `User` table. All the data in the column will be lost.
  - Added the required column `description` to the `Auction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Auction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Auction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "AuctionType" ADD VALUE 'JAPANESE';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "Auction" DROP COLUMN "minimal_price",
DROP COLUMN "time_interval",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "min_bid_increment" INTEGER DEFAULT 1,
ADD COLUMN     "reserve_price" INTEGER,
ADD COLUMN     "tick_interval" INTEGER,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Bid" ADD COLUMN     "is_winner" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "verified",
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "WatchItem" (
    "id" SERIAL NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "production_year" INTEGER,
    "material" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "weight" DOUBLE PRECISION,
    "has_box" BOOLEAN NOT NULL DEFAULT false,
    "has_papers" BOOLEAN NOT NULL DEFAULT false,
    "is_original" BOOLEAN NOT NULL DEFAULT true,
    "auction_id" INTEGER NOT NULL,

    CONSTRAINT "WatchItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wristwatch" (
    "id" SERIAL NOT NULL,
    "watch_item_id" INTEGER NOT NULL,
    "movement_type" TEXT NOT NULL,
    "case_diameter" INTEGER NOT NULL,
    "water_resistance" TEXT NOT NULL,
    "strap_material" TEXT NOT NULL,
    "glass_type" TEXT NOT NULL,

    CONSTRAINT "Wristwatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PocketWatch" (
    "id" SERIAL NOT NULL,
    "watch_item_id" INTEGER NOT NULL,
    "case_type" TEXT NOT NULL,
    "movement_type" TEXT NOT NULL,
    "has_chain" BOOLEAN NOT NULL DEFAULT false,
    "complications" TEXT,

    CONSTRAINT "PocketWatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Smartwatch" (
    "id" SERIAL NOT NULL,
    "watch_item_id" INTEGER NOT NULL,
    "os" TEXT NOT NULL,
    "battery_life" INTEGER NOT NULL,
    "screen_type" TEXT NOT NULL,
    "sensors" TEXT NOT NULL,
    "compatibility" TEXT NOT NULL,

    CONSTRAINT "Smartwatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clock" (
    "id" SERIAL NOT NULL,
    "watch_item_id" INTEGER NOT NULL,
    "clock_type" TEXT NOT NULL,
    "power_source" TEXT NOT NULL,
    "chime_type" TEXT,
    "dimensions" TEXT NOT NULL,

    CONSTRAINT "Clock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WatchItem_auction_id_key" ON "WatchItem"("auction_id");

-- CreateIndex
CREATE UNIQUE INDEX "Wristwatch_watch_item_id_key" ON "Wristwatch"("watch_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "PocketWatch_watch_item_id_key" ON "PocketWatch"("watch_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "Smartwatch_watch_item_id_key" ON "Smartwatch"("watch_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "Clock_watch_item_id_key" ON "Clock"("watch_item_id");

-- AddForeignKey
ALTER TABLE "WatchItem" ADD CONSTRAINT "WatchItem_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wristwatch" ADD CONSTRAINT "Wristwatch_watch_item_id_fkey" FOREIGN KEY ("watch_item_id") REFERENCES "WatchItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PocketWatch" ADD CONSTRAINT "PocketWatch_watch_item_id_fkey" FOREIGN KEY ("watch_item_id") REFERENCES "WatchItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Smartwatch" ADD CONSTRAINT "Smartwatch_watch_item_id_fkey" FOREIGN KEY ("watch_item_id") REFERENCES "WatchItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clock" ADD CONSTRAINT "Clock_watch_item_id_fkey" FOREIGN KEY ("watch_item_id") REFERENCES "WatchItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
