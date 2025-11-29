import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public API to get all testimonials
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const featured = searchParams.get("featured");

    // Build where clause
    const where: Record<string, unknown> = {};

    if (type && type !== "all") {
      where.type = type.toUpperCase();
    }

    if (featured === "true") {
      where.featured = true;
    }

    const testimonials = await prisma.groodTestimonial.findMany({
      where,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
      { status: 500 }
    );
  }
}
