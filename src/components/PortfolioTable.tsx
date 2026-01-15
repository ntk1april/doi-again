/**
 * PortfolioTable Component
 * Displays all stocks with columns: Symbol, Units, Avg Price, Current Price,
 * Total Cost, Market Value, Unrealized P/L, Realized P/L, Net P/L
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EnhancedStock } from "@/types";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils/calculations";
import StockLogo from "./StockLogo";

interface Props {
  stocks: EnhancedStock[];
}

type SortField = "symbol" | "date" | null;
type SortDirection = "asc" | "desc";

export default function PortfolioTable({ stocks }: Props) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  if (stocks.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <p className="text-gray-600">
          No stocks in portfolio yet.{" "}
          <Link href="/portfolio/add" className="font-medium text-blue-600 hover:underline">
            Add your first stock
          </Link>
        </p>
      </div>
    );
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field with ascending order
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    if (!sortField) return 0;

    let comparison = 0;

    if (sortField === "symbol") {
      comparison = a.symbol.localeCompare(b.symbol);
    } else if (sortField === "date") {
      // Assuming stocks have a createdAt or similar field
      // If not available, we'll sort by symbol as fallback
      comparison = a.symbol.localeCompare(b.symbol);
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="ml-1 text-gray-400">⇅</span>;
    }
    return (
      <span className="ml-1 text-blue-600">
        {sortDirection === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  const handleRowClick = (symbol: string, e: React.MouseEvent) => {
    // Don't navigate if clicking on the Buy/Sell button
    const target = e.target as HTMLElement;
    if (target.closest("a")) {
      return;
    }
    router.push(`/stocks/${symbol}`);
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th 
              className="px-4 py-3 text-left font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort("symbol")}
            >
              <div className="flex items-center">
                Stock
                <SortIcon field="symbol" />
              </div>
            </th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900">Units</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900">Avg Price</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900">Current Price</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900">Total Cost</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900">Current Value</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900">Unrealized P/L</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900">Realized P/L</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-900">Net P/L</th>
            <th className="px-4 py-3 text-center font-semibold text-gray-900">Actions</th>
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
                className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                title="Click to view stock details"
              >
                {/* Symbol with Logo */}
                <td className="px-4 py-3 font-semibold text-gray-900">
                  <div className="flex items-center gap-3">
                    <StockLogo symbol={stock.symbol} size="md" />
                    <span>{stock.symbol}</span>
                  </div>
                </td>

                {/* Units */}
                <td className="px-4 py-3 text-right text-gray-700">
                  {formatNumber(stock.units, 0)}
                </td>

                {/* Avg Price */}
                <td className="px-4 py-3 text-right text-gray-700">
                  {formatCurrency(stock.avgPrice)}
                </td>

                {/* Current Price */}
                <td className="px-4 py-3 text-right text-gray-700">
                  {formatCurrency(stock.currentPrice)}
                </td>

                {/* Total Cost */}
                <td className="px-4 py-3 text-right text-gray-700">
                  {formatCurrency(stock.totalCost)}
                </td>

                {/* Current Value */}
                <td className="px-4 py-3 text-right text-gray-700">
                  {formatCurrency(stock.currentValue)}
                </td>

                {/* Unrealized P/L */}
                <td
                  className={`px-4 py-3 text-right font-medium ${
                    isUnrealizedProfit ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(stock.unrealizedPnl)}
                  <div className="text-xs text-gray-500 font-normal">
                    {formatPercent(stock.unrealizedPnlPercent)}
                  </div>
                </td>

                {/* Realized P/L */}
                <td
                  className={`px-4 py-3 text-right font-medium ${
                    isRealizedProfit ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(stock.realizedPnl)}
                </td>

                {/* Net P/L */}
                <td
                  className={`px-4 py-3 text-right font-bold ${
                    isNetProfit ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(stock.netPnl)}
                  <div className="text-xs text-gray-500 font-normal">
                    {formatPercent(stock.netPnlPercent)}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-center">
                  <Link
                    href={`/portfolio/edit/${stock.symbol}`}
                    className="inline-block rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Buy/Sell
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
