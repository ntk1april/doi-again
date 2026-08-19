const WEBULL_API_URL = process.env.WEBULL_API_URL || "";
const WEBULL_API_KEY = process.env.WEBULL_API_KEY || process.env.API_SECRET_KEY || "";

export async function getWebullBars(symbol: string, timespan: string = "D", count: number = 100, revalidateSeconds: number = 300): Promise<any[] | null> {
  if (!WEBULL_API_URL || !WEBULL_API_KEY) return null;
  try {
    const response = await fetch(
      `${WEBULL_API_URL}/api/v1/market/bars?symbol=${symbol.toUpperCase()}&category=US_STOCK&timespan=${timespan}&count=${count}`,
      { headers: { "X-API-Key": WEBULL_API_KEY }, next: { revalidate: revalidateSeconds } }
    );
    if (!response.ok) return null;
    const json = await response.json();
    if (Array.isArray(json)) {
      return json.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    }
    return null;
  } catch (error) {
    console.error(`Error fetching Webull bars for ${symbol}:`, error);
    return null;
  }
}
