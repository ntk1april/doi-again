import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";
import { getStockDetails } from "@/lib/utils/stockDetails";

/**
 * GET /api/stocks/[symbol]
 * Get detailed information about any stock (public endpoint - no auth required)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
): Promise<NextResponse> {
  try {
    const { symbol } = await params;
    const normalizedSymbol = symbol.toUpperCase();

    // Fetch detailed stock information
    const stockDetails = await getStockDetails(normalizedSymbol);

    return NextResponse.json(
      {
        success: true,
        data: stockDetails,
      } as ApiResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching stock details:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch stock details",
      } as ApiResponse,
      { status: 500 }
    );
  }
}
