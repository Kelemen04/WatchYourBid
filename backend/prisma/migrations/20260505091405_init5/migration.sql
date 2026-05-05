/*
  Warnings:

  - A unique constraint covering the columns `[userId,auctionId]` on the table `AutoBid` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Bid" ADD COLUMN     "autoBidId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "AutoBid_userId_auctionId_key" ON "AutoBid"("userId", "auctionId");

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_autoBidId_fkey" FOREIGN KEY ("autoBidId") REFERENCES "AutoBid"("id") ON DELETE SET NULL ON UPDATE CASCADE;
