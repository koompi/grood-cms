import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";

// GET single page template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("pages", "view");
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;

    const template = await prisma.pageTemplate.findUnique({
      where: { id },
      include: {
        pages: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
          },
        },
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error fetching page template:", error);
    return NextResponse.json(
      { error: "Failed to fetch page template" },
      { status: 500 }
    );
  }
}

// PUT update page template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("pages", "edit");
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, thumbnail, blocks } = body;

    // Check if slug exists for another template
    if (slug) {
      const existing = await prisma.pageTemplate.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "A template with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const template = await prisma.pageTemplate.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        thumbnail,
        blocks,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("Error updating page template:", error);
    return NextResponse.json(
      { error: "Failed to update page template" },
      { status: 500 }
    );
  }
}

// DELETE page template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("pages", "delete");
    if (authResult instanceof NextResponse) return authResult;

    const { id } = await params;

    // Check if template is in use
    const pagesUsingTemplate = await prisma.groodPage.count({
      where: { templateId: id },
    });

    if (pagesUsingTemplate > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete template. It is used by ${pagesUsingTemplate} page(s).`,
        },
        { status: 400 }
      );
    }

    await prisma.pageTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting page template:", error);
    return NextResponse.json(
      { error: "Failed to delete page template" },
      { status: 500 }
    );
  }
}
