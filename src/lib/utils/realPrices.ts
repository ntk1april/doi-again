/**
 * Real Stock Prices Integration with Multiple API Support
 * Primary: Finnhub API (https://finnhub.io/)
 * Fallback: Alpha Vantage API (https://www.alphavantage.co/)
 */

// Cache prices for 60 seconds (matches /api/stock-price revalidation)
const priceCache: Record<string, { price: number; timestamp: number }> = {};
const CACHE_DURATION = 12 * 1000; // 12 seconds

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const ALPHAVANTAGE_API_KEY = process.env.ALPHAVANTAGE_API_KEY;

/**
 * Fetch price from Finnhub API
 * Free tier: 60 API calls/minute
 */
async function getPriceFromFinnhub(symbol: string): Promise<number | null> {
  if (!FINNHUB_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`,
      { next: { revalidate: 12 } }, // Match stock-price API cache
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Finnhub returns current price in 'c' field
    if (data.c && data.c > 0) {
      return data.c;
    }

    return null;
  } catch (error) {
    console.error(`Finnhub price error for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch price from Alpha Vantage API
 * Free tier: 5 requests/minute, 500 requests/day
 */
async function getPriceFromAlphaVantage(
  symbol: string,
): Promise<number | null> {
  if (!ALPHAVANTAGE_API_KEY || ALPHAVANTAGE_API_KEY === "demo") {
    return null;
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHAVANTAGE_API_KEY}`,
      { next: { revalidate: 12 } },
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    // Check for API errors
    if (data["Note"] || data["Error Message"]) {
      return null;
    }

    if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
      const price = parseFloat(data["Global Quote"]["05. price"]);
      if (!isNaN(price) && price > 0) {
        return price;
      }
    }

    return null;
  } catch (error) {
    console.error(`Alpha Vantage price error for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get real stock price with automatic API fallback and caching
 */
export async function getRealStockPrice(symbol: string): Promise<number> {
  const upperSymbol = symbol.toUpperCase();

  // Check cache first
  const cached = priceCache[upperSymbol];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  // Try Finnhub first (more reliable and faster)
  let price = await getPriceFromFinnhub(upperSymbol);

  // Fallback to Alpha Vantage
  if (!price) {
    price = await getPriceFromAlphaVantage(upperSymbol);
  }

  // If both APIs fail, try to use expired cache, otherwise throw error
  if (!price) {
    if (cached) {
      console.warn(
        `APIs failed for ${upperSymbol}, using expired cached price`,
      );
      // Update timestamp to avoid spamming APIs on every request while rate-limited
      priceCache[upperSymbol].timestamp = Date.now();
      return cached.price;
    }

    throw new Error(
      `Unable to fetch price for ${upperSymbol}. APIs not configured or unavailable.`,
    );
  }

  // Cache the price
  priceCache[upperSymbol] = {
    price,
    timestamp: Date.now(),
  };

  return price;
}
