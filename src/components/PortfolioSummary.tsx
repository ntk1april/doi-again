/**
 * PortfolioSummary Component
 * Displays portfolio overview: total invested, current value, P/L summary, top gainer/loser
 */

import { PortfolioSummary as PortfolioSummaryType } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/utils/calculations";

interface Stock {
  symbol: string;
  netPnl: number;
  netPnlPercent: number;
}

interface Props {
  summary: PortfolioSummaryType;
  currency: "USD" | "THB";
  exchangeRate: number;
  stocks?: Stock[]; // Optional stocks array to find top gainer/loser
}

export default function PortfolioSummary({ summary, currency, exchangeRate, stocks = [] }: Props) {
  const isProfit = summary.netPnl >= 0;

  const convertValue = (value: number) => {
    return currency === "THB" ? value * exchangeRate : value;
  };

  // Find top gainer and top loser
  const topGainer = stocks.length > 0
    ? stocks.reduce((max, stock) => stock.netPnlPercent > max.netPnlPercent ? stock : max, stocks[0])
    : null;

  const topLoser = stocks.length > 0
    ? stocks.reduce((min, stock) => stock.netPnlPercent < min.netPnlPercent ? stock : min, stocks[0])
    : null;

  return (
    <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
      {/* Total Invested */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-600">Total Invested 💵</p>
        <p className="mt-2 text-2xl font-bold text-gray-900">
          {formatCurrency(convertValue(summary.totalInvested), currency)}
        </p>
      </div>

      {/* Current Value */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-600">Current Value 💸</p>
        <p className="mt-2 text-2xl font-bold text-gray-900">
          {formatCurrency(convertValue(summary.currentValue), currency)}
        </p>
      </div>

      {/* Net P/L */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-600">Net P/L 💰</p>
        <p
          className={`mt-2 text-2xl font-bold ${isProfit ? "text-green-600" : "text-red-600"
            }`}
        >
          {formatCurrency(convertValue(summary.netPnl), currency)}
        </p>
        <p
          className={`mt-1 text-sm font-medium ${isProfit ? "text-green-600" : "text-red-600"
            }`}
        >
          {formatPercent(summary.netPnlPercent)}
        </p>
      </div>

      {/* Top Gainer */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-600">Top Gainer 📈</p>
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
                ({formatCurrency(convertValue(topGainer.netPnl), currency)})
              </p>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-gray-400">No data</p>
        )}
      </div>

      {/* Top Loser */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-gray-600">Top Loser 📉</p>
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
                ({formatCurrency(convertValue(topLoser.netPnl), currency)})
              </p>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-gray-400">No data</p>
        )}
      </div>
    </div>
  );
}
