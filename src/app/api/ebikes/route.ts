import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EBikeStatus } from "@prisma/client";

// Public API to get all active e-bikes
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get("status");
    const status: EBikeStatus =
      statusParam === "DRAFT"
        ? "DRAFT"
        : statusParam === "ARCHIVED"
        ? "ARCHIVED"
        : "PUBLISHED";
    const slug = searchParams.get("slug");

    // If slug is provided, get single e-bike
    if (slug) {
      const ebike = await prisma.eBike.findFirst({
        where: {
          slug,
          status: "PUBLISHED",
        },
      });

      if (!ebike) {
        return NextResponse.json(
          { error: "E-Bike not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(ebike);
    }

    // Get all active e-bikes
    const ebikes = await prisma.eBike.findMany({
      where: { status },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
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
