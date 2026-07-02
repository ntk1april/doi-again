import { NextResponse } from "next/server";

/**
 * GET /api/exchange-rate
 * Fetch current USD to THB exchange rate with fallback chain
 */
export async function GET() {
  try {
    // Primary API: open.er-api.com (free, no API key required, 1500 requests/month)
    let data = await fetchFromPrimaryAPI();

    if (!data) {
      // Fallback API: exchangerate-api.com
      console.log("Primary API failed, trying fallback API...");
      data = await fetchFromFallbackAPI();
    }

    if (!data) {
      throw new Error("Both APIs failed");
    }

    // Try different possible response structures
    let thbRate = null;

    if (data.rates?.THB) {
      thbRate = data.rates.THB;
    } else if (data.conversion_rates?.THB) {
      thbRate = data.conversion_rates.THB;
    } else if (typeof data.THB === "number") {
      thbRate = data.THB;
    }

    if (!thbRate) {
      console.error("Could not find THB rate in response:", data);
      throw new Error("THB rate not found in response");
    }

    console.log("Using THB rate:", thbRate);

    return NextResponse.json(
      {
        success: true,
        data: {
          rate: thbRate,
          base: "USD",
          target: "THB",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching exchange rate:", error);

    // Final fallback to hardcoded rate if both APIs fail
    return NextResponse.json(
      {
        success: true,
        data: {
          rate: 32,
          base: "USD",
          target: "THB",
          timestamp: new Date().toISOString(),
          fallback: true,
        },
      },
      { status: 200 },
    );
  }
}

/**
 * Fetch from primary API (open.er-api.com)
 */
async function fetchFromPrimaryAPI() {
  try {
    console.log("Fetching from primary API: open.er-api.com");
    const response = await fetch("https://open.er-api.com/v6/latest/USD");

    if (!response.ok) {
      console.error("Primary API request failed:", response.status);
      return null;
    }

    const data = await response.json();
    // console.log("Primary API response:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("Primary API error:", error);
    return null;
  }
}

/**
 * Fetch from fallback API (exchangerate-api.com)
 */
async function fetchFromFallbackAPI() {
  try {
    console.log("Fetching from fallback API: exchangerate-api.com");
    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
    );

    if (!response.ok) {
      console.error("Fallback API request failed:", response.status);
      return null;
    }

    const data = await response.json();
    // console.log("Fallback API response:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("Fallback API error:", error);
    return null;
  }
}
