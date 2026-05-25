import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { PortfolioTabGroup } from "@/lib/db/models";
import { requireAuth } from "@/lib/auth/middleware";

/**
 * GET /api/portfolio/tabs
 * Return saved tab groups for the authenticated user
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = requireAuth(request);
    await connectDB();

    const doc = await PortfolioTabGroup.findOne({ userId }).lean();
    const tabs = doc ? (doc as any).tabs : [];

    return NextResponse.json({ success: true, data: tabs });
  } catch (error) {
    const isUnauth =
      error instanceof Error && error.message === "Unauthorized";
    return NextResponse.json(
      { success: false, error: isUnauth ? "Unauthorized" : "Failed to load tabs" },
      { status: isUnauth ? 401 : 500 }
    );
  }
}

/**
 * PUT /api/portfolio/tabs
 * Upsert (replace) all tab groups for the authenticated user
 * Body: { tabs: PortfolioTab[] }
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = requireAuth(request);
    await connectDB();

    const { tabs } = await request.json();
    if (!Array.isArray(tabs)) {
      return NextResponse.json(
        { success: false, error: "tabs must be an array" },
        { status: 400 }
      );
    }

    // Upsert: one document per user
    await PortfolioTabGroup.findOneAndUpdate(
      { userId },
      { userId, tabs },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const isUnauth =
      error instanceof Error && error.message === "Unauthorized";
    return NextResponse.json(
      { success: false, error: isUnauth ? "Unauthorized" : "Failed to save tabs" },
      { status: isUnauth ? 401 : 500 }
    );
  }
}
