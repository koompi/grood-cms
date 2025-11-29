import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/core/auth";
import { prisma } from "@/lib/prisma";
import {
  getPageById,
  updatePage,
  deletePage,
} from "@/modules/content/services/page";
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
    const page = await getPageById(id);

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Page GET error:", error);
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

    // Get existing page
    const existingPage = await getPageById(id);

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Build update data from provided fields only
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) {
      updateData.title = body.title;
      // Auto-update slug if title changes
      if (body.title !== existingPage.title) {
        updateData.slug = slugify(body.title);
      }
    }
    if (body.content !== undefined) {
      updateData.content = body.content;
    }
    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    if (body.template !== undefined) {
      updateData.template = body.template;
    }
    if (body.seo !== undefined) {
      updateData.seo = body.seo;
    }

    const page = await prisma.page.update({
      where: { id },
      data: updateData,
    });

    // Log activity
    if (session.user?.organizationId) {
      await logActivity({
        action: "update",
        entityType: "page",
        entityId: page.id,
        entityTitle: page.title,
        userId: session.user.id,
        organizationId: session.user.organizationId,
      });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Page PATCH error:", error);
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
    const { title, slug, content, status, template, seo, skipRevision } = body;

    // Get existing page for revision
    const existingPage = await getPageById(id);

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // Check for content changes that warrant a revision
    const hasContentChanges =
      title !== existingPage.title ||
      content !== existingPage.content ||
      template !== existingPage.template ||
      JSON.stringify(seo) !== JSON.stringify(existingPage.seo);

    // Create revision before updating (unless explicitly skipped)
    if (hasContentChanges && !skipRevision && session.user?.organizationId) {
      await createRevision({
        contentType: "page",
        contentId: id,
        title: existingPage.title,
        content: JSON.stringify(existingPage.content),
        metadata: {
          slug: existingPage.slug,
          status: existingPage.status,
          template: existingPage.template,
          seo: existingPage.seo,
        },
        organizationId: session.user.organizationId,
        authorId: session.user.id,
      });
    }

    const page = await updatePage(id, {
      title,
      slug,
      content,
      status,
      template,
      seo,
    });

    // Log activity
    if (session.user?.organizationId) {
      await logActivity({
        action: "update",
        entityType: "page",
        entityId: page.id,
        entityTitle: page.title,
        userId: session.user.id,
        organizationId: session.user.organizationId,
      });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.error("Page PUT error:", error);
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

    // Get page title for activity log
    const existingPage = await getPageById(id);

    if (!existingPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    if (permanent) {
      // Permanent delete - remove all related data
      await prisma.revision.deleteMany({
        where: {
          contentType: "page",
          contentId: id,
        },
      });

      await deletePage(id);
    } else {
      // Soft delete - move to trash
      await prisma.page.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    }

    // Log activity
    if (session.user?.organizationId) {
      await logActivity({
        action: permanent ? "delete" : "trash",
        entityType: "page",
        entityId: id,
        entityTitle: existingPage.title,
        userId: session.user.id,
        organizationId: session.user.organizationId,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Page DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
