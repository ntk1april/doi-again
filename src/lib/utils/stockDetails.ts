/**
 * Fetch detailed stock information from Finnhub API
 * Includes company profile, financials, analyst recommendations, and sentiment
 */

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const BASE_URL = "https://finnhub.io/api/v1";

interface CompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

interface Quote {
  c: number; // Current price
  d: number; // Change
  dp: number; // Percent change
  h: number; // High price of the day
  l: number; // Low price of the day
  o: number; // Open price of the day
  pc: number; // Previous close price
  t: number; // Timestamp
}

interface FinancialMetrics {
  metric: {
    "52WeekHigh": number;
    "52WeekLow": number;
    "52WeekPriceReturnDaily": number;
    beta: number;
    marketCapitalization: number;
    peBasicExclExtraTTM: number; // P/E Ratio
    pbAnnual: number; // P/B Ratio
    dividendYieldIndicatedAnnual: number;
    epsBasicExclExtraItemsAnnual: number; // EPS
    roaRfy: number; // Return on Assets
    roeRfy: number; // Return on Equity
  };
}

interface RecommendationTrend {
  buy: number;
  hold: number;
  period: string;
  sell: number;
  strongBuy: number;
  strongSell: number;
  symbol: string;
}

interface NewsSentiment {
  buzz: {
    articlesInLastWeek: number;
    buzz: number;
    weeklyAverage: number;
  };
  companyNewsScore: number;
  sectorAverageBullishPercent: number;
  sectorAverageNewsScore: number;
  sentiment: {
    bearishPercent: number;
    bullishPercent: number;
  };
  symbol: string;
}

export interface StockDetails {
  symbol: string;
  profile: CompanyProfile | null;
  quote: Quote | null;
  metrics: FinancialMetrics | null;
  recommendations: RecommendationTrend[] | null;
  sentiment: NewsSentiment | null;
  error?: string;
}

async function fetchFromFinnhub(endpoint: string): Promise<any> {
  if (!FINNHUB_API_KEY) {
    throw new Error("FINNHUB_API_KEY not configured");
  }

  const url = `${BASE_URL}${endpoint}&token=${FINNHUB_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Finnhub API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get comprehensive stock details
 */
export async function getStockDetails(symbol: string): Promise<StockDetails> {
  const upperSymbol = symbol.toUpperCase();

  try {
    // Fetch all data in parallel
    const [profile, quote, metrics, recommendations, sentiment] = await Promise.allSettled([
      fetchFromFinnhub(`/stock/profile2?symbol=${upperSymbol}`),
      fetchFromFinnhub(`/quote?symbol=${upperSymbol}`),
      fetchFromFinnhub(`/stock/metric?symbol=${upperSymbol}&metric=all`),
      fetchFromFinnhub(`/stock/recommendation?symbol=${upperSymbol}`),
      fetchFromFinnhub(`/news-sentiment?symbol=${upperSymbol}`),
    ]);

    return {
      symbol: upperSymbol,
      profile: profile.status === "fulfilled" ? profile.value : null,
      quote: quote.status === "fulfilled" ? quote.value : null,
      metrics: metrics.status === "fulfilled" ? metrics.value : null,
      recommendations: recommendations.status === "fulfilled" ? recommendations.value : null,
      sentiment: sentiment.status === "fulfilled" ? sentiment.value : null,
    };
  } catch (error) {
    console.error(`Error fetching stock details for ${upperSymbol}:`, error);
    return {
      symbol: upperSymbol,
      profile: null,
      quote: null,
      metrics: null,
      recommendations: null,
      sentiment: null,
      error: error instanceof Error ? error.message : "Failed to fetch stock details",
    };
  }
}

/**
 * Get company profile only (lighter request)
 */
export async function getCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
  try {
    return await fetchFromFinnhub(`/stock/profile2?symbol=${symbol.toUpperCase()}`);
  } catch (error) {
    console.error(`Error fetching company profile for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get current quote only
 */
export async function getStockQuote(symbol: string): Promise<Quote | null> {
  try {
    return await fetchFromFinnhub(`/quote?symbol=${symbol.toUpperCase()}`);
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}
