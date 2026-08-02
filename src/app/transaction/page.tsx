"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Transaction } from "@/types";
import { formatCurrency } from "@/lib/utils/calculations";
import StockLogo from "@/components/StockLogo";
import ProtectedRoute from "@/components/ProtectedRoute";
import { authFetch } from "@/lib/utils/auth-fetch";
import { Loader2, History, ShoppingBag, DollarSign, TrendingUp, TrendingDown, Clock, Layers } from "lucide-react";

type TimeFilter = "day" | "week" | "month" | "all";

export default function TransactionHistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
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
    const buyTransactions = filteredTransactions.filter(
      (t) => t.type === "BUY"
    );
    const sellTransactions = filteredTransactions.filter(
      (t) => t.type === "SELL"
    );

    const totalBought = buyTransactions.reduce(
      (sum, t) => sum + t.units * t.price,
      0
    );
    const totalSold = sellTransactions.reduce(
      (sum, t) => sum + t.units * t.price,
      0
    );
    const totalRealizedPnl = sellTransactions.reduce(
      (sum, t) => sum + (t.realizedPnl || 0),
      0
    );

    return {
      totalBought,
      totalSold,
      totalRealizedPnl,
      buyCount: buyTransactions.length,
      sellCount: sellTransactions.length,
    };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
            Loading transactions history...
          </span>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📜</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                Transaction History
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Audit log of all your historical BUY and SELL executions.
            </p>
          </div>

          {/* Time Filter Buttons */}
          <div className="mb-6 flex flex-wrap items-center gap-1.5 p-1.5 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200/60 dark:border-gray-700/60 w-fit">
            {(["day", "week", "month", "all"] as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  timeFilter === filter
                    ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                {getFilterLabel(filter)}
              </button>
            ))}
          </div>

          {/* Stats Summary */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Logs
                </span>
                <History className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                {filteredTransactions.length}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Buy Orders
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {stats.buyCount}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sell Orders
                </span>
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-red-600 dark:text-red-400">
                {stats.sellCount}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Capital
                </span>
                <ShoppingBag className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                {formatCurrency(stats.totalBought)}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 shadow-sm col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Realized P/L
                </span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <div
                className={`text-xl sm:text-2xl font-extrabold ${
                  stats.totalRealizedPnl >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {formatCurrency(stats.totalRealizedPnl)}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 dark:border-red-800/80 bg-red-50 dark:bg-red-950/50 p-4 text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Transactions Table */}
          {filteredTransactions.length === 0 ? (
            <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-12 text-center shadow-sm">
              <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400">
                No transactions found for the selected time period.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm">
              <table className="w-full text-xs sm:text-sm border-collapse">
                <thead className="border-b border-gray-200/80 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 select-none">
                  <tr>
                    <th className="px-4 py-3.5 text-left font-bold">Date & Time</th>
                    <th className="px-4 py-3.5 text-left font-bold">Stock</th>
                    <th className="px-4 py-3.5 text-center font-bold">Type</th>
                    <th className="px-4 py-3.5 text-right font-bold">Shares</th>
                    <th className="px-4 py-3.5 text-right font-bold">Execution Price</th>
                    <th className="px-4 py-3.5 text-right font-bold">Total Amount</th>
                    <th className="px-4 py-3.5 text-right font-bold">Realized P/L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredTransactions.map((transaction, index) => {
                    const total = transaction.units * transaction.price;
                    const isBuy = transaction.type === "BUY";

                    return (
                      <tr
                        key={transaction._id || index}
                        className="hover:bg-blue-50/50 dark:hover:bg-gray-800/80 transition-colors"
                      >
                        {/* Date */}
                        <td className="px-4 py-3.5 text-gray-600 dark:text-gray-400 font-medium">
                          {formatDate(transaction.date)}
                        </td>

                        {/* Stock with Logo */}
                        <td className="px-4 py-3.5 font-extrabold text-gray-900 dark:text-gray-100">
                          <div className="flex items-center gap-3">
                            <StockLogo symbol={transaction.symbol} size="md" />
                            <Link
                              href={`/stocks/${transaction.symbol}`}
                              className="hover:text-blue-500 transition-colors"
                            >
                              {transaction.symbol}
                            </Link>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider ${
                              isBuy
                                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/80"
                                : "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/80"
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>

                        {/* Shares */}
                        <td className="px-4 py-3.5 text-right font-bold text-gray-800 dark:text-gray-200">
                          {transaction.units}
                        </td>

                        {/* Execution Price */}
                        <td className="px-4 py-3.5 text-right font-bold text-gray-800 dark:text-gray-200">
                          {formatCurrency(transaction.price)}
                        </td>

                        {/* Total Amount */}
                        <td className="px-4 py-3.5 text-right font-extrabold text-gray-900 dark:text-gray-100">
                          {formatCurrency(total)}
                        </td>

                        {/* Realized P/L */}
                        <td className="px-4 py-3.5 text-right font-bold">
                          {transaction.realizedPnl !== undefined &&
                          transaction.realizedPnl !== 0 ? (
                            <span
                              className={
                                transaction.realizedPnl >= 0
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-red-600 dark:text-red-400"
                              }
                            >
                              {formatCurrency(transaction.realizedPnl)}
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">
                              —
                            </span>
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
