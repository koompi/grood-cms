import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";

// GET single FAQ
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("settings", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { id } = await params;

    const faq = await prisma.fAQ.findFirst({
      where: { id, organizationId },
    });

    if (!faq) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    return NextResponse.json(faq);
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    return NextResponse.json({ error: "Failed to fetch FAQ" }, { status: 500 });
  }
}

// PUT update FAQ
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("settings", "edit");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { id } = await params;
    const body = await request.json();
    const { question, answer, category, order } = body;

    const existing = await prisma.fAQ.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    const faq = await prisma.fAQ.update({
      where: { id },
      data: {
        question,
        answer,
        category,
        order,
      },
    });

    return NextResponse.json(faq);
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return NextResponse.json(
      { error: "Failed to update FAQ" },
      { status: 500 }
    );
  }
}

// DELETE FAQ
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("settings", "delete");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { id } = await params;

    const existing = await prisma.fAQ.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "FAQ not found" }, { status: 404 });
    }

    await prisma.fAQ.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return NextResponse.json(
      { error: "Failed to delete FAQ" },
      { status: 500 }
    );
  }
}
