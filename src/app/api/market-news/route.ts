import { NextResponse } from "next/server";

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

/**
 * GET /api/market-news
 * Get general market news
 */
export async function GET() {
  if (!FINNHUB_API_KEY) {
    return NextResponse.json(
      { success: false, error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    // Fetch general market news from Finnhub
    const response = await fetch(
      `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );

    if (!response.ok) {
      throw new Error("Failed to fetch market news");
    }

    const news = await response.json();

    return NextResponse.json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error("Error fetching market news:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch market news" },
      { status: 500 }
    );
  }
}
