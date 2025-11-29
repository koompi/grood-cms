import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public API to get all active stores
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const city = searchParams.get("city");
    const featured = searchParams.get("featured");

    // Build where clause
    const where: Record<string, unknown> = { status: "ACTIVE" };

    if (type && type !== "all") {
      where.type = type.toUpperCase();
    }

    if (city) {
      where.city = { contains: city };
    }

    if (featured === "true") {
      where.featured = true;
    }

    const stores = await prisma.store.findMany({
      where,
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });

    return NextResponse.json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}
