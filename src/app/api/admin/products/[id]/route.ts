import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/core/auth";
import { prisma } from "@/lib/prisma";
import { createRevision } from "@/modules/content/services/revision";
import { slugify } from "@/lib/utils";
import { logActivity } from "@/lib/activity-log";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Partial update for inline editing
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Get existing product
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Build update data from provided fields only
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) {
      updateData.name = body.name;
      // Auto-update slug if name changes
      if (body.name !== existingProduct.name) {
        updateData.slug = slugify(body.name);
      }
    }
    if (body.shortDescription !== undefined) {
      updateData.shortDescription = body.shortDescription;
    }
    if (body.description !== undefined) {
      updateData.description = body.description;
    }
    if (body.price !== undefined) {
      updateData.price = parseFloat(body.price);
    }
    if (body.compareAtPrice !== undefined) {
      updateData.compareAtPrice = body.compareAtPrice
        ? parseFloat(body.compareAtPrice)
        : null;
    }
    if (body.imageUrl !== undefined) {
      updateData.imageUrl = body.imageUrl;
    }
    if (body.featuredImage !== undefined) {
      updateData.featuredImage = body.featuredImage;
    }
    if (body.featured !== undefined) {
      updateData.featured = body.featured;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    if (body.specifications !== undefined) {
      updateData.specifications = body.specifications;
    }
    if (body.seo !== undefined) {
      updateData.seo = body.seo;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    // Log activity
    if (session.user?.organizationId) {
      await logActivity({
        action: "update",
        entityType: "product",
        entityId: product.id,
        entityTitle: product.name,
        userId: session.user.id,
        organizationId: session.user.organizationId,
      });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      compareAtPrice,
      sku,
      inventory,
      trackInventory,
      status,
      featured,
      featuredImage,
      specifications,
      seo,
      skipRevision,
    } = body;

    // Get existing product for revision
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check for content changes that warrant a revision
    const hasContentChanges =
      name !== existingProduct.name ||
      description !== existingProduct.description ||
      shortDescription !== existingProduct.shortDescription ||
      price !== existingProduct.price ||
      featuredImage !== existingProduct.featuredImage ||
      JSON.stringify(specifications) !==
        JSON.stringify(existingProduct.specifications) ||
      JSON.stringify(seo) !== JSON.stringify(existingProduct.seo);

    // Create revision before updating (unless explicitly skipped)
    if (hasContentChanges && !skipRevision && session.user?.organizationId) {
      await createRevision({
        contentType: "product",
        contentId: id,
        title: existingProduct.name,
        content: JSON.stringify(existingProduct.description),
        metadata: {
          slug: existingProduct.slug,
          shortDescription: existingProduct.shortDescription,
          price: existingProduct.price,
          compareAtPrice: existingProduct.compareAtPrice,
          sku: existingProduct.sku,
          inventory: existingProduct.inventory,
          trackInventory: existingProduct.trackInventory,
          status: existingProduct.status,
          featured: existingProduct.featured,
          featuredImage: existingProduct.featuredImage,
          specifications: existingProduct.specifications,
          seo: existingProduct.seo,
          categories: existingProduct.categories.map((c) => c.category.name),
        },
        organizationId: session.user.organizationId,
        authorId: session.user.id,
      });
    }

    // Check if SKU is being changed and if it's already taken
    if (sku) {
      const existingSku = await prisma.product.findFirst({
        where: {
          sku,
          id: { not: id },
        },
      });

      if (existingSku) {
        return NextResponse.json(
          { error: "SKU already exists" },
          { status: 400 }
        );
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        shortDescription,
        price: price !== undefined ? parseFloat(price) : undefined,
        compareAtPrice:
          compareAtPrice !== undefined
            ? compareAtPrice
              ? parseFloat(compareAtPrice)
              : null
            : undefined,
        sku,
        inventory: inventory !== undefined ? parseInt(inventory) : undefined,
        trackInventory,
        status,
        featured,
        featuredImage,
        specifications,
        seo,
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
    if (session.user?.organizationId) {
      await logActivity({
        action: "update",
        entityType: "product",
        entityId: product.id,
        entityTitle: product.name,
        userId: session.user.id,
        organizationId: session.user.organizationId,
      });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    // Get product name for activity log
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      select: { name: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (permanent) {
      // Permanent delete - remove all related data
      await prisma.categoryProduct.deleteMany({
        where: { productId: id },
      });

      await prisma.revision.deleteMany({
        where: {
          contentType: "product",
          contentId: id,
        },
      });

      await prisma.product.delete({
        where: { id },
      });
    } else {
      // Soft delete - move to trash
      await prisma.product.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    }

    // Log activity
    if (session.user?.organizationId) {
      await logActivity({
        action: permanent ? "delete" : "trash",
        entityType: "product",
        entityId: id,
        entityTitle: existingProduct.name,
        userId: session.user.id,
        organizationId: session.user.organizationId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
