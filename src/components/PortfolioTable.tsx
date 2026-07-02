/**
 * PortfolioTable Component
 * Displays all stocks with columns: Symbol, Units, Avg Price, Current Price,
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
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          No stocks in portfolio yet.{" "}
          <Link
            href="/portfolio/add"
            className="font-medium text-blue-600 hover:underline"
          >
            Add your first stock
          </Link>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Or if you&apos;re in Custom Tab, click on &quot;✏️ Manage Port&quot; to add
          stocks to your tab.
        </p>
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
    else if (sortField === "currentPrice") comparison = a.currentPrice - b.currentPrice;
    else if (sortField === "totalCost") comparison = a.totalCost - b.totalCost;
    else if (sortField === "currentValue") comparison = a.currentValue - b.currentValue;
    else if (sortField === "unrealizedPnl") comparison = a.unrealizedPnl - b.unrealizedPnl;
    else if (sortField === "realizedPnl") comparison = a.realizedPnl - b.realizedPnl;
    else if (sortField === "netPnl") comparison = a.netPnl - b.netPnl;
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="ml-1 text-gray-400">⇅</span>;
    return <span className="ml-1 text-blue-600">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  const handleRowClick = (symbol: string, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a")) return;
    router.push(`/stocks/${symbol}`);
  };

  // Determine visibility classes based on viewMode prop
  // viewMode=undefined → responsive (cards on mobile, table on md+)
  // viewMode="card"    → cards always, using a grid for desktop
  // viewMode="table"   → table always
  const showCards = viewMode === "card" || viewMode === undefined;
  const showTable = viewMode === "table" || viewMode === undefined;

  const cardContainerClass = viewMode === "card" 
    ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" 
    : "md:hidden space-y-3";
    
  const tableContainerClass = viewMode === "table"
    ? "block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
    : "hidden md:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm";

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
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm hover:shadow-md cursor-pointer transition-shadow"
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <StockLogo symbol={stock.symbol} size="md" />
                  <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">{stock.symbol}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${isNetProfit ? "text-green-600" : "text-red-600"}`}>
                    {formatPercent(stock.netPnlPercent)}
                  </span>
                  <Link
                    href={`/portfolio/edit/${stock.symbol}`}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded bg-blue-500 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    +/-
                  </Link>
                </div>
              </div>

              {/* Price row */}
              <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Avg Price</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{mask(formatCurrency(convertValue(stock.avgPrice), currency))}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Current Price</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{mask(formatCurrency(convertValue(stock.currentPrice), currency))}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Units</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{mask(formatNumber(stock.units, 7))}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Total Cost</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{mask(formatCurrency(convertValue(stock.totalCost), currency))}</p>
                </div>
              </div>

              {/* P/L row */}
              <div className="grid grid-cols-3 gap-2 text-sm pt-2 border-t border-gray-100 dark:border-gray-700">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Current Value</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{mask(formatCurrency(convertValue(stock.currentValue), currency))}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Unrealized</p>
                  <p className={`font-medium text-xs ${isUnrealizedProfit ? "text-green-600" : "text-red-600"}`}>
                    {formatPercent(stock.unrealizedPnlPercent)}
                    <br />
                    <span className="text-xs">{mask(formatCurrency(convertValue(stock.unrealizedPnl), currency))}</span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">Net P/L</p>
                  <p className={`font-bold text-xs ${isNetProfit ? "text-green-600" : "text-red-600"}`}>
                    {formatPercent(stock.netPnlPercent)}
                    <br />
                    <span className="font-normal">{mask(formatCurrency(convertValue(stock.netPnl), currency))}</span>
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
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort("symbol")}>
                <div className="flex items-center gap-1">Stock <SortIcon field="symbol" /></div>
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort("units")}>
                <div className="flex items-center justify-end gap-1">Units <SortIcon field="units" /></div>
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort("avgPrice")}>
                <div className="flex items-center justify-end gap-1">Avg Price <SortIcon field="avgPrice" /></div>
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort("currentPrice")}>
                <div className="flex items-center justify-end gap-1">Current Price <SortIcon field="currentPrice" /></div>
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort("totalCost")}>
                <div className="flex items-center justify-end gap-1">Total Cost <SortIcon field="totalCost" /></div>
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort("currentValue")}>
                <div className="flex items-center justify-end gap-1">Current Value <SortIcon field="currentValue" /></div>
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort("unrealizedPnl")}>
                <div className="flex items-center justify-end gap-1">Unrealized P/L <SortIcon field="unrealizedPnl" /></div>
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort("realizedPnl")}>
                <div className="flex items-center justify-end gap-1">Realized P/L <SortIcon field="realizedPnl" /></div>
              </th>
              <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onClick={() => handleSort("netPnl")}>
                <div className="flex items-center justify-end gap-1">Net P/L <SortIcon field="netPnl" /></div>
              </th>
              <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-gray-100"></th>
            </tr>
          </thead>
          <tbody>
            {sortedStocks.map((stock) => {
              const isUnrealizedProfit = stock.unrealizedPnl >= 0;
              const isRealizedProfit = stock.realizedPnl >= 0;
              const isNetProfit = stock.netPnl >= 0;
              return (
                <tr
                  key={stock.symbol}
                  onClick={(e) => handleRowClick(stock.symbol, e)}
                  className="border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  title="Click to view stock details"
                >
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-3">
                      <StockLogo symbol={stock.symbol} size="md" />
                      <span>{stock.symbol}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{mask(formatNumber(stock.units, 7))}</td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{mask(formatCurrency(convertValue(stock.avgPrice), currency))}</td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{mask(formatCurrency(convertValue(stock.currentPrice), currency))}</td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{mask(formatCurrency(convertValue(stock.totalCost), currency))}</td>
                  <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{mask(formatCurrency(convertValue(stock.currentValue), currency))}</td>
                  <td className={`px-4 py-3 text-right font-medium ${isUnrealizedProfit ? "text-green-600" : "text-red-600"}`}>
                    {formatPercent(stock.unrealizedPnlPercent)}
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">{mask(formatCurrency(convertValue(stock.unrealizedPnl), currency))}</div>
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${isRealizedProfit ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(convertValue(stock.realizedPnl), currency)}
                  </td>
                  <td className={`px-4 py-3 text-right font-bold ${isNetProfit ? "text-green-600" : "text-red-600"}`}>
                    {formatPercent(stock.netPnlPercent)}
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">{mask(formatCurrency(convertValue(stock.netPnl), currency))}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/portfolio/edit/${stock.symbol}`}
                      className="inline-block rounded bg-blue-500 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      +/-
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
