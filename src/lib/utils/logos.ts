/**
 * Utility function to get company logo URL for a stock symbol
 * Uses Finnhub logo CDN with fallbacks
 */

const LOGO_CACHE = new Map<string, string>();

/**
 * Get logo from Finnhub profile data (preferred method)
 * The profile.logo field contains the actual logo URL from Finnhub
 */
export function getLogoFromProfile(profile: any): string | null {
  return profile?.logo || null;
}

/**
 * Get stock logo URL (fallback if profile logo not available)
 */
export function getStockLogo(symbol: string): string {
  if (LOGO_CACHE.has(symbol)) {
    return LOGO_CACHE.get(symbol)!;
  }

  const upperSymbol = symbol.toUpperCase();

  // Primary: Use Finnhub logo format
  const finnhubLogo = `https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/${upperSymbol}.png`;

  LOGO_CACHE.set(symbol, finnhubLogo);

  return finnhubLogo;
}

/**
 * Get fallback logo URL (Financial Modeling Prep)
 */
export function getFallbackLogo(symbol: string): string {
  const upperSymbol = symbol.toUpperCase();
  return `https://financialmodelingprep.com/image-stock/${upperSymbol}.png`;
}

/**
 * Get placeholder with first 2 letters of symbol
 */
export function getLogoPlaceholder(symbol: string): string {
  const upperSymbol = symbol.toUpperCase();
  const letters = upperSymbol.substring(0, 2);

  // Return a data URL with the 2 letters as SVG
  const svg = `
    <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="#3B82F6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">
        ${letters}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
