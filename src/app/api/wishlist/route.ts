import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Wishlist } from "@/lib/db/models";
import { requireAuth } from "@/lib/auth/middleware";
import { ApiResponse } from "@/types";

/**
 * GET /api/wishlist
 * Get all wishlist items for the authenticated user
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = requireAuth(request);
    await connectDB();

    const wishlistItems = await Wishlist.find({ userId }).sort({ addedAt: -1 });

    return NextResponse.json(
      {
        success: true,
        data: wishlistItems,
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error && error.message === "Unauthorized" 
          ? "Unauthorized" 
          : "Failed to fetch wishlist",
      } as ApiResponse,
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

/**
 * POST /api/wishlist
 * Add a stock to wishlist
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = requireAuth(request);
    await connectDB();

    const { symbol, notes, targetPrice } = await request.json();

    if (!symbol) {
      return NextResponse.json(
        {
          success: false,
          error: "Symbol is required",
        } as ApiResponse,
        { status: 400 }
      );
    }

    const normalizedSymbol = symbol.toUpperCase().trim();

    // Check if already in wishlist
    const existing = await Wishlist.findOne({ userId, symbol: normalizedSymbol });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Stock already in wishlist",
        } as ApiResponse,
        { status: 400 }
      );
    }

    // Add to wishlist
    const wishlistItem = await Wishlist.create({
      userId,
      symbol: normalizedSymbol,
      notes: notes || "",
      targetPrice: targetPrice || undefined,
      addedAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        data: wishlistItem,
        message: `${normalizedSymbol} added to wishlist`,
      } as ApiResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add to wishlist",
      } as ApiResponse,
      { status: 500 }
    );
  }
}
