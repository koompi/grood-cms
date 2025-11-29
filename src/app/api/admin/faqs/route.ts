import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";

// GET all FAQs
export async function GET(request: NextRequest) {
  try {
    const authResult = await withPermission("settings", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { organizationId };

    if (category && category !== "all") {
      where.category = category.toUpperCase();
    }

    if (search) {
      where.OR = [
        { question: { contains: search } },
        { answer: { contains: search } },
      ];
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

// POST create new FAQ
export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission("settings", "edit");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const body = await request.json();
    const { question, answer, category, order } = body;

    // Get next order if not provided
    let faqOrder = order;
    if (faqOrder === undefined || faqOrder === null) {
      const lastFaq = await prisma.fAQ.findFirst({
        where: { organizationId, category },
        orderBy: { order: "desc" },
      });
      faqOrder = (lastFaq?.order || 0) + 1;
    }

    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        category: category || "GENERAL",
        order: faqOrder,
        organizationId,
      },
    });

    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
}
