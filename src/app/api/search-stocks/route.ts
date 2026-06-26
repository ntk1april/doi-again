import { NextRequest, NextResponse } from "next/server";
import { getStockLogo } from "@/lib/utils/logos";

const ALPHAVANTAGE_API_KEY = process.env.ALPHAVANTAGE_API_KEY;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

/**
 * Search stocks using Finnhub API
 */
async function searchWithFinnhub(query: string) {
  if (!FINNHUB_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 3600 } },
    );

    if (!response.ok) {
      console.error(`Finnhub API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.result && Array.isArray(data.result)) {
      return data.result.slice(0, 8).map((item: any) => ({
        symbol: item.symbol,
        name: item.description || item.symbol,
        logo: getStockLogo(item.symbol),
      }));
    }

    return null;
  } catch (error) {
    console.error("Finnhub search error:", error);
    return null;
  }
}

/**
 * Search stocks using Alpha Vantage API
 */
async function searchWithAlphaVantage(query: string) {
  if (!ALPHAVANTAGE_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${ALPHAVANTAGE_API_KEY}`,
      { next: { revalidate: 3600 } },
    );

    if (!response.ok) {
      console.error(`Alpha Vantage API error: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Alpha Vantage API returned non-JSON response");
      return null;
    }

    const data = await response.json();

    if (data["Error Message"] || data["Note"]) {
      console.error(
        "Alpha Vantage API message:",
        data["Error Message"] || data["Note"],
      );
      return null;
    }

    if (data.bestMatches && Array.isArray(data.bestMatches)) {
      return data.bestMatches.slice(0, 8).map((match: any) => ({
        symbol: match["1. symbol"],
        name: match["2. name"],
        logo: getStockLogo(match["1. symbol"]),
      }));
    }

    return null;
  } catch (error) {
    console.error("Alpha Vantage search error:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  // Try Finnhub first (more reliable for free tier)
  let results = await searchWithFinnhub(query);

  // Fallback to Alpha Vantage if Finnhub fails
  if (!results) {
    results = await searchWithAlphaVantage(query);
  }

  // If both APIs fail, return empty results
  if (!results) {
    console.warn("All stock search APIs failed or are not configured");
    return NextResponse.json({ results: [] });
  }

  return NextResponse.json({ results });
}
