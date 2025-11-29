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

    // Get the original post
    const original = await prisma.post.findUnique({
      where: { id },
      include: {
        categories: true,
        tags: true,
      },
    });

    if (!original) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Generate unique slug
    const baseSlug = slugify(`${original.title} copy`);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.post.findFirst({
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
    const duplicate = await prisma.post.create({
      data: {
        title: `${original.title} (Copy)`,
        slug,
        content: original.content || {},
        excerpt: original.excerpt,
        status: "DRAFT", // Always create as draft
        featuredImage: original.featuredImage,
        seo: original.seo || undefined,
        organizationId: session.user.organizationId,
        authorId: session.user.id,
        // Copy category associations
        categories: {
          create: original.categories.map((cat) => ({
            categoryId: cat.categoryId,
          })),
        },
        // Copy tag associations
        tags: {
          create: original.tags.map((tag) => ({
            tagId: tag.tagId,
          })),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Log activity
    await logActivity({
      action: "duplicate",
      entityType: "post",
      entityId: duplicate.id,
      entityTitle: duplicate.title,
      details: { originalId: id, originalTitle: original.title },
      userId: session.user.id,
      organizationId: session.user.organizationId,
    });

    return NextResponse.json(duplicate);
  } catch (error) {
    console.error("Post duplicate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
