"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import StockLogo from "@/components/StockLogo";
import AuthModal from "@/components/AuthModal";
import { authFetch } from "@/lib/utils/auth-fetch";
import { useAuth } from "@/contexts/AuthContext";
import Swal from "sweetalert2";
import {
  Bookmark,
  Trash2,
  Briefcase,
  Plus,
  TrendingUp,
  TrendingDown,
  Loader2,
  Star,
} from "lucide-react";

interface StockDetails {
  symbol: string;
  profile: any;
  quote: any;
  metrics: any;
  recommendations: any[];
  sentiment: any;
}

interface NewsArticle {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const symbol = params.symbol as string;

  const [stockDetails, setStockDetails] = useState<StockDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isInPortfolio, setIsInPortfolio] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">(
    "signin",
  );
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState("D");
  const [chartType, setChartType] = useState("line");
  useEffect(() => {
    if (symbol) {
      checkPortfolioAndWishlist();
      fetchStockNews();
    }
  }, [symbol]);

  useEffect(() => {
    if (symbol) {
      fetchStockDetails();
    }
  }, [symbol, timeframe]);

  // Real-time price polling
  useEffect(() => {
    if (!symbol) return;
    
    const fetchRealTimePrice = async () => {
      try {
        const response = await fetch(`/api/stock-price?symbol=${symbol}`);
        const data = await response.json();
        if (data.success && data.data) {
          setStockDetails(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              quote: {
                ...prev.quote,
                c: data.data.price,
                d: data.data.change,
                dp: data.data.changePercent,
                h: data.data.high,
                l: data.data.low,
                o: data.data.open,
                pc: data.data.previousClose,
                t: data.data.timestamp,
                extPrice: data.data.extPrice,
                extChange: data.data.extChange,
                extChangePercent: data.data.extChangePercent,
                marketStatus: data.data.marketStatus,
              }
            };
          });
        }
      } catch (err) {
        // Ignore polling errors to not break UI
      }
    };

    const intervalId = setInterval(fetchRealTimePrice, 10000);
    return () => clearInterval(intervalId);
  }, [symbol]);

  const fetchStockDetails = async () => {
    try {
      if (!stockDetails) setIsLoading(true);
      const response = await fetch(
        `/api/stock-details/${symbol}?timespan=${timeframe}`,
      );
      const data = await response.json();

      if (data.success) {
        setStockDetails(data.data);
      } else {
        setError(data.error || "Failed to load stock details");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to load stock details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStockNews = async () => {
    try {
      setNewsLoading(true);

      // Call our backend API route
      const response = await fetch(`/api/stock-news/${symbol}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setNews(data.data);
      }
    } catch (err) {
      console.error("Error fetching stock news:", err);
    } finally {
      setNewsLoading(false);
    }
  };

  const checkPortfolioAndWishlist = async () => {
    try {
      setCheckingStatus(true);

      // Only check if user is authenticated
      if (!user) {
        setCheckingStatus(false);
        return;
      }

      // Check portfolio
      const portfolioResponse = await authFetch("/api/portfolio/stocks");
      const portfolioData = await portfolioResponse.json();
      if (portfolioData.success && portfolioData.data) {
        // Portfolio API returns { success, data: { stocks: [...] } }
        const stocks = Array.isArray(portfolioData.data)
          ? portfolioData.data
          : portfolioData.data.stocks || [];

        const inPortfolio = stocks.some(
          (stock: any) => stock.symbol.toUpperCase() === symbol.toUpperCase(),
        );
        setIsInPortfolio(inPortfolio);
      }

      // Check wishlist
      const wishlistResponse = await authFetch("/api/wishlist");
      const wishlistData = await wishlistResponse.json();
      if (wishlistData.success && wishlistData.data) {
        const inWishlist = wishlistData.data.some(
          (item: any) => item.symbol.toUpperCase() === symbol.toUpperCase(),
        );
        setIsInWishlist(inWishlist);
      }
    } catch (err) {
      console.error("Error checking portfolio/wishlist status:", err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      setAuthModalMode("signin");
      setShowAuthModal(true);
      return;
    }

    try {
      const response = await authFetch("/api/wishlist", {
        method: "POST",
        body: JSON.stringify({ symbol }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: `${symbol} added to wishlist!`,
          showConfirmButton: false,
          timer: 1500,
        });
        setIsInWishlist(true);
      } else {
        Swal.fire({
          icon: "error",
          title: data.error || "Failed to add to wishlist",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to add to wishlist",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };

  const handleRemoveFromWishlist = async () => {
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

    if (result.isConfirmed) {
      try {
        const response = await authFetch(`/api/wishlist/${symbol}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: "success",
            title: `${symbol} removed from wishlist`,
            showConfirmButton: false,
            timer: 1500,
          });
          setIsInWishlist(false);
        } else {
          Swal.fire({
            icon: "error",
            title: data.error || "Failed to remove from wishlist",
            showConfirmButton: false,
            timer: 1500,
          });
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Failed to remove from wishlist",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">
          Loading stock details...
        </p>
      </div>
    );
  }

  if (error || !stockDetails) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error || "Stock not found"}
          </div>
          <div className="mt-4">
            <Link href="/" className="text-blue-600 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { profile, quote, metrics, recommendations } = stockDetails;
  const latestRecommendation = recommendations?.[0];

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <StockLogo symbol={symbol} size="lg" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                  {symbol}
                </h1>
                {profile?.name && (
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                    {profile.name}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Wishlist Button */}
              {checkingStatus ? (
                <button
                  disabled
                  className="rounded-2xl bg-gray-200 dark:bg-gray-800 px-4 py-2 text-xs font-bold text-gray-400 cursor-not-allowed flex items-center gap-1.5"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading...</span>
                </button>
              ) : isInWishlist ? (
                <button
                  onClick={handleRemoveFromWishlist}
                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/80 px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/80 transition-all shadow-sm active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Wishlist</span>
                </button>
              ) : (
                <button
                  onClick={handleAddToWishlist}
                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition-all active:scale-95"
                >
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>Add to Wishlist</span>
                </button>
              )}

              {/* Portfolio Button */}
              {isInPortfolio ? (
                <Link
                  href={`/portfolio/edit/${symbol}`}
                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Trade / Edit</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    if (!user) {
                      setAuthModalMode("signin");
                      setShowAuthModal(true);
                    } else {
                      router.push(`/portfolio/add?symbol=${symbol}`);
                    }
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Portfolio</span>
                </button>
              )}
            </div>
          </div>

          {/* Current Price Card */}
          {quote && (
            <div className="mb-6 rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">
                    Current Market Price
                  </p>
                  <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                    ${quote.c?.toFixed(2) || "N/A"}
                  </p>
                </div>
                <div className="sm:text-right">
                  <div
                    className={`inline-flex items-center gap-1 text-lg sm:text-xl font-extrabold ${
                      quote.d >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {quote.d >= 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    <span>
                      {quote.d >= 0 ? "+" : ""}
                      {quote.d?.toFixed(2)} ({quote.dp?.toFixed(2)}%)
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
                    Open: ${quote.o?.toFixed(2)} &nbsp;|&nbsp; High: $
                    {quote.h?.toFixed(2)} &nbsp;|&nbsp; Low: $
                    {quote.l?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Price History Chart */}
          {(stockDetails as any).bars &&
            (stockDetails as any).bars.length > 0 && (
              <div className="mb-6 rounded-xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm">
                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Price History
                  </h2>
                  <div className="flex gap-2">
                    {/* Chart Type Dropdown */}
                    <div className="relative">
                      <select
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2 pr-10 text-sm font-semibold text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-400"
                      >
                        <option value="candlestick">Candlestick</option>
                        <option value="heikinashi">Heikin Ashi</option>
                        <option value="line">Line</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <svg
                          className="h-4 w-4 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>

                    {/* Timeframe Dropdown */}
                    <div className="relative">
                      <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2 pr-10 text-sm font-semibold text-gray-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-blue-400"
                      >
                        <option value="M1">1 Minute</option>
                        <option value="M5">5 Minutes</option>
                        <option value="M15">15 Minutes</option>
                        <option value="M30">30 Minutes</option>
                        <option value="M60">1 Hour</option>
                        <option value="M120">2 Hours</option>
                        <option value="M240">4 Hours</option>
                        <option value="D">Daily</option>
                        <option value="W">Weekly</option>
                        <option value="M">Monthly</option>
                        <option value="Y">Yearly</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                        <svg
                          className="h-4 w-4 fill-current"
                          viewBox="0 0 20 20"
                        >
                          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <InlineStockChart
                  data={(stockDetails as any).bars}
                  chartType={chartType}
                />
              </div>
            )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Company Info Card */}
            {profile && (
              <div className="lg:col-span-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Company Info
                </h2>
                <div className="space-y-3 text-sm">
                  {profile.country && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Country:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {profile.country}
                      </span>
                    </div>
                  )}
                  {profile.exchange && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Exchange:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {profile.exchange}
                      </span>
                    </div>
                  )}
                  {profile.finnhubIndustry && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Industry:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {profile.finnhubIndustry}
                      </span>
                    </div>
                  )}
                  {profile.ipo && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        IPO Date:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {profile.ipo}
                      </span>
                    </div>
                  )}
                  {profile.marketCapitalization && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Market Cap:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        ${(profile.marketCapitalization / 1000).toFixed(2)}B
                      </span>
                    </div>
                  )}
                  {profile.weburl && (
                    <div className="pt-2">
                      <a
                        href={profile.weburl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Visit Website →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Right Column - Market Data & Analysis */}
            <div className="lg:col-span-2 space-y-6">
              {/* Financial Metrics */}
              {metrics?.metric && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Financial Metrics
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {metrics.metric.peBasicExclExtraTTM && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          P/E Ratio
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {metrics.metric.peBasicExclExtraTTM.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {metrics.metric.pbAnnual && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          P/B Ratio
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {metrics.metric.pbAnnual.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {metrics.metric.epsBasicExclExtraItemsAnnual && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          EPS
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          $
                          {metrics.metric.epsBasicExclExtraItemsAnnual.toFixed(
                            2,
                          )}
                        </p>
                      </div>
                    )}
                    {metrics.metric.dividendYieldIndicatedAnnual && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Dividend Yield
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {metrics.metric.dividendYieldIndicatedAnnual.toFixed(
                            2,
                          )}
                          %
                        </p>
                      </div>
                    )}
                    {metrics.metric.beta && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Beta
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {metrics.metric.beta.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {metrics.metric["52WeekHigh"] && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          52W High
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          ${metrics.metric["52WeekHigh"].toFixed(2)}
                        </p>
                      </div>
                    )}
                    {metrics.metric["52WeekLow"] && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          52W Low
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          ${metrics.metric["52WeekLow"].toFixed(2)}
                        </p>
                      </div>
                    )}
                    {metrics.metric.roeRfy && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ROE
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {metrics.metric.roeRfy.toFixed(2)}%
                        </p>
                      </div>
                    )}
                    {metrics.metric.roaRfy && (
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ROA
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {metrics.metric.roaRfy.toFixed(2)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Analyst Recommendations */}
              {latestRecommendation && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Analyst Recommendations
                    </h2>
                    {/* Overall Recommendation Summary */}
                    {(() => {
                      const total =
                        latestRecommendation.strongBuy +
                        latestRecommendation.buy +
                        latestRecommendation.hold +
                        latestRecommendation.sell +
                        latestRecommendation.strongSell;

                      // Calculate which recommendation has the most votes
                      const recommendations = [
                        {
                          label: "Strong Buy",
                          value: latestRecommendation.strongBuy,
                          color: "bg-green-700 text-white",
                        },
                        {
                          label: "Buy",
                          value: latestRecommendation.buy,
                          color: "bg-green-600 text-white",
                        },
                        {
                          label: "Hold",
                          value: latestRecommendation.hold,
                          color: "bg-gray-600 text-white",
                        },
                        {
                          label: "Sell",
                          value: latestRecommendation.sell,
                          color: "bg-red-600 text-white",
                        },
                        {
                          label: "Strong Sell",
                          value: latestRecommendation.strongSell,
                          color: "bg-red-700 text-white",
                        },
                      ];

                      const topRecommendation = recommendations.reduce(
                        (prev, current) =>
                          current.value > prev.value ? current : prev,
                      );

                      return (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Consensus:
                          </span>
                          <span
                            className={`px-4 py-2 rounded-lg font-semibold text-sm ${topRecommendation.color}`}
                          >
                            {topRecommendation.label}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="space-y-3">
                    {/* Strong Buy */}
                    {(() => {
                      const total =
                        latestRecommendation.strongBuy +
                        latestRecommendation.buy +
                        latestRecommendation.hold +
                        latestRecommendation.sell +
                        latestRecommendation.strongSell;
                      const percentage =
                        (latestRecommendation.strongBuy / total) * 100;

                      return (
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-green-700">
                                Strong Buy
                              </span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {latestRecommendation.strongBuy}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-700"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Buy */}
                    {(() => {
                      const total =
                        latestRecommendation.strongBuy +
                        latestRecommendation.buy +
                        latestRecommendation.hold +
                        latestRecommendation.sell +
                        latestRecommendation.strongSell;
                      const percentage =
                        (latestRecommendation.buy / total) * 100;

                      return (
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-green-600">
                                Buy
                              </span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {latestRecommendation.buy}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-600"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Hold */}
                    {(() => {
                      const total =
                        latestRecommendation.strongBuy +
                        latestRecommendation.buy +
                        latestRecommendation.hold +
                        latestRecommendation.sell +
                        latestRecommendation.strongSell;
                      const percentage =
                        (latestRecommendation.hold / total) * 100;

                      return (
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Hold
                              </span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {latestRecommendation.hold}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gray-600"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Sell */}
                    {(() => {
                      const total =
                        latestRecommendation.strongBuy +
                        latestRecommendation.buy +
                        latestRecommendation.hold +
                        latestRecommendation.sell +
                        latestRecommendation.strongSell;
                      const percentage =
                        (latestRecommendation.sell / total) * 100;

                      return (
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-red-600">
                                Sell
                              </span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {latestRecommendation.sell}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-600"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Strong Sell */}
                    {(() => {
                      const total =
                        latestRecommendation.strongBuy +
                        latestRecommendation.buy +
                        latestRecommendation.hold +
                        latestRecommendation.sell +
                        latestRecommendation.strongSell;
                      const percentage =
                        (latestRecommendation.strongSell / total) * 100;

                      return (
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-red-700">
                                Strong Sell
                              </span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {latestRecommendation.strongSell}
                              </span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-red-700"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Period: {latestRecommendation.period}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stock News Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Latest News for {symbol}
            </h2>

            {newsLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  Loading news...
                </p>
              </div>
            ) : news.length > 0 ? (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Headline
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Source
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Date
                        </th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {/* Action */}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {news.map((article, index) => (
                        <tr
                          key={article.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          {/* Headline */}
                          <td className="px-6 py-4">
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                                {article.headline}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {article.summary}
                              </p>
                            </div>
                          </td>

                          {/* Source */}
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                            {article.source}
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {new Date(
                              article.datetime * 1000,
                            ).toLocaleDateString()}
                          </td>

                          {/* Action */}
                          <td className="px-6 py-4 text-center">
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                            >
                              Read More
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">
                  No recent news available for {symbol}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
    </>
  );
}

function InlineStockChart({
  data,
  chartType = "candlestick",
}: {
  data: any[];
  chartType?: string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Transform data for Heikin Ashi if selected
  const displayData = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (chartType === "heikinashi") {
      const haData = [];
      let prevHAOpen = data[0].open;
      let prevHAClose = data[0].close;

      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        const haClose = (d.open + d.high + d.low + d.close) / 4;
        let haOpen;
        if (i === 0) {
          haOpen = (d.open + d.close) / 2;
        } else {
          haOpen = (prevHAOpen + prevHAClose) / 2;
        }
        const haHigh = Math.max(d.high, haOpen, haClose);
        const haLow = Math.min(d.low, haOpen, haClose);

        haData.push({
          ...d,
          originalOpen: d.open,
          originalHigh: d.high,
          originalLow: d.low,
          originalClose: d.close,
          open: haOpen,
          high: haHigh,
          low: haLow,
          close: haClose,
        });

        prevHAOpen = haOpen;
        prevHAClose = haClose;
      }
      return haData;
    }
    return data;
  }, [data, chartType]);

  const chartData = useMemo(() => {
    if (!displayData || displayData.length === 0) return null;
    let minLow = Infinity;
    let maxHigh = -Infinity;
    let maxVol = 0;
    displayData.forEach((d) => {
      if (d.low < minLow) minLow = d.low;
      if (d.high > maxHigh) maxHigh = d.high;
      if (d.volume > maxVol) maxVol = d.volume;
    });
    const padding = (maxHigh - minLow) * 0.1;
    return {
      yMin: minLow - padding,
      yMax: maxHigh + padding,
      yRange: maxHigh + padding - (minLow - padding),
      maxVol: maxVol || 1,
    };
  }, [displayData]);

  if (!chartData || !displayData || displayData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800/50">
        No chart data available
      </div>
    );
  }

  const { yMin, yMax, yRange, maxVol } = chartData;
  const fullWidth = 1000;
  const fullHeight = 450;
  const chartWidth = 940; // Leave 60px for Y axis
  const priceHeight = 320;
  const volHeight = 100;

  const barWidth = Math.max((chartWidth / displayData.length) * 0.6, 2);
  const xSpacing = chartWidth / displayData.length;

  const formatDate = (timeStr: string) => {
    const d = new Date(timeStr);
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const hoverData =
    hoverIndex !== null && displayData[hoverIndex]
      ? displayData[hoverIndex]
      : displayData[displayData.length - 1];

  // For Line Chart
  const linePoints = useMemo(() => {
    if (chartType !== "line") return "";
    return displayData
      .map((d, i) => {
        const x = i * xSpacing + xSpacing / 2;
        const y = priceHeight - ((d.close - yMin) / yRange) * priceHeight;
        return `${x},${y}`;
      })
      .join(" ");
  }, [displayData, chartType, xSpacing, yMin, yRange, priceHeight]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-gray-300 bg-[#ffffff] shadow-sm select-none dark:border-gray-800 dark:bg-[#131722]">
      {/* Top Info Bar (TradingView style) */}
      <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 bg-gray-50/50 px-4 py-2 font-mono text-xs sm:text-sm dark:border-gray-800 dark:bg-[#131722]">
        {hoverData && (
          <>
            <div className="text-gray-500 dark:text-gray-400">
              O{" "}
              <span
                className={`font-semibold ${
                  hoverData.open <= hoverData.close
                    ? "text-[#089981]"
                    : "text-[#f23645]"
                }`}
              >
                {(hoverData.originalOpen || hoverData.open).toFixed(2)}
              </span>
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              H{" "}
              <span
                className={`font-semibold ${
                  hoverData.open <= hoverData.close
                    ? "text-[#089981]"
                    : "text-[#f23645]"
                }`}
              >
                {(hoverData.originalHigh || hoverData.high).toFixed(2)}
              </span>
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              L{" "}
              <span
                className={`font-semibold ${
                  hoverData.open <= hoverData.close
                    ? "text-[#089981]"
                    : "text-[#f23645]"
                }`}
              >
                {(hoverData.originalLow || hoverData.low).toFixed(2)}
              </span>
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              C{" "}
              <span
                className={`font-semibold ${
                  hoverData.open <= hoverData.close
                    ? "text-[#089981]"
                    : "text-[#f23645]"
                }`}
              >
                {(hoverData.originalClose || hoverData.close).toFixed(2)}
              </span>
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              Vol{" "}
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {(hoverData.volume / 1000).toFixed(1)}K
              </span>
            </div>
          </>
        )}
      </div>

      {/* SVG Chart */}
      <div className="relative h-[400px] w-full cursor-crosshair sm:h-[500px]">
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${fullWidth} ${fullHeight}`}
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const ratioX = mouseX / rect.width;
            const svgX = ratioX * fullWidth;
            if (svgX < chartWidth) {
              let idx = Math.floor(svgX / xSpacing);
              if (idx < 0) idx = 0;
              if (idx >= displayData.length) idx = displayData.length - 1;
              setHoverIndex(idx);
            }
          }}
        >
          {/* Grid and Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = priceHeight * ratio;
            const price = yMax - yRange * ratio;
            return (
              <g key={`grid-${i}`}>
                <line
                  x1="0"
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="currentColor"
                  className="text-gray-100 dark:text-[#1f2937]"
                  strokeDasharray="4 4"
                  vectorEffect="non-scaling-stroke"
                />
                <text
                  x={chartWidth + 10}
                  y={y + 4}
                  className="fill-gray-500 font-mono text-[11px] dark:fill-[#787b86]"
                >
                  {price.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels (render fewer labels) */}
          {displayData.map((d, i) => {
            const step = Math.max(Math.floor(displayData.length / 6), 1);
            if (i % step === 0 && i !== displayData.length - 1) {
              const x = i * xSpacing + xSpacing / 2;
              return (
                <g key={`x-axis-${i}`}>
                  <line
                    x1={x}
                    y1={priceHeight + volHeight}
                    x2={x}
                    y2={priceHeight + volHeight + 5}
                    stroke="currentColor"
                    className="text-gray-300 dark:text-[#2b313f]"
                    vectorEffect="non-scaling-stroke"
                  />
                  <text
                    x={x}
                    y={priceHeight + volHeight + 20}
                    textAnchor="middle"
                    className="fill-gray-500 font-mono text-[10px] dark:fill-[#787b86]"
                  >
                    {formatDate(d.time)}
                  </text>
                </g>
              );
            }
            return null;
          })}

          {/* Separator lines */}
          <line
            x1={chartWidth}
            y1={0}
            x2={chartWidth}
            y2={fullHeight}
            stroke="currentColor"
            className="text-gray-200 dark:text-[#2b313f]"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1={0}
            y1={priceHeight + volHeight}
            x2={chartWidth}
            y2={priceHeight + volHeight}
            stroke="currentColor"
            className="text-gray-200 dark:text-[#2b313f]"
            vectorEffect="non-scaling-stroke"
          />

          {/* Render Line Chart */}
          {chartType === "line" && (
            <polyline
              points={linePoints}
              fill="none"
              stroke="#2962ff"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          )}

          {/* Volume and Candles */}
          {displayData.map((d, i) => {
            const isUp = d.close >= d.open;
            const colorClass = isUp ? "text-[#089981]" : "text-[#f23645]";
            const volColorClass = isUp
              ? "fill-[#089981] opacity-50"
              : "fill-[#f23645] opacity-50";
            const x = i * xSpacing + xSpacing / 2;

            // Volume coordinates
            const vHeight = (d.volume / maxVol) * volHeight;
            const vY = priceHeight + volHeight - vHeight;

            // Price coordinates
            const yHigh =
              priceHeight - ((d.high - yMin) / yRange) * priceHeight;
            const yLow = priceHeight - ((d.low - yMin) / yRange) * priceHeight;
            const yOpen =
              priceHeight - ((d.open - yMin) / yRange) * priceHeight;
            const yClose =
              priceHeight - ((d.close - yMin) / yRange) * priceHeight;
            const rectY = Math.min(yOpen, yClose);
            const rectHeight = Math.max(Math.abs(yOpen - yClose), 1);

            return (
              <g key={`bar-${i}`}>
                {/* Volume Bar */}
                <rect
                  x={x - barWidth / 2}
                  y={vY}
                  width={barWidth}
                  height={vHeight}
                  className={volColorClass}
                />

                {/* Render Candlesticks / Heikin Ashi */}
                {chartType !== "line" && (
                  <>
                    {/* Candle Wick */}
                    <line
                      x1={x}
                      y1={yHigh}
                      x2={x}
                      y2={yLow}
                      stroke="currentColor"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                      className={colorClass}
                    />

                    {/* Candle Body */}
                    <rect
                      x={x - barWidth / 2}
                      y={rectY}
                      width={barWidth}
                      height={rectHeight}
                      className={`fill-current ${colorClass}`}
                    />
                  </>
                )}
              </g>
            );
          })}

          {/* Interactive Crosshair */}
          {hoverIndex !== null &&
            displayData[hoverIndex] &&
            (() => {
              const d = displayData[hoverIndex];
              const x = hoverIndex * xSpacing + xSpacing / 2;
              const yClose =
                priceHeight - ((d.close - yMin) / yRange) * priceHeight;
              return (
                <g className="pointer-events-none">
                  {/* Vertical Crosshair Line */}
                  <line
                    x1={x}
                    y1={0}
                    x2={x}
                    y2={priceHeight + volHeight}
                    stroke="currentColor"
                    className="text-gray-400 dark:text-[#787b86]"
                    strokeDasharray="4 4"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Horizontal Crosshair Line */}
                  <line
                    x1={0}
                    y1={yClose}
                    x2={chartWidth}
                    y2={yClose}
                    stroke="currentColor"
                    className="text-gray-400 dark:text-[#787b86]"
                    strokeDasharray="4 4"
                    vectorEffect="non-scaling-stroke"
                  />

                  {/* Y-axis Label Highlight */}
                  <rect
                    x={chartWidth}
                    y={yClose - 10}
                    width={60}
                    height={20}
                    className="fill-blue-600"
                  />
                  <text
                    x={chartWidth + 30}
                    y={yClose + 4}
                    textAnchor="middle"
                    className="fill-white font-mono text-[11px] font-bold"
                  >
                    {d.close.toFixed(2)}
                  </text>

                  {/* X-axis Label Highlight */}
                  <rect
                    x={x - 35}
                    y={priceHeight + volHeight}
                    width={70}
                    height={20}
                    className="fill-blue-600"
                  />
                  <text
                    x={x}
                    y={priceHeight + volHeight + 14}
                    textAnchor="middle"
                    className="fill-white font-mono text-[10px] font-bold"
                  >
                    {formatDate(d.time)}
                  </text>
                </g>
              );
            })()}
        </svg>
      </div>
    </div>
  );
}
