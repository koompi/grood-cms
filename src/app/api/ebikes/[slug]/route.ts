import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public API to get single e-bike by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const ebike = await prisma.eBike.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
      },
    });

    if (!ebike) {
      return NextResponse.json({ error: "E-Bike not found" }, { status: 404 });
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
