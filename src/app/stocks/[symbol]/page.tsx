"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import StockLogo from "@/components/StockLogo";
import AuthModal from "@/components/AuthModal";
import { authFetch } from "@/lib/utils/auth-fetch";
import { useAuth } from "@/contexts/AuthContext";
import Swal from "sweetalert2";
import { Bookmark, Trash2, Briefcase, Plus, TrendingUp, TrendingDown, Loader2, Star } from "lucide-react";

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

  useEffect(() => {
    if (symbol) {
      fetchStockDetails();
      checkPortfolioAndWishlist();
      fetchStockNews();
    }
  }, [symbol]);

  const fetchStockDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/stock-details/${symbol}`);
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
                    Open: ${quote.o?.toFixed(2)} &nbsp;|&nbsp; High: ${quote.h?.toFixed(2)}{" "}
                    &nbsp;|&nbsp; Low: ${quote.l?.toFixed(2)}
                  </p>
                </div>
              </div>
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
