/*
  Warnings:

  - You are about to drop the column `targetDate` on the `PromotingBids` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[auctionId,target_date]` on the table `PromotingBids` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PromotingBids_auctionId_targetDate_key";

-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "promotedCategoryRank" INTEGER,
ADD COLUMN     "promotedHomeRank" INTEGER;

-- AlterTable
ALTER TABLE "PromotingBids" DROP COLUMN "targetDate",
ADD COLUMN     "target_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "PromotingBids_auctionId_target_date_key" ON "PromotingBids"("auctionId", "target_date");
