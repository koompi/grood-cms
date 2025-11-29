import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";

// GET /api/admin/trash - List all soft-deleted items
export async function GET(request: NextRequest) {
  try {
    const authResult = await withPermission("posts", "delete");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // 'posts', 'pages', 'products', 'all'

    const results: {
      posts: Array<{
        id: string;
        title: string;
        deletedAt: Date;
        type: string;
      }>;
      pages: Array<{
        id: string;
        title: string;
        deletedAt: Date;
        type: string;
      }>;
      products: Array<{
        id: string;
        name: string;
        deletedAt: Date;
        type: string;
      }>;
    } = {
      posts: [],
      pages: [],
      products: [],
    };

    // Fetch deleted posts
    if (type === "all" || type === "posts") {
      const posts = await prisma.post.findMany({
        where: {
          organizationId,
          deletedAt: { not: null },
        },
        select: {
          id: true,
          title: true,
          deletedAt: true,
          author: {
            select: { name: true, email: true },
          },
        },
        orderBy: { deletedAt: "desc" },
      });
      results.posts = posts.map((p) => ({
        id: p.id,
        title: p.title,
        deletedAt: p.deletedAt!,
        type: "post",
        author: p.author,
      }));
    }

    // Fetch deleted pages
    if (type === "all" || type === "pages") {
      const pages = await prisma.page.findMany({
        where: {
          organizationId,
          deletedAt: { not: null },
        },
        select: {
          id: true,
          title: true,
          deletedAt: true,
        },
        orderBy: { deletedAt: "desc" },
      });
      results.pages = pages.map((p) => ({
        id: p.id,
        title: p.title,
        deletedAt: p.deletedAt!,
        type: "page",
      }));
    }

    // Fetch deleted products
    if (type === "all" || type === "products") {
      const products = await prisma.product.findMany({
        where: {
          organizationId,
          deletedAt: { not: null },
        },
        select: {
          id: true,
          name: true,
          deletedAt: true,
        },
        orderBy: { deletedAt: "desc" },
      });
      results.products = products.map((p) => ({
        id: p.id,
        name: p.name,
        deletedAt: p.deletedAt!,
        type: "product",
      }));
    }

    // Combine all items
    const allItems = [
      ...results.posts.map((p) => ({ ...p, itemType: "post" as const })),
      ...results.pages.map((p) => ({
        ...p,
        title: p.title,
        itemType: "page" as const,
      })),
      ...results.products.map((p) => ({
        ...p,
        title: p.name,
        itemType: "product" as const,
      })),
    ].sort(
      (a, b) =>
        new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime()
    );

    return NextResponse.json({
      items: allItems,
      counts: {
        posts: results.posts.length,
        pages: results.pages.length,
        products: results.products.length,
        total: allItems.length,
      },
    });
  } catch (error) {
    console.error("Trash list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trash items" },
      { status: 500 }
    );
  }
}

// POST /api/admin/trash - Restore an item from trash
export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission("posts", "edit");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const body = await request.json();
    const { id, itemType } = body;

    if (!id || !itemType) {
      return NextResponse.json(
        { error: "Item ID and type are required" },
        { status: 400 }
      );
    }

    let restored;

    switch (itemType) {
      case "post":
        restored = await prisma.post.update({
          where: { id, organizationId },
          data: { deletedAt: null, status: "DRAFT" },
        });
        break;
      case "page":
        restored = await prisma.page.update({
          where: { id, organizationId },
          data: { deletedAt: null, status: "DRAFT" },
        });
        break;
      case "product":
        restored = await prisma.product.update({
          where: { id, organizationId },
          data: { deletedAt: null, status: "DRAFT" },
        });
        break;
      default:
        return NextResponse.json(
          { error: "Invalid item type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      restored,
      message: `${
        itemType.charAt(0).toUpperCase() + itemType.slice(1)
      } restored successfully`,
    });
  } catch (error) {
    console.error("Trash restore error:", error);
    return NextResponse.json(
      { error: "Failed to restore item" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/trash - Permanently delete item(s) or empty trash
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await withPermission("posts", "delete");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const itemType = searchParams.get("itemType");
    const emptyAll = searchParams.get("emptyAll") === "true";

    if (emptyAll) {
      // Permanently delete all items in trash
      const [deletedPosts, deletedPages, deletedProducts] = await Promise.all([
        prisma.post.deleteMany({
          where: { organizationId, deletedAt: { not: null } },
        }),
        prisma.page.deleteMany({
          where: { organizationId, deletedAt: { not: null } },
        }),
        prisma.product.deleteMany({
          where: { organizationId, deletedAt: { not: null } },
        }),
      ]);

      return NextResponse.json({
        success: true,
        deleted: {
          posts: deletedPosts.count,
          pages: deletedPages.count,
          products: deletedProducts.count,
        },
        message: "Trash emptied successfully",
      });
    }

    if (!id || !itemType) {
      return NextResponse.json(
        { error: "Item ID and type are required" },
        { status: 400 }
      );
    }

    // Permanently delete single item
    switch (itemType) {
      case "post":
        await prisma.post.delete({
          where: { id, organizationId },
        });
        break;
      case "page":
        await prisma.page.delete({
          where: { id, organizationId },
        });
        break;
      case "product":
        await prisma.product.delete({
          where: { id, organizationId },
        });
        break;
      default:
        return NextResponse.json(
          { error: "Invalid item type" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${
        itemType.charAt(0).toUpperCase() + itemType.slice(1)
      } permanently deleted`,
    });
  } catch (error) {
    console.error("Trash delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
