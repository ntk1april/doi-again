import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";
import { Wishlist } from "@/lib/db/models";
import { requireAuth } from "@/lib/auth/middleware";
import { ApiResponse } from "@/types";


/**
 * DELETE /api/wishlist/[symbol]
 * Remove stock from wishlist
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
): Promise<NextResponse> {
  try {
    const userId = requireAuth(request);
    await connectDB();

    const { symbol } = await params;
    const normalizedSymbol = symbol.toUpperCase();

    const result = await Wishlist.deleteOne({ userId, symbol: normalizedSymbol });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Stock not found in wishlist",
        } as ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `${normalizedSymbol} removed from wishlist`,
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to remove from wishlist",
      } as ApiResponse,
      { status: 500 }
    );
  }
}
