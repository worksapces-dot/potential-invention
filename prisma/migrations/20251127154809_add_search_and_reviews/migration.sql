-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tags" TEXT[];

-- CreateIndex
CREATE INDEX "Product_rating_idx" ON "Product"("rating");

-- CreateIndex
CREATE INDEX "Product_salesCount_idx" ON "Product"("salesCount");
