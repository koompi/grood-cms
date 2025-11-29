import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public API to get all active accessories
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const slug = searchParams.get("slug");

    // If slug is provided, get single accessory
    if (slug) {
      const accessory = await prisma.accessory.findFirst({
        where: {
          slug,
          status: "PUBLISHED",
        },
      });

      if (!accessory) {
        return NextResponse.json(
          { error: "Accessory not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(accessory);
    }

    // Build where clause
    const where: Record<string, unknown> = { status: "PUBLISHED" };

    if (category && category !== "all") {
      where.category = category.toUpperCase();
    }

    const accessories = await prisma.accessory.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
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
