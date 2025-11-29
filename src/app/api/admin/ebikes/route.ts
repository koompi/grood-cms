import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";

// GET all e-bikes
export async function GET(request: NextRequest) {
  try {
    const authResult = await withPermission("products", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { organizationId };

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { tagline: { contains: search } },
      ];
    }

    const ebikes = await prisma.eBike.findMany({
      where,
      orderBy: { order: "asc" },
    });

    return NextResponse.json(ebikes);
  } catch (error) {
    console.error("Error fetching e-bikes:", error);
    return NextResponse.json(
      { error: "Failed to fetch e-bikes" },
      { status: 500 }
    );
  }
}

// POST create new e-bike
export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission("products", "create");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

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

    // Check for duplicate slug
    const existing = await prisma.eBike.findUnique({
      where: { slug_organizationId: { slug, organizationId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An e-bike with this slug already exists" },
        { status: 400 }
      );
    }

    const ebike = await prisma.eBike.create({
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
        status: status || "DRAFT",
        order: order || 0,
        seoTitle,
        seoDescription,
        ogImage,
        organizationId,
      },
    });

    return NextResponse.json(ebike, { status: 201 });
  } catch (error) {
    console.error("Error creating e-bike:", error);
    return NextResponse.json(
      { error: "Failed to create e-bike" },
      { status: 500 }
    );
  }
}
