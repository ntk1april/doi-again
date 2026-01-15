/**
 * PortfolioTable Component
 * Displays all stocks with columns: Symbol, Units, Avg Price, Current Price,
 * Total Cost, Market Value, Unrealized P/L, Realized P/L, Net P/L
 */

"use client";

import Link from "next/link";
import { EnhancedStock } from "@/types";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/utils/calculations";
import StockLogo from "./StockLogo";

interface Props {
  stocks: EnhancedStock[];
}

export default function PortfolioTable({ stocks }: Props) {
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

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">Stock</th>
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
          {stocks.map((stock) => {
            const isUnrealizedProfit = stock.unrealizedPnl >= 0;
            const isRealizedProfit = stock.realizedPnl >= 0;
            const isNetProfit = stock.netPnl >= 0;

            return (
              <tr
                key={stock.symbol}
                className="border-b border-gray-100 hover:bg-gray-50"
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
