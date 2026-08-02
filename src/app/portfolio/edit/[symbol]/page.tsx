/**
 * Edit Stock Page
 * Allow buying more or selling a stock
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { PortfolioStock, ApiResponse } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils/calculations";
import StockForm, { FormData } from "@/components/AddStockForm";
import StockLogo from "@/components/StockLogo";
import ProtectedRoute from "@/components/ProtectedRoute";
import { authFetch } from "@/lib/utils/auth-fetch";
import Swal from "sweetalert2";
import { ArrowLeft, Loader2, CheckCircle2, TrendingUp, TrendingDown, Info } from "lucide-react";

export default function EditStockPage() {
  const router = useRouter();
  const params = useParams();
  const symbol = (params.symbol as string)?.toUpperCase();

  const [stock, setStock] = useState<PortfolioStock | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [action, setAction] = useState<"BUY" | "SELL">("BUY");

  useEffect(() => {
    if (symbol) {
      fetchStock();
    }
  }, [symbol]);

  const fetchStock = async () => {
    try {
      setIsLoading(true);
      setError("");

      const portfolioResponse = await authFetch("/api/portfolio/stocks");
      const portfolioData: ApiResponse = await portfolioResponse.json();

      if (!portfolioData.success) {
        throw new Error("Failed to fetch portfolio data");
      }

      const portfolioStocks = portfolioData.data?.stocks || [];
      const enrichedStock = portfolioStocks.find(
        (s: any) => s.symbol === symbol
      );

      if (!enrichedStock) {
        throw new Error("Stock not found in portfolio");
      }

      setStock({
        symbol: enrichedStock.symbol,
        units: enrichedStock.units,
        avgPrice: enrichedStock.avgPrice,
        realizedPnl: enrichedStock.realizedPnl,
        createdAt: enrichedStock.createdAt,
        updatedAt: enrichedStock.updatedAt,
      });

      setCurrentPrice(enrichedStock.currentPrice);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stock");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    const isBuy = action === "BUY";
    const result = await Swal.fire({
      title: `${isBuy ? "Buy More" : "Sell"} ${symbol}?`,
      text: `You are about to ${action.toLowerCase()} ${formData.units} shares of ${symbol} at $${formData.price} each!`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Yes, ${action.toLowerCase()} position`,
      cancelButtonText: "Cancel",
      confirmButtonColor: isBuy ? "#10B981" : "#EF4444",
      cancelButtonColor: "#6B7280",
    });

    if (result.isConfirmed) {
      try {
        setIsSubmitting(true);
        setSuccessMessage("");
        setError("");

        const response = await authFetch(`/api/portfolio/stocks/${symbol}`, {
          method: "PUT",
          body: JSON.stringify({
            action,
            units: formData.units,
            price: formData.price,
          }),
        });

        const data: ApiResponse = await response.json();

        if (!data.success) {
          Swal.fire({
            title: `Failed to ${action.toLowerCase()} stock`,
            text: data.error,
            icon: "error",
            confirmButtonText: "OK",
          });
          return;
        }

        if (action === "SELL" && !stock?.units) {
          setSuccessMessage(
            "Stock position completely sold and removed from portfolio!"
          );
        } else {
          setSuccessMessage(
            `Successfully ${action.toLowerCase()}ed ${formData.units} shares of ${symbol}!`
          );
        }

        setTimeout(() => {
          router.push("/portfolio");
        }, 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
            Loading position details...
          </span>
        </div>
      </ProtectedRoute>
    );
  }

  if (!stock) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-12 px-4 flex items-center justify-center">
          <div className="w-full max-w-md text-center">
            <div className="rounded-3xl border border-red-200 dark:border-red-800/80 bg-red-50 dark:bg-red-950/50 p-6 text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300 shadow-sm mb-4">
              {error || "Stock position not found in portfolio"}
            </div>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portfolio</span>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <StockLogo symbol={stock.symbol} size="lg" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                  Trade {stock.symbol}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Execute buy or sell orders for your active holding.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Stock Current Holding Card */}
            <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-4">
                  Current Position Summary
                </span>

                <div className="space-y-3.5 text-xs sm:text-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="font-semibold text-gray-500 dark:text-gray-400">
                      Symbol
                    </span>
                    <span className="font-extrabold text-gray-900 dark:text-gray-100">
                      {stock.symbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="font-semibold text-gray-500 dark:text-gray-400">
                      Shares Owned
                    </span>
                    <span className="font-extrabold text-gray-900 dark:text-gray-100">
                      {formatNumber(stock.units, 7)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="font-semibold text-gray-500 dark:text-gray-400">
                      Average Price
                    </span>
                    <span className="font-extrabold text-gray-900 dark:text-gray-100">
                      ${formatNumber(stock.avgPrice, 4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="font-semibold text-gray-500 dark:text-gray-400">
                      Current Price
                    </span>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">
                      {formatCurrency(currentPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="font-semibold text-gray-500 dark:text-gray-400">
                      Total Capital Cost
                    </span>
                    <span className="font-extrabold text-gray-900 dark:text-gray-100">
                      {formatCurrency(stock.avgPrice * stock.units)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                    <span className="font-semibold text-gray-500 dark:text-gray-400">
                      Current Value
                    </span>
                    <span className="font-extrabold text-gray-900 dark:text-gray-100">
                      {formatCurrency(currentPrice * stock.units)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-500 dark:text-gray-400">
                      Realized P/L
                    </span>
                    <span
                      className={`font-extrabold ${
                        stock.realizedPnl >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {formatCurrency(stock.realizedPnl)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 shadow-sm">
              {/* Action Selector Pills */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Order Action
                </label>
                <div className="flex p-1 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200/60 dark:border-gray-700/60">
                  <button
                    type="button"
                    onClick={() => setAction("BUY")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                      action === "BUY"
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Buy More</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAction("SELL")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                      action === "SELL"
                        ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Sell Position</span>
                  </button>
                </div>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span>{successMessage}</span>
                    <p className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Redirecting to portfolio...
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3.5 rounded-2xl border border-red-200 dark:border-red-800/80 bg-red-50 dark:bg-red-950/50 text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              {/* Form */}
              <StockForm
                onSubmit={handleSubmit}
                isLoading={isSubmitting}
                initialSymbol={stock.symbol}
                readOnlySymbol
                submitLabel={action === "BUY" ? "Execute Buy" : "Execute Sell"}
              >
                {action === "SELL" && (
                  <div className="flex items-center gap-2 rounded-2xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/60 dark:bg-blue-950/40 p-3 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-4">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>Available to sell: {formatNumber(stock.units, 7)} shares</span>
                  </div>
                )}
              </StockForm>

              {/* Back Link */}
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
                <Link
                  href="/portfolio"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Portfolio</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
