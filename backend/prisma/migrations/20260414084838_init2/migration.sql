-- DropForeignKey
ALTER TABLE "Buyer" DROP CONSTRAINT "Buyer_shippingAddressId_fkey";

-- AlterTable
ALTER TABLE "Buyer" ALTER COLUMN "shippingAddressId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Buyer" ADD CONSTRAINT "Buyer_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;
