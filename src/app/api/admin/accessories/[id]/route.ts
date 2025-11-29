import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";

// GET single accessory
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("products", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { id } = await params;

    const accessory = await prisma.accessory.findFirst({
      where: { id, organizationId },
    });

    if (!accessory) {
      return NextResponse.json(
        { error: "Accessory not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(accessory);
  } catch (error) {
    console.error("Error fetching accessory:", error);
    return NextResponse.json(
      { error: "Failed to fetch accessory" },
      { status: 500 }
    );
  }
}

// PUT update accessory
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("products", "edit");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { id } = await params;
    const body = await request.json();
    const {
      name,
      slug,
      description,
      shortDesc,
      price,
      originalPrice,
      image,
      category,
      badge,
      rating,
      reviewCount,
      inStock,
      status,
      order,
      seoTitle,
      seoDescription,
    } = body;

    // Check if accessory exists
    const existing = await prisma.accessory.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Accessory not found" },
        { status: 404 }
      );
    }

    // Check for duplicate slug (excluding current accessory)
    if (slug !== existing.slug) {
      const duplicate = await prisma.accessory.findFirst({
        where: {
          slug,
          organizationId,
          NOT: { id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "An accessory with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const accessory = await prisma.accessory.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        shortDesc,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        image,
        category,
        badge,
        rating: rating ? parseFloat(rating) : null,
        reviewCount: reviewCount ? parseInt(reviewCount) : 0,
        inStock,
        status,
        order,
        seoTitle,
        seoDescription,
      },
    });

    return NextResponse.json(accessory);
  } catch (error) {
    console.error("Error updating accessory:", error);
    return NextResponse.json(
      { error: "Failed to update accessory" },
      { status: 500 }
    );
  }
}

// DELETE accessory
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("products", "delete");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { id } = await params;

    // Check if accessory exists
    const existing = await prisma.accessory.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Accessory not found" },
        { status: 404 }
      );
    }

    await prisma.accessory.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting accessory:", error);
    return NextResponse.json(
      { error: "Failed to delete accessory" },
      { status: 500 }
    );
  }
}
