import { NextRequest, NextResponse } from "next/server";
import {
  createBackup,
  listBackups,
  restoreBackup,
  deleteBackup,
  formatFileSize,
} from "@/lib/backup";
import { withPermission } from "@/lib/permissions";

// GET /api/admin/backups - List all backups
export async function GET() {
  try {
    const authResult = await withPermission("settings", "view");
    if (authResult instanceof NextResponse) return authResult;

    const backups = await listBackups();

    return NextResponse.json({
      backups: backups.map((b) => ({
        ...b,
        sizeFormatted: formatFileSize(b.size),
      })),
    });
  } catch (error) {
    console.error("Backup list error:", error);
    return NextResponse.json(
      { error: "Failed to list backups" },
      { status: 500 }
    );
  }
}

// POST /api/admin/backups - Create a new backup
export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission("settings", "edit");
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json().catch(() => ({}));
    const description = body.description as string | undefined;

    const backup = await createBackup(description);

    return NextResponse.json(
      {
        success: true,
        backup: {
          ...backup,
          sizeFormatted: formatFileSize(backup.size),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Backup creation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create backup",
      },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/backups - Restore a backup
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await withPermission("settings", "edit");
    if (authResult instanceof NextResponse) return authResult;

    // Only SUPER_ADMIN can restore backups
    if (
      authResult.user?.role !== "SUPER_ADMIN" &&
      authResult.user?.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Only administrators can restore backups" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { filename } = body;

    if (!filename) {
      return NextResponse.json(
        { error: "Backup filename required" },
        { status: 400 }
      );
    }

    await restoreBackup(filename);

    return NextResponse.json({
      success: true,
      message: "Backup restored successfully. Please restart the application.",
    });
  } catch (error) {
    console.error("Backup restore error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to restore backup",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/backups - Delete a backup
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withPermission("settings", "edit");
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json(
        { error: "Backup filename required" },
        { status: 400 }
      );
    }

    await deleteBackup(filename);

    return NextResponse.json({
      success: true,
      message: "Backup deleted successfully",
    });
  } catch (error) {
    console.error("Backup delete error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete backup",
      },
      { status: 500 }
    );
  }
}
