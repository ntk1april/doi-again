"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import StockLogo from "@/components/StockLogo";
import AuthModal from "@/components/AuthModal";
import { authFetch } from "@/lib/utils/auth-fetch";
import { useAuth } from "@/contexts/AuthContext";
import Swal from "sweetalert2";

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
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");
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

        const inPortfolio = stocks.some((stock: any) =>
          stock.symbol.toUpperCase() === symbol.toUpperCase()
        );
        setIsInPortfolio(inPortfolio);
      }

      // Check wishlist
      const wishlistResponse = await authFetch("/api/wishlist");
      const wishlistData = await wishlistResponse.json();
      if (wishlistData.success && wishlistData.data) {
        const inWishlist = wishlistData.data.some((item: any) =>
          item.symbol.toUpperCase() === symbol.toUpperCase()
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
    })

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading stock details...</p>
      </div>
    );
  }

  if (error || !stockDetails) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
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
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <StockLogo symbol={symbol} size="lg" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{symbol}</h1>
                {profile?.name && (
                  <p className="mt-1 text-gray-600">{profile.name}</p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              {/* Wishlist Button */}
              {checkingStatus ? (
                <button
                  disabled
                  className="rounded-md bg-gray-400 px-4 py-2 font-medium text-white cursor-not-allowed"
                >
                  Loading...
                </button>
              ) : isInWishlist ? (
                <button
                  onClick={handleRemoveFromWishlist}
                  className="rounded-md bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-700"
                >
                  🗑️ Remove from Wishlist
                </button>
              ) : (
                <button
                  onClick={handleAddToWishlist}
                  className="rounded-md bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  ⭐ Add to Wishlist
                </button>
              )}

              {/* Portfolio Button */}
              {isInPortfolio ? (
                <Link
                  href={`/portfolio/edit/${symbol}`}
                  className="rounded-md bg-green-500 px-4 py-2 font-medium text-white hover:bg-green-700"
                >
                  📊 Buy/Sell More
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
                  className="rounded-md bg-green-500 px-4 py-2 font-medium text-white hover:bg-green-700"
                >
                  📊 Add to Portfolio
                </button>
              )}
            </div>
          </div>

          {/* Current Price Card */}
          {quote && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Price</p>
                  <p className="text-4xl font-bold text-gray-900">
                    ${quote.c?.toFixed(2) || "N/A"}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-semibold ${quote.d >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {quote.d >= 0 ? "+" : ""}{quote.d?.toFixed(2)} ({quote.dp?.toFixed(2)}%)
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Open: ${quote.o?.toFixed(2)} | High: ${quote.h?.toFixed(2)} | Low: ${quote.l?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Company Info Card */}
            {profile && (
              <div className="lg:col-span-1 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Info</h2>
                <div className="space-y-3 text-sm">
                  {profile.country && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Country:</span>
                      <span className="font-medium text-gray-900">{profile.country}</span>
                    </div>
                  )}
                  {profile.exchange && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Exchange:</span>
                      <span className="font-medium text-gray-900">{profile.exchange}</span>
                    </div>
                  )}
                  {profile.finnhubIndustry && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Industry:</span>
                      <span className="font-medium text-gray-900">{profile.finnhubIndustry}</span>
                    </div>
                  )}
                  {profile.ipo && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">IPO Date:</span>
                      <span className="font-medium text-gray-900">{profile.ipo}</span>
                    </div>
                  )}
                  {profile.marketCapitalization && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Market Cap:</span>
                      <span className="font-medium text-gray-900">
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
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Metrics</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {metrics.metric.peBasicExclExtraTTM && (
                      <div>
                        <p className="text-sm text-gray-600">P/E Ratio</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {metrics.metric.peBasicExclExtraTTM.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {metrics.metric.pbAnnual && (
                      <div>
                        <p className="text-sm text-gray-600">P/B Ratio</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {metrics.metric.pbAnnual.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {metrics.metric.epsBasicExclExtraItemsAnnual && (
                      <div>
                        <p className="text-sm text-gray-600">EPS</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ${metrics.metric.epsBasicExclExtraItemsAnnual.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {metrics.metric.dividendYieldIndicatedAnnual && (
                      <div>
                        <p className="text-sm text-gray-600">Dividend Yield</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {metrics.metric.dividendYieldIndicatedAnnual.toFixed(2)}%
                        </p>
                      </div>
                    )}
                    {metrics.metric.beta && (
                      <div>
                        <p className="text-sm text-gray-600">Beta</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {metrics.metric.beta.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {metrics.metric["52WeekHigh"] && (
                      <div>
                        <p className="text-sm text-gray-600">52W High</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ${metrics.metric["52WeekHigh"].toFixed(2)}
                        </p>
                      </div>
                    )}
                    {metrics.metric["52WeekLow"] && (
                      <div>
                        <p className="text-sm text-gray-600">52W Low</p>
                        <p className="text-lg font-semibold text-gray-900">
                          ${metrics.metric["52WeekLow"].toFixed(2)}
                        </p>
                      </div>
                    )}
                    {metrics.metric.roeRfy && (
                      <div>
                        <p className="text-sm text-gray-600">ROE</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {metrics.metric.roeRfy.toFixed(2)}%
                        </p>
                      </div>
                    )}
                    {metrics.metric.roaRfy && (
                      <div>
                        <p className="text-sm text-gray-600">ROA</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {metrics.metric.roaRfy.toFixed(2)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Analyst Recommendations */}
              {latestRecommendation && (
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Analyst Recommendations
                    </h2>
                    {/* Overall Recommendation Summary */}
                    {(() => {
                      const total = latestRecommendation.strongBuy + latestRecommendation.buy +
                        latestRecommendation.hold + latestRecommendation.sell +
                        latestRecommendation.strongSell;

                      // Calculate which recommendation has the most votes
                      const recommendations = [
                        { label: "Strong Buy", value: latestRecommendation.strongBuy, color: "bg-green-700 text-white" },
                        { label: "Buy", value: latestRecommendation.buy, color: "bg-green-600 text-white" },
                        { label: "Hold", value: latestRecommendation.hold, color: "bg-gray-600 text-white" },
                        { label: "Sell", value: latestRecommendation.sell, color: "bg-red-600 text-white" },
                        { label: "Strong Sell", value: latestRecommendation.strongSell, color: "bg-red-700 text-white" },
                      ];

                      const topRecommendation = recommendations.reduce((prev, current) =>
                        (current.value > prev.value) ? current : prev
                      );

                      return (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Consensus:</span>
                          <span className={`px-4 py-2 rounded-lg font-semibold text-sm ${topRecommendation.color}`}>
                            {topRecommendation.label}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="space-y-3">
                    {/* Strong Buy */}
                    {(() => {
                      const total = latestRecommendation.strongBuy + latestRecommendation.buy +
                        latestRecommendation.hold + latestRecommendation.sell +
                        latestRecommendation.strongSell;
                      const percentage = (latestRecommendation.strongBuy / total) * 100;

                      return (
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-green-700">Strong Buy</span>
                              <span className="text-sm font-semibold text-gray-900">{latestRecommendation.strongBuy}</span>
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
                      const total = latestRecommendation.strongBuy + latestRecommendation.buy +
                        latestRecommendation.hold + latestRecommendation.sell +
                        latestRecommendation.strongSell;
                      const percentage = (latestRecommendation.buy / total) * 100;

                      return (
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-green-600">Buy</span>
                              <span className="text-sm font-semibold text-gray-900">{latestRecommendation.buy}</span>
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
                      const total = latestRecommendation.strongBuy + latestRecommendation.buy +
                        latestRecommendation.hold + latestRecommendation.sell +
                        latestRecommendation.strongSell;
                      const percentage = (latestRecommendation.hold / total) * 100;

                      return (
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-gray-600">Hold</span>
                              <span className="text-sm font-semibold text-gray-900">{latestRecommendation.hold}</span>
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
                      const total = latestRecommendation.strongBuy + latestRecommendation.buy +
                        latestRecommendation.hold + latestRecommendation.sell +
                        latestRecommendation.strongSell;
                      const percentage = (latestRecommendation.sell / total) * 100;

                      return (
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-red-600">Sell</span>
                              <span className="text-sm font-semibold text-gray-900">{latestRecommendation.sell}</span>
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
                      const total = latestRecommendation.strongBuy + latestRecommendation.buy +
                        latestRecommendation.hold + latestRecommendation.sell +
                        latestRecommendation.strongSell;
                      const percentage = (latestRecommendation.strongSell / total) * 100;

                      return (
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-red-700">Strong Sell</span>
                              <span className="text-sm font-semibold text-gray-900">{latestRecommendation.strongSell}</span>
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

                    <p className="text-xs text-gray-500 mt-2">
                      Period: {latestRecommendation.period}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stock News Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Latest News for {symbol}
            </h2>

            {newsLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading news...</p>
              </div>
            ) : news.length > 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Headline
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                        {/* Action */}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {news.map((article, index) => (
                      <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                        {/* Headline */}
                        <td className="px-6 py-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                              {article.headline}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {article.summary}
                            </p>
                          </div>
                        </td>

                        {/* Source */}
                        <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                          {article.source}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                          {new Date(article.datetime * 1000).toLocaleDateString()}
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
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No recent news available for {symbol}</p>
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
