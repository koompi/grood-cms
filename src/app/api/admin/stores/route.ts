import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/permissions";

// GET all stores
export async function GET(request: NextRequest) {
  try {
    const authResult = await withPermission("settings", "view");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = { organizationId };

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    if (type && type !== "all") {
      where.type = type.toUpperCase();
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { city: { contains: search } },
        { country: { contains: search } },
      ];
    }

    const stores = await prisma.store.findMany({
      where,
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });

    return NextResponse.json(stores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}

// POST create new store
export async function POST(request: NextRequest) {
  try {
    const authResult = await withPermission("settings", "edit");
    if (authResult instanceof NextResponse) return authResult;
    const { organizationId } = authResult;

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

    const store = await prisma.store.create({
      data: {
        name,
        type: type || "SERVICE_POINT",
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
        status: status || "ACTIVE",
        featured: featured || false,
        organizationId,
      },
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error("Error creating store:", error);
    return NextResponse.json(
      { error: "Failed to create store" },
      { status: 500 }
    );
  }
}
