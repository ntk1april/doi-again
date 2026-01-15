/**
 * Edit Stock Page
 * Allow buying more or selling a stock
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { PortfolioStock, ApiResponse, EnhancedStock } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils/calculations";
import StockForm, { FormData } from "@/components/StockForm";
import StockLogo from "@/components/StockLogo";
import ProtectedRoute from "@/components/ProtectedRoute";
import { authFetch } from "@/lib/utils/auth-fetch";

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

      // Fetch from portfolio API to get enriched stock data with current price
      const portfolioResponse = await authFetch("/api/portfolio/stocks");
      const portfolioData: ApiResponse = await portfolioResponse.json();

      if (!portfolioData.success) {
        throw new Error("Failed to fetch portfolio data");
      }

      // Find the specific stock from the portfolio
      const portfolioStocks = portfolioData.data?.stocks || [];
      const enrichedStock = portfolioStocks.find(
        (s: any) => s.symbol === symbol
      );

      if (!enrichedStock) {
        throw new Error("Stock not found in portfolio");
      }

      // Set stock data (base portfolio stock)
      setStock({
        symbol: enrichedStock.symbol,
        units: enrichedStock.units,
        avgPrice: enrichedStock.avgPrice,
        realizedPnl: enrichedStock.realizedPnl,
        createdAt: enrichedStock.createdAt,
        updatedAt: enrichedStock.updatedAt,
      });

      // Set current price from the enriched data (already calculated by API)
      setCurrentPrice(enrichedStock.currentPrice);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stock");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
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
        throw new Error(data.error || `Failed to ${action.toLowerCase()} stock`);
      }

      if (action === "SELL" && !stock?.units) {
        setSuccessMessage("Stock completely sold and removed from portfolio!");
      } else {
        setSuccessMessage(`Successfully ${action.toLowerCase()}ed ${formData.units} units!`);
      }

      // Refresh and redirect after 2 seconds
      setTimeout(() => {
        router.push("/portfolio");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center py-12">
            <p className="text-gray-600">Loading stock details...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!stock) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error || "Stock not found"}
            </div>
            <div className="mt-4 text-center">
              <Link href="/portfolio" className="text-blue-600 hover:underline">
                Back to Portfolio
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Buy/Sell {stock.symbol}</h1>
            <p className="mt-2 text-gray-600">Buy more or sell this stock</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Stock Details Card */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Current Data</h2>
                <StockLogo symbol={stock.symbol} size="lg" />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Symbol:</span>
                  <span className="font-semibold text-gray-900">{stock.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Units:</span>
                  <span className="font-semibold text-gray-900">
                    {formatNumber(stock.units, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Price:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(stock.avgPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Price:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(currentPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Cost:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(stock.avgPrice * stock.units)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Value:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(currentPrice * stock.units)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Realized P/L:</span>
                  <span
                    className={`font-semibold ${
                      stock.realizedPnl >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(stock.realizedPnl)}
                  </span>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              {/* Action Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Action
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="BUY"
                      checked={action === "BUY"}
                      onChange={(e) => setAction(e.target.value as "BUY" | "SELL")}
                      disabled={isSubmitting}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Buy More</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="SELL"
                      checked={action === "SELL"}
                      onChange={(e) => setAction(e.target.value as "BUY" | "SELL")}
                      disabled={isSubmitting}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Sell</span>
                  </label>
                </div>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  {successMessage}
                  <p className="mt-2 text-xs text-gray-600">Redirecting to portfolio...</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Form */}
              <StockForm
                onSubmit={handleSubmit}
                isLoading={isSubmitting}
                initialSymbol={stock.symbol}
                readOnlySymbol
                submitLabel={action === "BUY" ? "Buy" : "Sell"}
              >
                {action === "SELL" && (
                  <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 mb-4">
                    Maximum units available: {formatNumber(stock.units, 0)}
                  </div>
                )}
              </StockForm>

              {/* Back Link */}
              <div className="mt-4 text-center">
                <Link href="/portfolio" className="text-sm text-blue-600 hover:underline">
                  Back to Portfolio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
