/*
  Warnings:

  - Made the column `shippingAddressId` on table `Buyer` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Buyer" DROP CONSTRAINT "Buyer_shippingAddressId_fkey";

-- AlterTable
ALTER TABLE "Buyer" ALTER COLUMN "shippingAddressId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Buyer" ADD CONSTRAINT "Buyer_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
