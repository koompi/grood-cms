import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";

// GET all testimonials
export async function GET(request: NextRequest) {
  try {
    const authResult = await withPermission("settings", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const featured = searchParams.get("featured");

    const where: Record<string, unknown> = { organizationId };

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

// POST create new testimonial
export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission("settings", "edit");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const body = await request.json();
    const {
      quote,
      source,
      author,
      rating,
      type,
      featured,
      order,
    } = body;

    const testimonial = await prisma.groodTestimonial.create({
      data: {
        quote,
        source,
        author,
        rating: rating ? parseInt(rating) : null,
        type: type || "PRESS",
        featured: featured || false,
        order: order ?? 0,
        organizationId,
      },
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}
