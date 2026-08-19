import { NextRequest, NextResponse } from "next/server";

import { ApiResponse } from "@/types";
import { getStockDetails } from "@/lib/utils/stockDetails";
import { getWebullSnapshot } from "@/lib/utils/stockPrice";
import { getWebullBars } from "@/lib/utils/stockBar";

/**
 * GET /api/stock-details/[symbol]
 * Get detailed information about any stock (public endpoint - no auth required)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> },
): Promise<NextResponse> {
  try {
    const { symbol } = await params;
    const normalizedSymbol = symbol.toUpperCase();

    // Fetch detailed stock information
    const stockDetails = await getStockDetails(normalizedSymbol);

    const timespan = request.nextUrl.searchParams.get("timespan") || "D";

    try {
      const [data, barsJson] = await Promise.all([
        getWebullSnapshot(normalizedSymbol, 30),
        getWebullBars(normalizedSymbol, timespan, 100, 300),
      ]);

      if (data) {
        stockDetails.quote = {
          c: parseFloat(data.price) || 0,
          d: parseFloat(data.change) || 0,
          dp: parseFloat(data.change_ratio) * 100 || 0,
          h: parseFloat(data.high) || 0,
          l: parseFloat(data.low) || 0,
          o: parseFloat(data.open) || 0,
          pc: parseFloat(data.pre_close) || 0,
          t: data.quote_time ? data.quote_time / 1000 : Date.now() / 1000,
        };
      }

      if (barsJson) {
        // @ts-ignore
        stockDetails.bars = barsJson.map((b: any) => ({
          time: new Date(b.time).toISOString(),
          open: parseFloat(b.open),
          high: parseFloat(b.high),
          low: parseFloat(b.low),
          close: parseFloat(b.close),
          volume: parseInt(b.volume, 10),
        }));
      }
    } catch (err) {
      console.error(
        `Failed to override with Webull proxy for ${normalizedSymbol}:`,
        err,
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: stockDetails,
      } as ApiResponse,
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching stock details:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch stock details",
      } as ApiResponse,
      { status: 500 },
    );
  }
}
