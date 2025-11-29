import { NextRequest, NextResponse } from "next/server";
import { withPermission } from "@/lib/permissions";
import { getActivityLogs, getActivitySummary } from "@/lib/activity-log";

// GET /api/admin/activity - List activity logs
export async function GET(request: NextRequest) {
  const authResult = await withPermission("settings", "view");
  if (authResult instanceof NextResponse) return authResult;
  const { organizationId } = authResult;

  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get("entityType") || undefined;
  const entityId = searchParams.get("entityId") || undefined;
  const userId = searchParams.get("userId") || undefined;
  const action = searchParams.get("action") || undefined;
  const limit = parseInt(searchParams.get("limit") || "50");
  const cursor = searchParams.get("cursor") || undefined;
  const summary = searchParams.get("summary") === "true";

  try {
    // If summary requested, return dashboard summary
    if (summary) {
      const days = parseInt(searchParams.get("days") || "7");
      const summaryData = await getActivitySummary(organizationId, days);
      return NextResponse.json(summaryData);
    }

    // Otherwise return paginated logs
    const result = await getActivityLogs({
      organizationId,
      entityType: entityType as never,
      entityId,
      userId,
      action: action as never,
      limit,
      cursor,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch activity logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}
