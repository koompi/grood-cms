import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";
import { GroodPageStatus } from "@prisma/client";

// GET all grood pages
export async function GET(request: NextRequest) {
  try {
    const authResult = await withPermission("pages", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as GroodPageStatus | null;

    const pages = await prisma.groodPage.findMany({
      where: {
        organizationId,
        ...(status && { status }),
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(pages);
  } catch (error) {
    console.error("Error fetching grood pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch grood pages" },
      { status: 500 }
    );
  }
}

// POST create new grood page
export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission("pages", "create");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const body = await request.json();
    const {
      title,
      slug,
      blocks,
      templateId,
      seoTitle,
      seoDescription,
      ogImage,
      status,
    } = body;

    // Check if slug exists for this org
    const existing = await prisma.groodPage.findFirst({
      where: { slug, organizationId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A page with this slug already exists" },
        { status: 400 }
      );
    }

    const page = await prisma.groodPage.create({
      data: {
        title,
        slug,
        blocks: blocks || [],
        templateId,
        seoTitle,
        seoDescription,
        ogImage,
        status: status || "DRAFT",
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        organizationId,
      },
      include: {
        template: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error("Error creating grood page:", error);
    return NextResponse.json(
      { error: "Failed to create grood page" },
      { status: 500 }
    );
  }
}
