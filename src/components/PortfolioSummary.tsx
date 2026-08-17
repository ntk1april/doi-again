/**
 * PortfolioSummary Component
 * Displays portfolio overview: total invested, current value, P/L summary, top gainer/loser
 */

import { PortfolioSummary as PortfolioSummaryType } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/utils/calculations";
import {
  Wallet,
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  Award,
  AlertOctagon,
} from "lucide-react";

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
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Total Invested
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 shadow-inner group-hover:scale-110 transition-transform">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
          {mask(formatCurrency(convertValue(summary.totalInvested), currency))}
        </p>
      </div>

      {/* Current Value */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Current Value
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 shadow-inner group-hover:scale-110 transition-transform">
            <CircleDollarSign className="w-4 h-4" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
          {mask(formatCurrency(convertValue(summary.currentValue), currency))}
        </p>
      </div>

      {/* Net P/L */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 shadow-sm hover:shadow-md transition-all group col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Net P/L
          </span>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-2xl shadow-inner group-hover:scale-110 transition-transform ${
              isProfit
                ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400"
                : "bg-red-50 dark:bg-red-950/60 border border-red-100 dark:border-red-800/60 text-red-600 dark:text-red-400"
            }`}
          >
            {isProfit ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
          </div>
        </div>
        <p
          className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
            isProfit
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {formatPercent(summary.netPnlPercent)}
        </p>
        <p
          className={`mt-1 text-xs font-bold ${
            isProfit
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {mask(formatCurrency(convertValue(summary.netPnl), currency))}
        </p>
      </div>

      {/* Top Gainer */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Top Gainer
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
            <Award className="w-4 h-4" />
          </div>
        </div>
        {topGainer ? (
          <>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {topGainer.symbol}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>{formatPercent(topGainer.netPnlPercent)}</span>
              <span>
                (
                {mask(formatCurrency(convertValue(topGainer.netPnl), currency))}
                )
              </span>
            </div>
          </>
        ) : (
          <p className="mt-2 text-xs font-semibold text-gray-400 dark:text-gray-500">
            No data
          </p>
        )}
      </div>

      {/* Top Loser */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 shadow-sm hover:shadow-md transition-all group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Top Loser
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-100 dark:border-red-800/60 text-red-600 dark:text-red-400 shadow-inner group-hover:scale-110 transition-transform">
            <AlertOctagon className="w-4 h-4" />
          </div>
        </div>
        {topLoser ? (
          <>
            <p className="text-xl sm:text-2xl font-extrabold text-red-600 dark:text-red-400 tracking-tight">
              {topLoser.symbol}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-red-600 dark:text-red-400">
              <span>{formatPercent(topLoser.netPnlPercent)}</span>
              <span>
                ({mask(formatCurrency(convertValue(topLoser.netPnl), currency))}
                )
              </span>
            </div>
          </>
        ) : (
          <p className="mt-2 text-xs font-semibold text-gray-400 dark:text-gray-500">
            No data
          </p>
        )}
      </div>
    </div>
  );
}
