import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/core/auth";
import { prisma } from "@/lib/prisma";
import { createRevision } from "@/modules/content/services/revision";
import { slugify } from "@/lib/utils";
import { logActivity } from "@/lib/activity-log";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
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

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Post GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Partial update for inline editing
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Get existing post
    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Build update data from provided fields only
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) {
      updateData.title = body.title;
      // Auto-update slug if title changes
      if (body.title !== existingPost.title) {
        updateData.slug = slugify(body.title);
      }
    }
    if (body.content !== undefined) {
      updateData.content = body.content;
    }
    if (body.excerpt !== undefined) {
      updateData.excerpt = body.excerpt;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    if (body.featuredImage !== undefined) {
      updateData.featuredImage = body.featuredImage;
    }
    if (body.seo !== undefined) {
      updateData.seo = body.seo;
    }

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
    });

    // Log activity
    if (session.user?.organizationId) {
      await logActivity({
        action: "update",
        entityType: "post",
        entityId: post.id,
        entityTitle: post.title,
        userId: session.user.id,
        organizationId: session.user.organizationId,
      });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Post PATCH error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      status,
      featuredImage,
      seo,
      categoryIds,
      tagIds,
      skipRevision,
    } = body;

    // Get existing post for revision comparison
    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check for content changes that warrant a revision
    const hasContentChanges =
      title !== existingPost.title ||
      content !== existingPost.content ||
      excerpt !== existingPost.excerpt ||
      featuredImage !== existingPost.featuredImage ||
      JSON.stringify(seo) !== JSON.stringify(existingPost.seo);

    // Create revision before updating (unless explicitly skipped)
    if (hasContentChanges && !skipRevision && session.user?.organizationId) {
      await createRevision({
        contentType: "post",
        contentId: id,
        title: existingPost.title,
        content: JSON.stringify(existingPost.content),
        metadata: {
          slug: existingPost.slug,
          excerpt: existingPost.excerpt,
          status: existingPost.status,
          featuredImage: existingPost.featuredImage,
          seo: existingPost.seo,
          categories: existingPost.categories.map((c) => c.category.name),
          tags: existingPost.tags.map((t) => t.tag.name),
        },
        organizationId: session.user.organizationId,
        authorId: session.user.id,
      });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (status !== undefined) updateData.status = status;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (seo !== undefined) updateData.seo = seo;

    // Handle categories
    if (categoryIds !== undefined) {
      // Remove existing category associations
      await prisma.postCategory.deleteMany({
        where: { postId: id },
      });

      // Create new category associations
      if (categoryIds.length > 0) {
        await prisma.postCategory.createMany({
          data: categoryIds.map((categoryId: string) => ({
            postId: id,
            categoryId,
          })),
        });
      }
    }

    // Handle tags
    if (tagIds !== undefined) {
      // Remove existing tag associations
      await prisma.postTag.deleteMany({
        where: { postId: id },
      });

      // Create new tag associations
      if (tagIds.length > 0) {
        await prisma.postTag.createMany({
          data: tagIds.map((tagId: string) => ({
            postId: id,
            tagId,
          })),
        });
      }
    }

    // Update post
    const post = await prisma.post.update({
      where: { id },
      data: updateData,
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
    if (session.user?.organizationId) {
      await logActivity({
        action: "update",
        entityType: "post",
        entityId: post.id,
        entityTitle: post.title,
        userId: session.user.id,
        organizationId: session.user.organizationId,
      });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Post PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    // Get post title for activity log
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { title: true },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (permanent) {
      // Permanent delete - remove all related data
      await prisma.postCategory.deleteMany({
        where: { postId: id },
      });

      await prisma.postTag.deleteMany({
        where: { postId: id },
      });

      await prisma.revision.deleteMany({
        where: {
          contentType: "post",
          contentId: id,
        },
      });

      await prisma.post.delete({
        where: { id },
      });
    } else {
      // Soft delete - move to trash
      await prisma.post.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    }

    // Log activity
    if (session.user?.organizationId) {
      await logActivity({
        action: permanent ? "delete" : "trash",
        entityType: "post",
        entityId: id,
        entityTitle: existingPost.title,
        userId: session.user.id,
        organizationId: session.user.organizationId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Post DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
