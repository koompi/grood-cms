import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";

// GET single e-bike
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("products", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { id } = await params;

    const ebike = await prisma.eBike.findFirst({
      where: { id, organizationId },
    });

    if (!ebike) {
      return NextResponse.json({ error: "E-bike not found" }, { status: 404 });
    }

    return NextResponse.json(ebike);
  } catch (error) {
    console.error("Error fetching e-bike:", error);
    return NextResponse.json(
      { error: "Failed to fetch e-bike" },
      { status: 500 }
    );
  }
}

// PUT update e-bike
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
      tagline,
      description,
      price,
      originalPrice,
      heroImage,
      galleryImages,
      colors,
      specs,
      features,
      badge,
      status,
      order,
      seoTitle,
      seoDescription,
      ogImage,
    } = body;

    // Check if e-bike exists
    const existing = await prisma.eBike.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "E-bike not found" }, { status: 404 });
    }

    // Check for duplicate slug (excluding current e-bike)
    if (slug !== existing.slug) {
      const duplicate = await prisma.eBike.findFirst({
        where: {
          slug,
          organizationId,
          NOT: { id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: "An e-bike with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const ebike = await prisma.eBike.update({
      where: { id },
      data: {
        name,
        slug,
        tagline,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        heroImage,
        galleryImages,
        colors,
        specs,
        features,
        badge,
        status,
        order,
        seoTitle,
        seoDescription,
        ogImage,
      },
    });

    return NextResponse.json(ebike);
  } catch (error) {
    console.error("Error updating e-bike:", error);
    return NextResponse.json(
      { error: "Failed to update e-bike" },
      { status: 500 }
    );
  }
}

// DELETE e-bike
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("products", "delete");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { id } = await params;

    // Check if e-bike exists
    const existing = await prisma.eBike.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "E-bike not found" }, { status: 404 });
    }

    await prisma.eBike.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting e-bike:", error);
    return NextResponse.json(
      { error: "Failed to delete e-bike" },
      { status: 500 }
    );
  }
}
