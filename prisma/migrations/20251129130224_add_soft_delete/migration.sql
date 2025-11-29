-- AlterTable
ALTER TABLE "pages" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "posts" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "products" ADD COLUMN "deletedAt" DATETIME;

-- CreateIndex
CREATE INDEX "pages_organizationId_deletedAt_idx" ON "pages"("organizationId", "deletedAt");

-- CreateIndex
CREATE INDEX "posts_organizationId_deletedAt_idx" ON "posts"("organizationId", "deletedAt");

-- CreateIndex
CREATE INDEX "products_organizationId_deletedAt_idx" ON "products"("organizationId", "deletedAt");
