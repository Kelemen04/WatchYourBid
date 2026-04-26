/*
  Warnings:

  - Added the required column `category` to the `WatchItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WatchCategory" AS ENUM ('WRISTWATCH', 'POCKETWATCH', 'SMARTWATCH', 'CLOCK');

-- AlterTable
ALTER TABLE "WatchItem" ADD COLUMN     "category" "WatchCategory" NOT NULL;
