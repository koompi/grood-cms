import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";

// GET single store
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("settings", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { id } = await params;

    const store = await prisma.store.findFirst({
      where: { id, organizationId },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error("Error fetching store:", error);
    return NextResponse.json(
      { error: "Failed to fetch store" },
      { status: 500 }
    );
  }
}

// PUT update store
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
    const {
      name,
      type,
      address,
      city,
      country,
      phone,
      email,
      hours,
      services,
      image,
      lat,
      lng,
      status,
      featured,
    } = body;

    // Check if store exists
    const existing = await prisma.store.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const store = await prisma.store.update({
      where: { id },
      data: {
        name,
        type,
        address,
        city,
        country,
        phone,
        email,
        hours,
        services,
        image,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        status,
        featured,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.error("Error updating store:", error);
    return NextResponse.json(
      { error: "Failed to update store" },
      { status: 500 }
    );
  }
}

// DELETE store
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await withPermission("settings", "delete");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const { id } = await params;

    // Check if store exists
    const existing = await prisma.store.findFirst({
      where: { id, organizationId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    await prisma.store.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting store:", error);
    return NextResponse.json(
      { error: "Failed to delete store" },
      { status: 500 }
    );
  }
}
