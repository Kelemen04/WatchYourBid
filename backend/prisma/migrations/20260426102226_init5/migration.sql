-- CreateTable
CREATE TABLE "Trendings" (
    "id" SERIAL NOT NULL,
    "auction_id" INTEGER NOT NULL,
    "clicks" INTEGER NOT NULL,

    CONSTRAINT "Trendings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trendings_auction_id_key" ON "Trendings"("auction_id");

-- AddForeignKey
ALTER TABLE "Trendings" ADD CONSTRAINT "Trendings_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
