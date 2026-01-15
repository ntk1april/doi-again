"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Transaction } from "@/types";
import { formatCurrency } from "@/lib/utils/calculations";
import StockLogo from "@/components/StockLogo";
import ProtectedRoute from "@/components/ProtectedRoute";
import { authFetch } from "@/lib/utils/auth-fetch";

type TimeFilter = "day" | "week" | "month" | "all";

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, timeFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await authFetch("/api/portfolio/transactions");
      const data = await response.json();

      if (data.success) {
        setTransactions(data.data || []);
      } else {
        setError(data.error || "Failed to load transactions");
      }
    } catch (err) {
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    if (timeFilter === "all") {
      setFilteredTransactions(transactions);
      return;
    }

    const now = new Date();
    const cutoffDate = new Date();

    switch (timeFilter) {
      case "day":
        cutoffDate.setDate(now.getDate() - 1);
        break;
      case "week":
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case "month":
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
    }

    const filtered = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= cutoffDate;
    });

    setFilteredTransactions(filtered);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFilterLabel = (filter: TimeFilter) => {
    switch (filter) {
      case "day":
        return "Last 24 Hours";
      case "week":
        return "Last 7 Days";
      case "month":
        return "Last 30 Days";
      case "all":
        return "All Time";
    }
  };

  const getTotalStats = () => {
    const buyTransactions = filteredTransactions.filter((t) => t.type === "BUY");
    const sellTransactions = filteredTransactions.filter((t) => t.type === "SELL");

    const totalBought = buyTransactions.reduce((sum, t) => sum + t.units * t.price, 0);
    const totalSold = sellTransactions.reduce((sum, t) => sum + t.units * t.price, 0);
    const totalRealizedPnl = sellTransactions.reduce((sum, t) => sum + (t.realizedPnl || 0), 0);

    return { totalBought, totalSold, totalRealizedPnl, buyCount: buyTransactions.length, sellCount: sellTransactions.length };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center text-gray-600">Loading transactions...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transaction History 📃</h1>
              <p className="mt-1 text-gray-600">View all your stock transactions</p>
            </div>
          </div>

          {/* Time Filter Buttons */}
          <div className="mb-6 flex gap-2">
            {(["day", "week", "month", "all"] as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`rounded-md px-4 py-2 font-medium transition-colors ${
                  timeFilter === filter
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                {getFilterLabel(filter)}
              </button>
            ))}
          </div>

          {/* Stats Summary */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm font-medium text-gray-600">Total Transactions</div>
              <div className="mt-1 text-2xl font-bold text-gray-900">
                {filteredTransactions.length}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm font-medium text-gray-600">Buy Orders</div>
              <div className="mt-1 text-2xl font-bold text-green-600">{stats.buyCount}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm font-medium text-gray-600">Sell Orders</div>
              <div className="mt-1 text-2xl font-bold text-red-600">{stats.sellCount}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm font-medium text-gray-600">Total Bought</div>
              <div className="mt-1 text-2xl font-bold text-gray-900">
                {formatCurrency(stats.totalBought)}
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm font-medium text-gray-600">Realized P/L</div>
              <div className={`mt-1 text-2xl font-bold ${stats.totalRealizedPnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(stats.totalRealizedPnl)}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Transactions Table */}
          {filteredTransactions.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
              <p className="text-gray-600">
                No transactions found for the selected time period.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Stock</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900">Type</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-900">Units</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-900">Price</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-900">Total</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-900">Realized P/L</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction, index) => {
                    const total = transaction.units * transaction.price;
                    const isBuy = transaction.type === "BUY";

                    return (
                      <tr
                        key={transaction._id || index}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        {/* Date */}
                        <td className="px-4 py-3 text-gray-700">
                          {formatDate(transaction.date)}
                        </td>

                        {/* Stock with Logo */}
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          <div className="flex items-center gap-3">
                            <StockLogo symbol={transaction.symbol} size="md" />
                            <span>{transaction.symbol}</span>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                              isBuy
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>

                        {/* Units */}
                        <td className="px-4 py-3 text-right text-gray-700">
                          {transaction.units}
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3 text-right text-gray-700">
                          {formatCurrency(transaction.price)}
                        </td>

                        {/* Total */}
                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                          {formatCurrency(total)}
                        </td>

                        {/* Realized P/L */}
                        <td className="px-4 py-3 text-right">
                          {transaction.realizedPnl !== undefined && transaction.realizedPnl !== 0 ? (
                            <span
                              className={`font-medium ${
                                transaction.realizedPnl >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {formatCurrency(transaction.realizedPnl)}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
