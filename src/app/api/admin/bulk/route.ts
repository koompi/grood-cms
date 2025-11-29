import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";
import { logActivity, ActivityAction, EntityType } from "@/lib/activity-log";

// POST /api/admin/bulk - Handle bulk operations
export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission("posts", "edit");
    if (authResult instanceof NextResponse) return authResult;
    const { user, organizationId } = authResult;

    const body = await request.json();
    const { action, entityType, ids } = body;

    if (!action || !entityType || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Required: action, entityType, ids[]" },
        { status: 400 }
      );
    }

    let result: { count: number } = { count: 0 };
    let mappedEntityType: EntityType;

    switch (entityType) {
      case "posts":
        mappedEntityType = "post";
        result = await handlePostBulkAction(action, ids, organizationId);
        break;
      case "pages":
        mappedEntityType = "page";
        result = await handlePageBulkAction(action, ids, organizationId);
        break;
      case "products":
        mappedEntityType = "product";
        result = await handleProductBulkAction(action, ids, organizationId);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid entity type" },
          { status: 400 }
        );
    }

    // Log activity
    const activityAction = `bulk_${action}` as ActivityAction;
    await logActivity({
      action: activityAction,
      entityType: mappedEntityType,
      entityId: ids.join(","),
      entityTitle: `${ids.length} ${mappedEntityType}s`,
      userId: user.id,
      organizationId,
      details: { ids, action },
    });

    return NextResponse.json({
      success: true,
      affected: result.count,
      message: `Successfully ${action}ed ${result.count} ${mappedEntityType}(s)`,
    });
  } catch (error) {
    console.error("Bulk action error:", error);
    return NextResponse.json(
      { error: "Failed to perform bulk action" },
      { status: 500 }
    );
  }
}

async function handlePostBulkAction(
  action: string,
  ids: string[],
  organizationId: string
) {
  switch (action) {
    case "publish":
      return prisma.post.updateMany({
        where: { id: { in: ids }, organizationId, deletedAt: null },
        data: { status: "PUBLISHED", publishedAt: new Date() },
      });
    case "unpublish":
      return prisma.post.updateMany({
        where: { id: { in: ids }, organizationId, deletedAt: null },
        data: { status: "DRAFT", publishedAt: null },
      });
    case "archive":
      return prisma.post.updateMany({
        where: { id: { in: ids }, organizationId, deletedAt: null },
        data: { status: "ARCHIVED" },
      });
    case "delete":
      return prisma.post.updateMany({
        where: { id: { in: ids }, organizationId },
        data: { deletedAt: new Date() },
      });
    case "restore":
      return prisma.post.updateMany({
        where: { id: { in: ids }, organizationId, deletedAt: { not: null } },
        data: { deletedAt: null, status: "DRAFT" },
      });
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function handlePageBulkAction(
  action: string,
  ids: string[],
  organizationId: string
) {
  switch (action) {
    case "publish":
      return prisma.page.updateMany({
        where: { id: { in: ids }, organizationId, deletedAt: null },
        data: { status: "PUBLISHED", publishedAt: new Date() },
      });
    case "unpublish":
      return prisma.page.updateMany({
        where: { id: { in: ids }, organizationId, deletedAt: null },
        data: { status: "DRAFT", publishedAt: null },
      });
    case "archive":
      return prisma.page.updateMany({
        where: { id: { in: ids }, organizationId, deletedAt: null },
        data: { status: "ARCHIVED" },
      });
    case "delete":
      return prisma.page.updateMany({
        where: { id: { in: ids }, organizationId },
        data: { deletedAt: new Date() },
      });
    case "restore":
      return prisma.page.updateMany({
        where: { id: { in: ids }, organizationId, deletedAt: { not: null } },
        data: { deletedAt: null, status: "DRAFT" },
      });
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

async function handleProductBulkAction(
  action: string,
  ids: string[],
  organizationId: string
) {
  switch (action) {
    case "publish":
      return prisma.product.updateMany({
        where: { id: { in: ids }, organizationId, deletedAt: null },
        data: { status: "ACTIVE" },
      });
    case "draft":
      return prisma.product.updateMany({
        where: { id: { in: ids }, organizationId, deletedAt: null },
        data: { status: "DRAFT" },
      });
    case "archive":
      return prisma.product.updateMany({
        where: { id: { in: ids }, organizationId, deletedAt: null },
        data: { status: "ARCHIVED" },
      });
    case "delete":
      return prisma.product.updateMany({
        where: { id: { in: ids }, organizationId },
        data: { deletedAt: new Date() },
      });
    case "restore":
      return prisma.product.updateMany({
        where: { id: { in: ids }, organizationId, deletedAt: { not: null } },
        data: { deletedAt: null, status: "DRAFT" },
      });
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}
