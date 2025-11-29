-- AlterTable
ALTER TABLE "pages" ADD COLUMN "scheduledAt" DATETIME;

-- AlterTable
ALTER TABLE "posts" ADD COLUMN "scheduledAt" DATETIME;

-- AlterTable
ALTER TABLE "products" ADD COLUMN "scheduledAt" DATETIME;

-- CreateTable
CREATE TABLE "revisions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentType" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" TEXT,
    "organizationId" TEXT NOT NULL,
    CONSTRAINT "revisions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "revisions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ebikes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT,
    "shortDescription" TEXT,
    "description" JSONB,
    "price" REAL NOT NULL,
    "originalPrice" REAL,
    "heroImage" TEXT,
    "galleryImages" JSONB,
    "colors" JSONB,
    "specs" JSONB,
    "features" JSONB,
    "badge" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "order" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImage" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ebikes_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "accessories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" JSONB,
    "shortDesc" TEXT,
    "price" REAL NOT NULL,
    "originalPrice" REAL,
    "image" TEXT,
    "category" TEXT NOT NULL DEFAULT 'OTHER',
    "badge" TEXT,
    "rating" REAL,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "order" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "accessories_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SERVICE_POINT',
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "hours" TEXT,
    "services" JSONB,
    "image" TEXT,
    "lat" REAL,
    "lng" REAL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "stores_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "grood_testimonials" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quote" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "author" TEXT,
    "rating" INTEGER,
    "type" TEXT NOT NULL DEFAULT 'PRESS',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "grood_testimonials_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "faqs_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "page_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT,
    "blocks" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "grood_pages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "blocks" JSONB NOT NULL,
    "templateId" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "organizationId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "grood_pages_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "page_templates" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "grood_pages_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "revisions_contentType_contentId_idx" ON "revisions"("contentType", "contentId");

-- CreateIndex
CREATE INDEX "revisions_organizationId_idx" ON "revisions"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "revisions_contentType_contentId_version_key" ON "revisions"("contentType", "contentId", "version");

-- CreateIndex
CREATE INDEX "ebikes_organizationId_status_idx" ON "ebikes"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ebikes_slug_organizationId_key" ON "ebikes"("slug", "organizationId");

-- CreateIndex
CREATE INDEX "accessories_organizationId_category_status_idx" ON "accessories"("organizationId", "category", "status");

-- CreateIndex
CREATE UNIQUE INDEX "accessories_slug_organizationId_key" ON "accessories"("slug", "organizationId");

-- CreateIndex
CREATE INDEX "stores_organizationId_city_status_idx" ON "stores"("organizationId", "city", "status");

-- CreateIndex
CREATE INDEX "grood_testimonials_organizationId_type_featured_idx" ON "grood_testimonials"("organizationId", "type", "featured");

-- CreateIndex
CREATE INDEX "faqs_organizationId_category_idx" ON "faqs"("organizationId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "page_templates_slug_key" ON "page_templates"("slug");

-- CreateIndex
CREATE INDEX "grood_pages_organizationId_status_idx" ON "grood_pages"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "grood_pages_slug_organizationId_key" ON "grood_pages"("slug", "organizationId");
