import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";

// GET all accessories
export async function GET(request: NextRequest) {
  try {
    const authResult = await withPermission("products", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { organizationId };

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    if (category && category !== "all") {
      where.category = category.toUpperCase();
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { shortDesc: { contains: search } },
      ];
    }

    const accessories = await prisma.accessory.findMany({
      where,
      orderBy: { order: "asc" },
    });

    return NextResponse.json(accessories);
  } catch (error) {
    console.error("Error fetching accessories:", error);
    return NextResponse.json(
      { error: "Failed to fetch accessories" },
      { status: 500 }
    );
  }
}

// POST create new accessory
export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission("products", "create");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

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

    // Check for duplicate slug
    const existing = await prisma.accessory.findUnique({
      where: { slug_organizationId: { slug, organizationId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An accessory with this slug already exists" },
        { status: 400 }
      );
    }

    const accessory = await prisma.accessory.create({
      data: {
        name,
        slug,
        description,
        shortDesc,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        image,
        category: category || "OTHER",
        badge,
        rating: rating ? parseFloat(rating) : null,
        reviewCount: reviewCount ? parseInt(reviewCount) : 0,
        inStock: inStock !== false,
        status: status || "DRAFT",
        order: order || 0,
        seoTitle,
        seoDescription,
        organizationId,
      },
    });

    return NextResponse.json(accessory, { status: 201 });
  } catch (error) {
    console.error("Error creating accessory:", error);
    return NextResponse.json(
      { error: "Failed to create accessory" },
      { status: 500 }
    );
  }
}
