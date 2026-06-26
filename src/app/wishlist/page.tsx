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
  const [viewMode, setViewMode] = useState<"card" | "table">(() => {
    if (typeof window !== "undefined") {
      return (
        (localStorage.getItem("wishlist-view") as "card" | "table") || "table"
      );
    }
    return "table";
  });
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

  const toggleView = (mode: "card" | "table") => {
    setViewMode(mode);
    localStorage.setItem("wishlist-view", mode);
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

          {/* Wishlist Content */}
          {!isLoading && wishlist.length > 0 && (
            <>
              {/* Sort + View Toggle Controls */}
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

                {/* View Toggle */}
                <div className="ml-auto flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
                  <button
                    onClick={() => toggleView("card")}
                    title="Card view"
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                      viewMode === "card"
                        ? "bg-blue-500 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <rect x="3" y="3" width="8" height="8" rx="1.5" />
                      <rect x="13" y="3" width="8" height="8" rx="1.5" />
                      <rect x="3" y="13" width="8" height="8" rx="1.5" />
                      <rect x="13" y="13" width="8" height="8" rx="1.5" />
                    </svg>
                    Cards
                  </button>
                  <button
                    onClick={() => toggleView("table")}
                    title="Table view"
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                      viewMode === "table"
                        ? "bg-blue-500 text-white shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z" />
                    </svg>
                    Table
                  </button>
                </div>
              </div>

              {/* ── Card View ── */}
              {viewMode === "card" && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {sortedWishlist.map((item) => {
                    const priceData = prices.get(item.symbol);
                    return (
                      <div
                        key={item._id}
                        className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                      >
                        {priceData && (
                          <div className="flex justify-end mb-2">
                            {getMarketStatusBadge(priceData.marketStatus)}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mb-4">
                          <StockLogo symbol={item.symbol} size="lg" />
                          <h3 className="text-xl font-bold text-gray-900">
                            {item.symbol}
                          </h3>
                        </div>
                        {priceData ? (
                          <div className="mb-4">
                            <p className="text-sm text-gray-600">
                              Current Price
                            </p>
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
                        <div className="mb-4 text-xs text-gray-500">
                          Added {new Date(item.addedAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/stocks/${item.symbol}`}
                            className="flex-1 rounded-md bg-blue-500 px-4 py-2 text-center font-medium text-white hover:bg-blue-700"
                          >
                            🔍 View Details
                          </Link>
                          <button
                            onClick={() => handleRemove(item.symbol)}
                            className="rounded-md border border-red-500 px-4 py-2 font-medium text-red-500 hover:bg-red-50"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Table View ── */}
              {viewMode === "table" && (
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">
                          Stock
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-900">
                          Price
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-900">
                          Change
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-900">
                          Change %
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-900">
                          Added
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedWishlist.map((item) => {
                        const priceData = prices.get(item.symbol);
                        const isUp = (priceData?.change ?? 0) >= 0;
                        return (
                          <tr
                            key={item._id}
                            className="border-b border-gray-100 hover:bg-blue-50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <StockLogo symbol={item.symbol} size="md" />
                                <Link
                                  href={`/stocks/${item.symbol}`}
                                  className="font-semibold text-gray-900 hover:text-blue-600"
                                >
                                  {item.symbol}
                                </Link>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-gray-900">
                              {priceData ? (
                                `$${priceData.price.toFixed(2)}`
                              ) : (
                                <span className="text-gray-400 text-xs">
                                  Loading…
                                </span>
                              )}
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-medium ${isUp ? "text-green-600" : "text-red-600"}`}
                            >
                              {priceData
                                ? `${isUp ? "+" : ""}${priceData.change.toFixed(2)}`
                                : "—"}
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-medium ${isUp ? "text-green-600" : "text-red-600"}`}
                            >
                              {priceData
                                ? `${isUp ? "+" : ""}${priceData.changePercent.toFixed(2)}%`
                                : "—"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {priceData
                                ? getMarketStatusBadge(priceData.marketStatus)
                                : "—"}
                            </td>
                            <td className="px-4 py-3 text-right text-xs text-gray-500">
                              {new Date(item.addedAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <Link
                                  href={`/stocks/${item.symbol}`}
                                  className="rounded bg-blue-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
                                >
                                  Details
                                </Link>
                                <button
                                  onClick={() => handleRemove(item.symbol)}
                                  className="rounded border border-red-400 px-2.5 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                                >
                                  Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
