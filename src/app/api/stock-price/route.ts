import { NextRequest, NextResponse } from "next/server";
import { getWebullSnapshot } from "@/lib/utils/stockPrice";

/**
 * GET /api/stock-price?symbol=AAPL
 * Get current stock price with market status
 */
export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { success: false, error: "Symbol is required" },
      { status: 400 },
    );
  }

  try {
    const data = await getWebullSnapshot(symbol, 30);

    if (!data) {
      throw new Error("Failed to fetch stock price");
    }

    // Determine market status based on current time (US Eastern Time)
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getMinutes();
    const utcTime = utcHours * 60 + utcMinutes;

    // Convert to EST/EDT (UTC-5 or UTC-4)
    // For simplicity, using UTC-5 (EST)
    const estTime = utcTime - 5 * 60;
    const estHours = Math.floor(estTime / 60) % 24;
    const estMinutes = estTime % 60;

    let marketStatus = "closed";
    let isMarketOpen = false;

    // Pre-market: 3:00 AM - 8:30 AM EST
    if (
      (estHours === 3 && estMinutes >= 0) ||
      (estHours > 3 && estHours < 8) ||
      (estHours === 8 && estMinutes < 30)
    ) {
      marketStatus = "pre-market";
    }
    // Regular hours: 8:30 AM - 3:00 PM EST
    else if (
      (estHours === 8 && estMinutes >= 30) ||
      (estHours > 8 && estHours < 15) ||
      (estHours === 15 && estMinutes < 30)
    ) {
      marketStatus = "regular";
      isMarketOpen = true;
    }
    // After-hours: 3:00 PM - 7:00 PM EST
    else if (estHours >= 15 && estHours < 19) {
      marketStatus = "after-hours";
    }

    // Check if it's weekend
    const dayOfWeek = now.getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      marketStatus = "closed";
      isMarketOpen = false;
    }

    return NextResponse.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        price: parseFloat(data.price) || 0,
        change: parseFloat(data.change) || 0,
        changePercent: parseFloat(data.change_ratio) * 100 || 0,
        high: parseFloat(data.high) || 0,
        low: parseFloat(data.low) || 0,
        open: parseFloat(data.open) || 0,
        previousClose: parseFloat(data.pre_close) || 0,
        isMarketOpen,
        marketStatus: data.market_status || data.status || marketStatus,
        timestamp: data.quote_time ? data.quote_time / 1000 : Date.now() / 1000,
      },
    });
  } catch (error) {
    console.error("Error fetching stock price:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stock price" },
      { status: 500 },
    );
  }
}
