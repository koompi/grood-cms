import { prisma } from "@/lib/prisma";

export type ActivityAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "duplicate"
  | "archive"
  | "restore"
  | "login"
  | "logout"
  | "trash"
  | "bulk_publish"
  | "bulk_unpublish"
  | "bulk_archive"
  | "bulk_delete"
  | "bulk_restore"
  | "bulk_draft";

export type EntityType =
  | "post"
  | "page"
  | "product"
  | "media"
  | "user"
  | "menu"
  | "category"
  | "inquiry"
  | "setting"
  | "organization"
  | "ebike"
  | "accessory"
  | "store"
  | "faq";

interface LogActivityParams {
  action: ActivityAction;
  entityType: EntityType;
  entityId: string;
  entityTitle?: string;
  details?: Record<string, unknown>;
  userId?: string;
  organizationId: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log an activity to the activity log
 */
export async function logActivity({
  action,
  entityType,
  entityId,
  entityTitle,
  details,
  userId,
  organizationId,
  ipAddress,
  userAgent,
}: LogActivityParams) {
  try {
    return await prisma.activityLog.create({
      data: {
        action,
        entityType,
        entityId,
        entityTitle,
        details: details ? JSON.parse(JSON.stringify(details)) : null,
        userId,
        organizationId,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Log error but don't throw - activity logging should not break the main flow
    console.error("Failed to log activity:", error);
    return null;
  }
}

/**
 * Get activity logs with filtering and pagination
 */
export async function getActivityLogs({
  organizationId,
  entityType,
  entityId,
  userId,
  action,
  limit = 50,
  cursor,
}: {
  organizationId: string;
  entityType?: EntityType;
  entityId?: string;
  userId?: string;
  action?: ActivityAction;
  limit?: number;
  cursor?: string;
}) {
  const where: Record<string, unknown> = { organizationId };

  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  if (userId) where.userId = userId;
  if (action) where.action = action;

  const logs = await prisma.activityLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
  });

  const hasMore = logs.length > limit;
  const items = hasMore ? logs.slice(0, -1) : logs;
  const nextCursor = hasMore ? items[items.length - 1]?.id : null;

  return {
    items,
    nextCursor,
    hasMore,
  };
}

/**
 * Get recent activity for an entity
 */
export async function getEntityActivity(
  entityType: EntityType,
  entityId: string,
  limit = 10
) {
  return prisma.activityLog.findMany({
    where: {
      entityType,
      entityId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Get activity summary for dashboard
 */
export async function getActivitySummary(organizationId: string, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [recentActivity, actionCounts] = await Promise.all([
    // Recent activity
    prisma.activityLog.findMany({
      where: {
        organizationId,
        createdAt: { gte: since },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    // Count by action
    prisma.activityLog.groupBy({
      by: ["action"],
      where: {
        organizationId,
        createdAt: { gte: since },
      },
      _count: { action: true },
    }),
  ]);

  return {
    recentActivity,
    actionCounts: actionCounts.reduce(
      (
        acc: Record<string, number>,
        item: { action: string; _count: { action: number } }
      ) => {
        acc[item.action] = item._count.action;
        return acc;
      },
      {} as Record<string, number>
    ),
    totalActions: actionCounts.reduce(
      (sum: number, item: { _count: { action: number } }) =>
        sum + item._count.action,
      0
    ),
  };
}

/**
 * Format activity for display
 */
export function formatActivityMessage(log: {
  action: string;
  entityType: string;
  entityTitle?: string | null;
}): string {
  const actionVerbs: Record<string, string> = {
    create: "created",
    update: "updated",
    delete: "deleted",
    publish: "published",
    unpublish: "unpublished",
    duplicate: "duplicated",
    archive: "archived",
    restore: "restored",
    login: "logged in",
    logout: "logged out",
    trash: "moved to trash",
    bulk_publish: "bulk published",
    bulk_unpublish: "bulk unpublished",
    bulk_archive: "bulk archived",
    bulk_delete: "bulk deleted",
    bulk_restore: "bulk restored",
    bulk_draft: "set to draft",
  };

  const verb = actionVerbs[log.action] || log.action;
  const title = log.entityTitle
    ? `"${log.entityTitle}"`
    : `a ${log.entityType}`;

  if (log.action === "login" || log.action === "logout") {
    return verb;
  }

  return `${verb} ${title}`;
}
