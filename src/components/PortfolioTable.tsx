/**
 * PortfolioTable Component
 * Displays all stocks with columns: Symbol, Shares, Avg Price, Current Price,
 * Total Cost, Market Value, Unrealized P/L, Realized P/L, Net P/L
 * On mobile: card layout. On md+: full table.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PortfolioTableFiled } from "@/types";
import {
  formatCurrency,
  formatPercent,
  formatNumber,
} from "@/lib/utils/calculations";
import StockLogo from "./StockLogo";
import { ArrowUpDown, ArrowUp, ArrowDown, Plus, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  stocks: PortfolioTableFiled[];
  currency: "USD" | "THB";
  exchangeRate: number;
  hideNumbers?: boolean;
  /** If provided, overrides the responsive default (cards on mobile, table on md+) */
  viewMode?: "card" | "table";
}

type SortField =
  | "symbol"
  | "units"
  | "avgPrice"
  | "currentPrice"
  | "totalCost"
  | "currentValue"
  | "unrealizedPnl"
  | "realizedPnl"
  | "netPnl";
type SortDirection = "asc" | "desc";

const HIDDEN = "••••••";

export default function PortfolioTable({
  stocks,
  currency,
  exchangeRate,
  hideNumbers = false,
  viewMode,
}: Props) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>("symbol");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const convertValue = (value: number) => {
    return currency === "THB" ? value * exchangeRate : value;
  };

  const mask = (formatted: string) => (hideNumbers ? HIDDEN : formatted);

  if (stocks.length === 0) {
    return (
      <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-8 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/60 text-blue-500 mx-auto mb-3">
          📊
        </div>
        <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 mb-1">
          No Stocks Found
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
          No stocks in this portfolio group yet. Add your first stock to start tracking performance.
        </p>
        <Link
          href="/portfolio/add"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Your First Stock</span>
        </Link>
      </div>
    );
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    if (!sortField) return 0;
    let comparison = 0;
    if (sortField === "symbol") comparison = a.symbol.localeCompare(b.symbol);
    else if (sortField === "units") comparison = a.units - b.units;
    else if (sortField === "avgPrice") comparison = a.avgPrice - b.avgPrice;
    else if (sortField === "currentPrice")
      comparison = a.currentPrice - b.currentPrice;
    else if (sortField === "totalCost") comparison = a.totalCost - b.totalCost;
    else if (sortField === "currentValue")
      comparison = a.currentValue - b.currentValue;
    else if (sortField === "unrealizedPnl")
      comparison = a.unrealizedPnl - b.unrealizedPnl;
    else if (sortField === "realizedPnl")
      comparison = a.realizedPnl - b.realizedPnl;
    else if (sortField === "netPnl") comparison = a.netPnl - b.netPnl;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field)
      return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-gray-400 opacity-60" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 ml-1 text-blue-600 dark:text-blue-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 ml-1 text-blue-600 dark:text-blue-400" />
    );
  };

  const handleRowClick = (symbol: string, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a")) return;
    router.push(`/stocks/${symbol}`);
  };

  const showCards = viewMode === "card" || viewMode === undefined;
  const showTable = viewMode === "table" || viewMode === undefined;

  const cardContainerClass =
    viewMode === "card"
      ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      : "md:hidden space-y-3";

  const tableContainerClass =
    viewMode === "table"
      ? "block overflow-x-auto rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm"
      : "hidden md:block overflow-x-auto rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm";

  return (
    <>
      {/* ── Card View ── */}
      {showCards && (
        <div className={cardContainerClass}>
          {sortedStocks.map((stock) => {
            const isNetProfit = stock.netPnl >= 0;
            const isUnrealizedProfit = stock.unrealizedPnl >= 0;
            return (
              <div
                key={stock.symbol}
                onClick={(e) => handleRowClick(stock.symbol, e)}
                className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-all hover:scale-[1.01]"
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <StockLogo symbol={stock.symbol} size="md" />
                    <div>
                      <span className="font-extrabold text-gray-900 dark:text-gray-100 text-lg">
                        {stock.symbol}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        isNetProfit
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80"
                          : "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/80"
                      }`}
                    >
                      {isNetProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{formatPercent(stock.netPnlPercent)}</span>
                    </span>
                    <Link
                      href={`/portfolio/edit/${stock.symbol}`}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-xl bg-blue-500 hover:bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm transition-all"
                      title="Buy / Sell"
                    >
                      +/-
                    </Link>
                  </div>
                </div>

                {/* Price row */}
                <div className="grid grid-cols-2 gap-3 text-xs mb-3 bg-gray-50/50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 font-semibold mb-0.5">
                      Avg Price
                    </p>
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {mask(
                        formatCurrency(convertValue(stock.avgPrice), currency)
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 font-semibold mb-0.5">
                      Current Price
                    </p>
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {mask(
                        formatCurrency(
                          convertValue(stock.currentPrice),
                          currency
                        )
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 font-semibold mb-0.5">
                      Shares
                    </p>
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {mask(formatNumber(stock.units, 7))}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 font-semibold mb-0.5">
                      Total Cost
                    </p>
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      {mask(
                        formatCurrency(convertValue(stock.totalCost), currency)
                      )}
                    </p>
                  </div>
                </div>

                {/* P/L row */}
                <div className="grid grid-cols-3 gap-2 text-xs pt-2">
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 font-semibold">
                      Current Value
                    </p>
                    <p className="font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                      {mask(
                        formatCurrency(
                          convertValue(stock.currentValue),
                          currency
                        )
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 font-semibold">
                      Unrealized
                    </p>
                    <p
                      className={`font-bold mt-0.5 ${
                        isUnrealizedProfit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatPercent(stock.unrealizedPnlPercent)}
                      <br />
                      <span className="font-semibold text-[10px]">
                        {mask(
                          formatCurrency(
                            convertValue(stock.unrealizedPnl),
                            currency
                          )
                        )}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 font-semibold">
                      Net P/L
                    </p>
                    <p
                      className={`font-extrabold mt-0.5 ${
                        isNetProfit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatPercent(stock.netPnlPercent)}
                      <br />
                      <span className="font-semibold text-[10px]">
                        {mask(
                          formatCurrency(convertValue(stock.netPnl), currency)
                        )}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Desktop table ────────────────────── */}
      {showTable && (
        <div className={tableContainerClass}>
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead className="border-b border-gray-200/80 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 select-none">
              <tr>
                <th
                  className="px-4 py-3.5 text-left font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors"
                  onClick={() => handleSort("symbol")}
                >
                  <div className="flex items-center gap-1">
                    <span>Stock</span>
                    <SortIcon field="symbol" />
                  </div>
                </th>
                <th
                  className="px-4 py-3.5 text-right font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors"
                  onClick={() => handleSort("units")}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Shares</span>
                    <SortIcon field="units" />
                  </div>
                </th>
                <th
                  className="px-4 py-3.5 text-right font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors"
                  onClick={() => handleSort("avgPrice")}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Avg Price</span>
                    <SortIcon field="avgPrice" />
                  </div>
                </th>
                <th
                  className="px-4 py-3.5 text-right font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors"
                  onClick={() => handleSort("currentPrice")}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Current Price</span>
                    <SortIcon field="currentPrice" />
                  </div>
                </th>
                <th
                  className="px-4 py-3.5 text-right font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors"
                  onClick={() => handleSort("totalCost")}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Cost</span>
                    <SortIcon field="totalCost" />
                  </div>
                </th>
                <th
                  className="px-4 py-3.5 text-right font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors"
                  onClick={() => handleSort("currentValue")}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Current Value</span>
                    <SortIcon field="currentValue" />
                  </div>
                </th>
                <th
                  className="px-4 py-3.5 text-right font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors"
                  onClick={() => handleSort("unrealizedPnl")}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Unrealized P/L</span>
                    <SortIcon field="unrealizedPnl" />
                  </div>
                </th>
                <th
                  className="px-4 py-3.5 text-right font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors"
                  onClick={() => handleSort("realizedPnl")}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Realized P/L</span>
                    <SortIcon field="realizedPnl" />
                  </div>
                </th>
                <th
                  className="px-4 py-3.5 text-right font-bold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors"
                  onClick={() => handleSort("netPnl")}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Net P/L</span>
                    <SortIcon field="netPnl" />
                  </div>
                </th>
                <th className="px-4 py-3.5 text-center font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {sortedStocks.map((stock) => {
                const isUnrealizedProfit = stock.unrealizedPnl >= 0;
                const isRealizedProfit = stock.realizedPnl >= 0;
                const isNetProfit = stock.netPnl >= 0;
                return (
                  <tr
                    key={stock.symbol}
                    onClick={(e) => handleRowClick(stock.symbol, e)}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-800/80 cursor-pointer transition-colors"
                    title="Click to view stock details"
                  >
                    <td className="px-4 py-3.5 font-extrabold text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-3">
                        <StockLogo symbol={stock.symbol} size="md" />
                        <span className="text-sm sm:text-base">{stock.symbol}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-gray-700 dark:text-gray-300">
                      {mask(formatNumber(stock.units, 7))}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-gray-700 dark:text-gray-300">
                      {mask(
                        formatCurrency(convertValue(stock.avgPrice), currency)
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-gray-900 dark:text-gray-100">
                      {mask(
                        formatCurrency(
                          convertValue(stock.currentPrice),
                          currency
                        )
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-gray-700 dark:text-gray-300">
                      {mask(
                        formatCurrency(convertValue(stock.totalCost), currency)
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-gray-900 dark:text-gray-100">
                      {mask(
                        formatCurrency(
                          convertValue(stock.currentValue),
                          currency
                        )
                      )}
                    </td>
                    <td
                      className={`px-4 py-3.5 text-right font-bold ${
                        isUnrealizedProfit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatPercent(stock.unrealizedPnlPercent)}
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-normal">
                        {mask(
                          formatCurrency(
                            convertValue(stock.unrealizedPnl),
                            currency
                          )
                        )}
                      </div>
                    </td>
                    <td
                      className={`px-4 py-3.5 text-right font-bold ${
                        isRealizedProfit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(
                        convertValue(stock.realizedPnl),
                        currency
                      )}
                    </td>
                    <td
                      className={`px-4 py-3.5 text-right font-extrabold ${
                        isNetProfit ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatPercent(stock.netPnlPercent)}
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-normal">
                        {mask(
                          formatCurrency(convertValue(stock.netPnl), currency)
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Link
                        href={`/portfolio/edit/${stock.symbol}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-blue-500 hover:bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>+/-</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
