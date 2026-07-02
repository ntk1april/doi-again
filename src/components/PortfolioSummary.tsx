/**
 * PortfolioSummary Component
 * Displays portfolio overview: total invested, current value, P/L summary, top gainer/loser
 */

import { PortfolioSummary as PortfolioSummaryType } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/utils/calculations";

const HIDDEN = "••••••";

interface Stock {
  symbol: string;
  netPnl: number;
  netPnlPercent: number;
}

interface Props {
  summary: PortfolioSummaryType;
  currency: "USD" | "THB";
  exchangeRate: number;
  stocks?: Stock[];
  hideNumbers?: boolean;
}

export default function PortfolioSummary({
  summary,
  currency,
  exchangeRate,
  stocks = [],
  hideNumbers = false,
}: Props) {
  const isProfit = summary.netPnl >= 0;

  const convertValue = (value: number) => {
    return currency === "THB" ? value * exchangeRate : value;
  };

  const mask = (formatted: string) => (hideNumbers ? HIDDEN : formatted);

  // Find top gainer and top loser
  const topGainer =
    stocks.length > 0
      ? stocks.reduce(
          (max, stock) =>
            stock.netPnlPercent > max.netPnlPercent ? stock : max,
          stocks[0],
        )
      : null;

  const topLoser =
    stocks.length > 0
      ? stocks.reduce(
          (min, stock) =>
            stock.netPnlPercent < min.netPnlPercent ? stock : min,
          stocks[0],
        )
      : null;

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      {/* Total Invested */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Invested 💵</p>
        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          {mask(formatCurrency(convertValue(summary.totalInvested), currency))}
        </p>
      </div>

      {/* Current Value */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Value 💸</p>
        <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          {mask(formatCurrency(convertValue(summary.currentValue), currency))}
        </p>
      </div>

      {/* Net P/L */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net P/L 💰</p>
        <p
          className={`mt-2 text-2xl font-bold ${
            isProfit ? "text-green-600" : "text-red-600"
          }`}
        >
          {formatPercent(summary.netPnlPercent)}
        </p>
        <p
          className={`mt-1 text-sm font-medium ${
            isProfit ? "text-green-600" : "text-red-600"
          }`}
        >
          {mask(formatCurrency(convertValue(summary.netPnl), currency))}
        </p>
      </div>

      {/* Top Gainer */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Gainer 📈</p>
        {topGainer ? (
          <>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {topGainer.symbol}
            </p>
            <div className="flex items-center gap-2">
              <p className="mt-1 text-sm font-medium text-green-600">
                {formatPercent(topGainer.netPnlPercent)}
              </p>
              <p className="mt-1 text-sm font-medium text-green-600">
                (
                {mask(formatCurrency(convertValue(topGainer.netPnl), currency))}
                )
              </p>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">No data</p>
        )}
      </div>

      {/* Top Loser */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Top Loser 📉</p>
        {topLoser ? (
          <>
            <p className="mt-2 text-2xl font-bold text-red-600">
              {topLoser.symbol}
            </p>
            <div className="flex items-center gap-2">
              <p className="mt-1 text-sm font-medium text-red-600">
                {formatPercent(topLoser.netPnlPercent)}
              </p>
              <p className="mt-1 text-sm font-medium text-red-600">
                ({mask(formatCurrency(convertValue(topLoser.netPnl), currency))}
                )
              </p>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">No data</p>
        )}
      </div>
    </div>
  );
}
