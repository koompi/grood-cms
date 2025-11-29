import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public API to get all FAQs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");

    // Build where clause
    const where: Record<string, unknown> = {};

    if (category && category !== "all") {
      where.category = category.toUpperCase();
    }

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });

    return NextResponse.json(faqs);
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
      { status: 500 }
    );
  }
}
