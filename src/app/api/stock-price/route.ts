import { NextRequest, NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

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

  if (!FINNHUB_API_KEY) {
    return NextResponse.json(
      { success: false, error: "API key not configured" },
      { status: 500 },
    );
  }

  try {
    // Fetch quote from Finnhub
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol.toUpperCase()}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 30 } }, // Cache for 30 seconds
    );

    if (!response.ok) {
      throw new Error("Failed to fetch stock price");
    }

    const data = await response.json();

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
        price: data.c || 0, // Current price
        change: data.d || 0, // Change
        changePercent: data.dp || 0, // Percent change
        high: data.h || 0, // High price of the day
        low: data.l || 0, // Low price of the day
        open: data.o || 0, // Open price
        previousClose: data.pc || 0, // Previous close
        isMarketOpen,
        marketStatus,
        timestamp: data.t || Date.now() / 1000,
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
