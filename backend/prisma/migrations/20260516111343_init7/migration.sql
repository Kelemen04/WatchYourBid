/*
  Warnings:

  - A unique constraint covering the columns `[auctionId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "PromotingBids" (
    "id" SERIAL NOT NULL,
    "maxAmount" INTEGER NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "auctionId" INTEGER NOT NULL,

    CONSTRAINT "PromotingBids_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromotingBids_auctionId_targetDate_key" ON "PromotingBids"("auctionId", "targetDate");

-- CreateIndex
CREATE UNIQUE INDEX "Review_auctionId_key" ON "Review"("auctionId");

-- AddForeignKey
ALTER TABLE "PromotingBids" ADD CONSTRAINT "PromotingBids_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotingBids" ADD CONSTRAINT "PromotingBids_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
