import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/core/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { logActivity } from "@/lib/activity-log";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get the original page
    const original = await prisma.page.findUnique({
      where: { id },
    });

    if (!original) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Generate unique slug
    const baseSlug = slugify(`${original.title} copy`);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.page.findFirst({
        where: {
          slug,
          organizationId: session.user.organizationId,
        },
      });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create the duplicate
    const duplicate = await prisma.page.create({
      data: {
        title: `${original.title} (Copy)`,
        slug,
        content: original.content || {},
        status: "DRAFT", // Always create as draft
        template: original.template,
        seo: original.seo || undefined,
        organizationId: session.user.organizationId,
      },
    });

    // Log activity
    await logActivity({
      action: "duplicate",
      entityType: "page",
      entityId: duplicate.id,
      entityTitle: duplicate.title,
      details: { originalId: id, originalTitle: original.title },
      userId: session.user.id,
      organizationId: session.user.organizationId,
    });

    return NextResponse.json(duplicate);
  } catch (error) {
    console.error("Page duplicate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
