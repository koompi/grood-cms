import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/core/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { logActivity } from "@/lib/activity-log";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the original product
    const original = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: true,
      },
    });

    if (!original) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Generate unique slug
    const baseSlug = slugify(`${original.name} copy`);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.product.findFirst({
        where: {
          slug,
          organizationId: session.user.organizationId,
        },
      });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Generate unique SKU
    const baseSku = `${original.sku}-COPY`;
    let sku = baseSku;
    counter = 1;

    while (true) {
      const existing = await prisma.product.findFirst({
        where: {
          sku,
          organizationId: session.user.organizationId,
        },
      });
      if (!existing) break;
      sku = `${baseSku}-${counter}`;
      counter++;
    }

    // Create the duplicate
    const duplicate = await prisma.product.create({
      data: {
        name: `${original.name} (Copy)`,
        slug,
        sku,
        description: original.description || {},
        shortDescription: original.shortDescription,
        price: original.price,
        compareAtPrice: original.compareAtPrice,
        trackInventory: original.trackInventory,
        inventory: 0, // Reset inventory for duplicate
        status: "DRAFT", // Always create as draft
        featured: false, // Don't copy featured status
        featuredImage: original.featuredImage,
        gallery: original.gallery || [],
        specifications: original.specifications || {},
        options: original.options || {},
        seo: original.seo || undefined,
        organizationId: session.user.organizationId,
        // Copy category associations
        categories: {
          create: original.categories.map((cat) => ({
            categoryId: cat.categoryId,
          })),
        },
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    // Log activity
    await logActivity({
      action: "duplicate",
      entityType: "product",
      entityId: duplicate.id,
      entityTitle: duplicate.name,
      details: { originalId: id, originalTitle: original.name },
      userId: session.user.id,
      organizationId: session.user.organizationId,
    });

    return NextResponse.json(duplicate);
  } catch (error) {
    console.error("Product duplicate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
