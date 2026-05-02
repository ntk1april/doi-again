/**
 * P/L Calculation Utilities
 * Handles all profit/loss calculations for the portfolio
 */

/**
 * Calculate unrealized profit/loss for a stock
 * Formula: (currentPrice - avgPrice) × units
 */
export const calculateUnrealizedPnl = (
  currentPrice: number,
  avgPrice: number,
  units: number,
): number => {
  return (currentPrice - avgPrice) * units;
};

/**
 * Calculate unrealized P/L as a percentage
 * Formula: ((currentPrice - avgPrice) / avgPrice) × 100
 */
export const calculateUnrealizedPnlPercent = (
  currentPrice: number,
  avgPrice: number,
): number => {
  if (avgPrice === 0) return 0;
  return ((currentPrice - avgPrice) / avgPrice) * 100;
};

/**
 * Calculate total market value of a position
 * Formula: currentPrice × units
 */
export const calculateCurrentValue = (
  currentPrice: number,
  units: number,
): number => {
  return currentPrice * units;
};

/**
 * Calculate total cost of a position
 * Formula: avgPrice × units
 */
export const calculateTotalCost = (avgPrice: number, units: number): number => {
  return avgPrice * units;
};

/**
 * Calculate new average price when buying more stocks
 * Formula: (oldUnits × oldAvg + newUnits × buyPrice) / totalUnits
 */
export const calculateNewAvgPrice = (
  oldUnits: number,
  oldAvgPrice: number,
  newUnits: number,
  buyPrice: number,
): number => {
  const totalUnits = oldUnits + newUnits;
  if (totalUnits === 0) return 0;

  return (oldUnits * oldAvgPrice + newUnits * buyPrice) / totalUnits;
};

/**
 * Calculate realized P/L when selling stocks
 * Formula: (sellPrice - avgPrice) × sellUnits
 */
export const calculateRealizedPnl = (
  sellPrice: number,
  avgPrice: number,
  sellUnits: number,
): number => {
  return (sellPrice - avgPrice) * sellUnits;
};

/**
 * Calculate net P/L (Unrealized + Realized)
 * Formula: unrealizedPnl + realizedPnl
 */
export const calculateNetPnl = (
  unrealizedPnl: number,
  realizedPnl: number,
): number => {
  return unrealizedPnl + realizedPnl;
};

/**
 * Calculate net P/L percentage
 * Formula: (netPnl / totalInvested) × 100
 */
export const calculateNetPnlPercent = (
  netPnl: number,
  totalInvested: number,
): number => {
  if (totalInvested === 0) return 0;
  return (netPnl / totalInvested) * 100;
};

/**
 * Format a number as currency (USD or THB)
 */
export const formatCurrency = (
  value: number,
  currency: "USD" | "THB" = "USD",
): string => {
  return new Intl.NumberFormat(currency === "THB" ? "th-TH" : "en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
};

/**
 * Format a number as percentage
 */
export const formatPercent = (value: number, decimals = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format a number with 2 decimal places
 */
export const formatNumber = (value: number, decimals = 2): string => {
  return value.toFixed(decimals);
};
