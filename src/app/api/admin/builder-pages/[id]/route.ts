import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";

// GET single grood page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("pages", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { id } = await params;

    const page = await prisma.groodPage.findFirst({
      where: { id, organizationId },
      include: {
        template: true,
      },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error fetching grood page:", error);
    return NextResponse.json(
      { error: "Failed to fetch grood page" },
      { status: 500 }
    );
  }
}

// PUT update grood page
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("pages", "edit");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { id } = await params;
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

    // Check if slug exists for another page in this org
    if (slug) {
      const existing = await prisma.groodPage.findFirst({
        where: {
          slug,
          organizationId,
          id: { not: id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "A page with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Get current page to check status change
    const currentPage = await prisma.groodPage.findFirst({
      where: { id, organizationId },
    });

    if (!currentPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Set publishedAt if publishing for first time
    let publishedAt = currentPage.publishedAt;
    if (status === "PUBLISHED" && currentPage.status !== "PUBLISHED") {
      publishedAt = new Date();
    }

    const page = await prisma.groodPage.update({
      where: { id },
      data: {
        title,
        slug,
        blocks,
        templateId,
        seoTitle,
        seoDescription,
        ogImage,
        status,
        publishedAt,
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

    return NextResponse.json(page);
  } catch (error) {
    console.error("Error updating grood page:", error);
    return NextResponse.json(
      { error: "Failed to update grood page" },
      { status: 500 }
    );
  }
}

// DELETE grood page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("pages", "delete");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { id } = await params;

    // Verify page exists and belongs to org
    const page = await prisma.groodPage.findFirst({
      where: { id, organizationId },
    });

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    await prisma.groodPage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting grood page:", error);
    return NextResponse.json(
      { error: "Failed to delete grood page" },
      { status: 500 }
    );
  }
}
