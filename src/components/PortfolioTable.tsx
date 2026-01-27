/**
 * PortfolioTable Component
 * Displays all stocks with columns: Symbol, Units, Avg Price, Current Price,
 * Total Cost, Market Value, Unrealized P/L, Realized P/L, Net P/L
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PortfolioTableFiled } from "@/types";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils/calculations";
import StockLogo from "./StockLogo";

interface Props {
  stocks: PortfolioTableFiled[];
  currency: "USD" | "THB";
  exchangeRate: number;
}

type SortField = "symbol" | "units" | "avgPrice" | "currentPrice" | "totalCost" | "currentValue" | "unrealizedPnl" | "realizedPnl" | "netPnl";
type SortDirection = "asc" | "desc";

export default function PortfolioTable({ stocks, currency, exchangeRate }: Props) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField>("symbol");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const convertValue = (value: number) => {
    return currency === "THB" ? value * exchangeRate : value;
  };

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
      setSortDirection("desc");
    }
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    if (!sortField) return 0;

    let comparison = 0;

    if (sortField === "symbol") {
      comparison = a.symbol.localeCompare(b.symbol);
    } else if (sortField === "units") {
      comparison = a.units - b.units;
    } else if (sortField === "avgPrice") {
      comparison = a.avgPrice - b.avgPrice;
    } else if (sortField === "currentPrice") {
      comparison = a.currentPrice - b.currentPrice;
    } else if (sortField === "totalCost") {
      comparison = a.totalCost - b.totalCost;
    } else if (sortField === "currentValue") {
      comparison = a.currentValue - b.currentValue;
    } else if (sortField === "unrealizedPnl") {
      comparison = a.unrealizedPnl - b.unrealizedPnl;
    } else if (sortField === "realizedPnl") {
      comparison = a.realizedPnl - b.realizedPnl;
    } else if (sortField === "netPnl") {
      comparison = a.netPnl - b.netPnl;
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
              <div className="flex items-center gap-1">
                Stock
                <SortIcon field="symbol" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-right font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort("units")}
            >
              <div className="flex items-center justify-end gap-1">
                Units
                <SortIcon field="units" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-right font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort("avgPrice")}
            >
              <div className="flex items-center justify-end gap-1">
                Avg Price
                <SortIcon field="avgPrice" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-right font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort("currentPrice")}
            >
              <div className="flex items-center justify-end gap-1">
                Current Price
                <SortIcon field="currentPrice" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-right font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort("totalCost")}
            >
              <div className="flex items-center justify-end gap-1">
                Total Cost
                <SortIcon field="totalCost" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-right font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort("currentValue")}
            >
              <div className="flex items-center justify-end gap-1">
                Current Value
                <SortIcon field="currentValue" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-right font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort("unrealizedPnl")}
            >
              <div className="flex items-center justify-end gap-1">
                Unrealized P/L
                <SortIcon field="unrealizedPnl" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-right font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort("realizedPnl")}
            >
              <div className="flex items-center justify-end gap-1">
                Realized P/L
                <SortIcon field="realizedPnl" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-right font-semibold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort("netPnl")}
            >
              <div className="flex items-center justify-end gap-1">
                Net P/L
                <SortIcon field="netPnl" />
              </div>
            </th>
            <th className="px-4 py-3 text-center font-semibold text-gray-900"></th>
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
                  {formatNumber(stock.units, 7)}
                </td>

                {/* Avg Price */}
                <td className="px-4 py-3 text-right text-gray-700">
                  {formatNumber(stock.avgPrice, 4)}
                </td>

                {/* Current Price */}
                <td className="px-4 py-3 text-right text-gray-700">
                  {formatCurrency(convertValue(stock.currentPrice), currency)}
                </td>

                {/* Total Cost */}
                <td className="px-4 py-3 text-right text-gray-700">
                  {formatCurrency(convertValue(stock.totalCost), currency)}
                </td>

                {/* Current Value */}
                <td className="px-4 py-3 text-right text-gray-700">
                  {formatCurrency(convertValue(stock.currentValue), currency)}
                </td>

                {/* Unrealized P/L */}
                <td
                  className={`px-4 py-3 text-right font-medium ${isUnrealizedProfit ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {formatCurrency(convertValue(stock.unrealizedPnl), currency)}
                  <div className="text-xs text-gray-500 font-normal">
                    {formatPercent(stock.unrealizedPnlPercent)}
                  </div>
                </td>

                {/* Realized P/L */}
                <td
                  className={`px-4 py-3 text-right font-medium ${isRealizedProfit ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {formatCurrency(convertValue(stock.realizedPnl), currency)}
                </td>

                {/* Net P/L */}
                <td
                  className={`px-4 py-3 text-right font-bold ${isNetProfit ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {formatCurrency(convertValue(stock.netPnl), currency)}
                  <div className="text-xs text-gray-500 font-normal">
                    {formatPercent(stock.netPnlPercent)}
                  </div>
                </td>

                {/* Actions */}
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
  );
}
