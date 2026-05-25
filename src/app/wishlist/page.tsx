"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import StockLogo from "@/components/StockLogo";
import { authFetch } from "@/lib/utils/auth-fetch";
import Swal from "sweetalert2";

interface WishlistItem {
  _id: string;
  symbol: string;
  notes: string;
  targetPrice?: number;
  addedAt: Date;
}

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  isMarketOpen: boolean;
  marketStatus: string; // "pre-market", "regular", "after-hours", "closed"
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [prices, setPrices] = useState<Map<string, StockPrice>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState<
    "symbol" | "price" | "change" | "date"
  >("symbol");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const router = useRouter();

  useEffect(() => {
    fetchWishlist();
  }, []);

  useEffect(() => {
    if (wishlist.length > 0) {
      fetchPrices();
      // Refresh prices every 30 seconds
      const interval = setInterval(fetchPrices, 30000);
      return () => clearInterval(interval);
    }
  }, [wishlist]);

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      const response = await authFetch("/api/wishlist");
      const data = await response.json();

      if (data.success) {
        setWishlist(data.data || []);
      } else {
        setError(data.error || "Failed to load wishlist");
      }
    } catch (err) {
      setError("Failed to load wishlist");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrices = async () => {
    try {
      const symbols = wishlist.map((item) => item.symbol);
      const pricePromises = symbols.map(async (symbol) => {
        try {
          const response = await fetch(`/api/stock-price?symbol=${symbol}`);
          const data = await response.json();
          if (data.success && data.data) {
            return { symbol, data: data.data };
          }
          return null;
        } catch {
          return null;
        }
      });

      const results = await Promise.all(pricePromises);
      const newPrices = new Map<string, StockPrice>();

      results.forEach((result) => {
        if (result) {
          newPrices.set(result.symbol, result.data);
        }
      });

      setPrices(newPrices);
    } catch (err) {
      console.error("Error fetching prices:", err);
    }
  };

  const handleSort = (field: "symbol" | "price" | "change" | "date") => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "symbol" || field === "date" ? "asc" : "desc");
    }
  };

  const sortedWishlist = useMemo(() => {
    return [...wishlist].sort((a, b) => {
      let cmp = 0;
      if (sortField === "symbol") {
        cmp = a.symbol.localeCompare(b.symbol);
      } else if (sortField === "date") {
        cmp = new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      } else if (sortField === "price") {
        const pa = prices.get(a.symbol)?.price ?? -Infinity;
        const pb = prices.get(b.symbol)?.price ?? -Infinity;
        cmp = pa - pb;
      } else if (sortField === "change") {
        const ca = prices.get(a.symbol)?.changePercent ?? -Infinity;
        const cb = prices.get(b.symbol)?.changePercent ?? -Infinity;
        cmp = ca - cb;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [wishlist, prices, sortField, sortDir]);

  const getMarketStatusBadge = (status: string) => {
    const badges = {
      "pre-market": { text: "Pre-Market", color: "bg-blue-100 text-blue-700" },
      regular: { text: "Market Open", color: "bg-green-100 text-green-700" },
      "after-hours": {
        text: "After Hours",
        color: "bg-purple-100 text-purple-700",
      },
      closed: { text: "Market Closed", color: "bg-gray-100 text-gray-700" },
    };

    const badge = badges[status as keyof typeof badges] || badges.closed;

    return (
      <span
        className={`text-xs px-2 py-1 rounded-full font-medium ${badge.color}`}
      >
        {badge.text}
      </span>
    );
  };

  const handleRemove = async (symbol: string) => {
    const result = await Swal.fire({
      title: `Remove ${symbol} from wishlist?`,
      text: `Are you sure you want to remove ${symbol} from your wishlist?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบแม่งเลย",
      cancelButtonText: "เก็บไว้ก่อน ตัวนี้น่าสน",
      confirmButtonColor: "#F93827",
      cancelButtonColor: "#16C47F",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await authFetch(`/api/wishlist/${symbol}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          title: `${symbol} removed from wishlist!`,
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
        });
        fetchWishlist();
      } else {
        Swal.fire({
          title: "Failed to remove from wishlist",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Failed to remove from wishlist",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Wishlist ⭐</h1>
            <p className="mt-2 text-gray-600">
              Stocks you're interested in. Use the search bar above to add more
              stocks.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading wishlist...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && wishlist.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <div className="mb-4">
                <span className="text-6xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Your wishlist is empty
              </h3>
              <p className="text-gray-600 mb-4">
                Use the search bar above to find and add stocks you're
                interested in
              </p>
              <p className="text-sm text-gray-500">
                💡 Tip: Search for a stock, then click "Add to Wishlist" from
                the actions menu
              </p>
            </div>
          )}

          {/* Wishlist Grid */}
          {!isLoading && wishlist.length > 0 && (
            <>
              {/* Sort Controls */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-600 mr-1">
                  Sort by:
                </span>
                {(
                  [
                    { key: "symbol", label: "Symbol" },
                    { key: "price", label: "Price" },
                    { key: "change", label: "Change %" },
                    { key: "date", label: "Date Added" },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => handleSort(key)}
                    className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium border transition-all ${
                      sortField === key
                        ? "bg-blue-500 text-white border-blue-500 shadow-sm"
                        : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
                    }`}
                  >
                    {label}
                    {sortField === key && (
                      <span className="text-xs">
                        {sortDir === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sortedWishlist.map((item) => {
                  const priceData = prices.get(item.symbol);

                  return (
                    <div
                      key={item._id}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Market Status Badge - Top Right */}
                      {priceData && (
                        <div className="flex justify-end mb-2">
                          {getMarketStatusBadge(priceData.marketStatus)}
                        </div>
                      )}

                      {/* Stock Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <StockLogo symbol={item.symbol} size="lg" />
                          <h3 className="text-xl font-bold text-gray-900">
                            {item.symbol}
                          </h3>
                        </div>
                      </div>

                      {/* Current Price */}
                      {priceData ? (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">Current Price</p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-gray-900">
                              ${priceData.price.toFixed(2)}
                            </p>
                            <p
                              className={`text-sm font-semibold ${priceData.change >= 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {priceData.change >= 0 ? "+" : ""}
                              {priceData.change.toFixed(2)} (
                              {priceData.changePercent.toFixed(2)}%)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4">
                          <p className="text-sm text-gray-400">
                            Loading price...
                          </p>
                        </div>
                      )}

                      {/* Added Date */}
                      <div className="mb-4 text-xs text-gray-500">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link
                          href={`/stocks/${item.symbol}`}
                          className="flex-1 rounded-md bg-blue-500 px-4 py-2 text-center font-medium text-white hover:bg-blue-700"
                        >
                          🔍 View Details
                        </Link>
                        <button
                          onClick={() => handleRemove(item.symbol)}
                          className="rounded-md border border-red-500 px-4 py-2 font-medium text-red-500 hover:bg-red-10rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
