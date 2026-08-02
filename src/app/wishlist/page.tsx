"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import StockLogo from "@/components/StockLogo";
import { authFetch } from "@/lib/utils/auth-fetch";
import {
  Loader2,
  Bookmark,
  Search,
  Trash2,
  Edit3,
  ExternalLink,
  Target,
  FileText,
  Save,
  X,
  LayoutGrid,
  Table,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
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

  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editTargetPrice, setEditTargetPrice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchWishlist();
  }, []);

  useEffect(() => {
    if (wishlist.length > 0) {
      fetchPrices();
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
      "pre-market": {
        text: "Pre-Market",
        color:
          "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
      },
      regular: {
        text: "Market Open",
        color:
          "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
      },
      "after-hours": {
        text: "After Hours",
        color:
          "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800",
      },
      closed: {
        text: "Closed",
        color:
          "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700",
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.closed;

    return (
      <span
        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${badge.color}`}
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
      confirmButtonText: "Remove",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#10B981",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await authFetch(`/api/wishlist/${symbol}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        fetchWishlist();
      } else {
        setError(data.error || "Failed to remove item");
      }
    } catch (err) {
      setError("Failed to remove item");
    }
  };

  const handleEditDetails = (item: WishlistItem) => {
    setEditingItem(item);
    setEditNotes(item.notes || "");
    setEditTargetPrice(item.targetPrice ? item.targetPrice.toString() : "");
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    setIsSaving(true);
    try {
      const response = await authFetch(`/api/wishlist/${editingItem.symbol}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: editNotes,
          targetPrice: editTargetPrice ? Number(editTargetPrice) : null,
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchWishlist();
        setEditingItem(null);
      } else {
        setError(data.error || "Failed to update");
      }
    } catch (err) {
      setError("Failed to update wishlist");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔖</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                Wishlist & Watchlist
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Track stocks you&apos;re watching, set target prices, and add custom notes.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 dark:border-red-800/80 bg-red-50 dark:bg-red-950/50 p-4 text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                Loading wishlist...
              </span>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && wishlist.length === 0 && (
            <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-12 text-center shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-500 text-2xl mx-auto mb-4">
                ⭐
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 mb-1">
                Your Wishlist is Empty
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                Use the search bar in the top navigation to search for any stock and click &ldquo;Add to Wishlist&rdquo;.
              </p>
            </div>
          )}

          {/* Wishlist Content */}
          {!isLoading && wishlist.length > 0 && (
            <>
              {/* Sort + View Toggle Controls */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-2 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200/60 dark:border-gray-700/60">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400 px-2 uppercase tracking-wider">
                    Sort:
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
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                        sortField === key
                          ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-md"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                      }`}
                    >
                      <span>{label}</span>
                      {sortField === key && (
                        <span className="text-[10px]">
                          {sortDir === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-white/80 dark:bg-gray-900/80 p-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                  <button
                    onClick={() => toggleView("card")}
                    title="Card view"
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      viewMode === "card"
                        ? "bg-blue-500 text-white shadow-md"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Cards</span>
                  </button>
                  <button
                    onClick={() => toggleView("table")}
                    title="Table view"
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      viewMode === "table"
                        ? "bg-blue-500 text-white shadow-md"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Table</span>
                  </button>
                </div>
              </div>

              {/* ── Card View ── */}
              {viewMode === "card" && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {sortedWishlist.map((item) => {
                    const priceData = prices.get(item.symbol);
                    const isUp = (priceData?.change ?? 0) >= 0;

                    return (
                      <div
                        key={item._id}
                        className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <StockLogo symbol={item.symbol} size="md" />
                              <Link
                                href={`/stocks/${item.symbol}`}
                                className="font-extrabold text-gray-900 dark:text-gray-100 text-lg hover:text-blue-500 transition-colors"
                              >
                                {item.symbol}
                              </Link>
                            </div>
                            {priceData && (
                              <div>{getMarketStatusBadge(priceData.marketStatus)}</div>
                            )}
                          </div>

                          {/* Price */}
                          {priceData ? (
                            <div className="mb-4 bg-gray-50/50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                              <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
                                Current Price
                              </p>
                              <div className="flex items-baseline justify-between">
                                <span className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                                  ${priceData.price.toFixed(2)}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 text-xs font-bold ${
                                    isUp
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-red-600 dark:text-red-400"
                                  }`}
                                >
                                  {isUp ? (
                                    <TrendingUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <TrendingDown className="w-3.5 h-3.5" />
                                  )}
                                  <span>
                                    {isUp ? "+" : ""}
                                    {priceData.change.toFixed(2)} (
                                    {priceData.changePercent.toFixed(2)}%)
                                  </span>
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="mb-4 py-3 text-center">
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400 mx-auto" />
                            </div>
                          )}

                          {/* Target Price & Notes Badges */}
                          {(item.notes || item.targetPrice) && (
                            <div className="mb-4 p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800/60 space-y-1 text-xs">
                              {item.targetPrice && (
                                <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-300">
                                  <Target className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Target Price: ${item.targetPrice.toFixed(2)}</span>
                                </div>
                              )}
                              {item.notes && (
                                <div className="text-gray-600 dark:text-gray-300 italic">
                                  &ldquo;{item.notes}&rdquo;
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Card Footer Actions */}
                        <div className="pt-2 flex items-center gap-2 border-t border-gray-100 dark:border-gray-800">
                          <button
                            onClick={() => handleEditDetails(item)}
                            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                            title="Edit notes & target"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/stocks/${item.symbol}`}
                            className="flex-1 py-2 px-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs text-center shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1"
                          >
                            <span>Details</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleRemove(item.symbol)}
                            className="p-2.5 rounded-xl border border-red-200 dark:border-red-800/80 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/80 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Table View ── */}
              {viewMode === "table" && (
                <div className="overflow-x-auto rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm">
                  <table className="w-full text-xs sm:text-sm border-collapse">
                    <thead className="border-b border-gray-200/80 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 select-none">
                      <tr>
                        <th className="px-4 py-3.5 text-left font-bold">Stock</th>
                        <th className="px-4 py-3.5 text-right font-bold">Price</th>
                        <th className="px-4 py-3.5 text-right font-bold">Change</th>
                        <th className="px-4 py-3.5 text-right font-bold">Change %</th>
                        <th className="px-4 py-3.5 text-right font-bold">Target</th>
                        <th className="px-4 py-3.5 text-center font-bold">Status</th>
                        <th className="px-4 py-3.5 text-center font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {sortedWishlist.map((item) => {
                        const priceData = prices.get(item.symbol);
                        const isUp = (priceData?.change ?? 0) >= 0;
                        return (
                          <tr
                            key={item._id}
                            className="hover:bg-blue-50/50 dark:hover:bg-gray-800/80 transition-colors"
                          >
                            <td className="px-4 py-3.5 font-extrabold text-gray-900 dark:text-gray-100">
                              <div className="flex items-center gap-3">
                                <StockLogo symbol={item.symbol} size="md" />
                                <Link
                                  href={`/stocks/${item.symbol}`}
                                  className="hover:text-blue-500 transition-colors"
                                >
                                  {item.symbol}
                                </Link>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-right font-bold text-gray-900 dark:text-gray-100">
                              {priceData ? (
                                `$${priceData.price.toFixed(2)}`
                              ) : (
                                <span className="text-gray-400 text-xs">Loading…</span>
                              )}
                            </td>
                            <td
                              className={`px-4 py-3.5 text-right font-bold ${
                                isUp
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {priceData
                                ? `${isUp ? "+" : ""}${priceData.change.toFixed(2)}`
                                : "—"}
                            </td>
                            <td
                              className={`px-4 py-3.5 text-right font-extrabold ${
                                isUp
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              {priceData
                                ? `${isUp ? "+" : ""}${priceData.changePercent.toFixed(2)}%`
                                : "—"}
                            </td>
                            <td className="px-4 py-3.5 text-right font-bold text-blue-600 dark:text-blue-400">
                              {item.targetPrice ? `$${item.targetPrice.toFixed(2)}` : "—"}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              {priceData ? getMarketStatusBadge(priceData.marketStatus) : "—"}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleEditDetails(item)}
                                  className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                  title="Edit"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <Link
                                  href={`/stocks/${item.symbol}`}
                                  className="px-2.5 py-1 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold shadow-sm transition-all"
                                >
                                  Details
                                </Link>
                                <button
                                  onClick={() => handleRemove(item.symbol)}
                                  className="p-1.5 rounded-xl border border-red-200 dark:border-red-800/80 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/80 transition-colors"
                                  title="Remove"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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

          {/* Edit Item Modal */}
          {editingItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all animate-in fade-in duration-150">
              <div className="bg-white/95 dark:bg-gray-900/95 border border-gray-200/80 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 overflow-hidden">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <StockLogo symbol={editingItem.symbol} size="md" />
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100">
                        Edit {editingItem.symbol}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Update target price and private notes
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      <Target className="w-3.5 h-3.5 text-blue-500" />
                      <span>Target Price ($)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editTargetPrice}
                      onChange={(e) => setEditTargetPrice(e.target.value)}
                      placeholder="e.g. 150.00"
                      className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span>Personal Notes</span>
                    </label>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Add personal notes or strategy..."
                      rows={3}
                      className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-xs font-bold text-white shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
