"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import StockLogo from "@/components/StockLogo";
import AuthModal from "@/components/AuthModal";
import { authFetch } from "@/lib/utils/auth-fetch";
import { useAuth } from "@/contexts/AuthContext";

interface StockDetails {
  symbol: string;
  profile: any;
  quote: any;
  metrics: any;
  recommendations: any[];
  sentiment: any;
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

  useEffect(() => {
    if (symbol) {
      fetchStockDetails();
      checkPortfolioAndWishlist();
    }
  }, [symbol]);

  const fetchStockDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/stocks/${symbol}`);
      const data = await response.json();

      if (data.success) {
        setStockDetails(data.data);
      } else {
        setError(data.error || "Failed to load stock details");
      }
    } catch (err) {
      setError("Failed to load stock details");
    } finally {
      setIsLoading(false);
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
        alert(`${symbol} added to wishlist!`);
        setIsInWishlist(true);
      } else {
        alert(data.error || "Failed to add to wishlist");
      }
    } catch (err) {
      alert("Failed to add to wishlist");
    }
  };

  const handleRemoveFromWishlist = async () => {
    if (!confirm(`Remove ${symbol} from wishlist?`)) return;

    try {
      const response = await authFetch(`/api/wishlist/${symbol}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert(`${symbol} removed from wishlist`);
        setIsInWishlist(false);
      } else {
        alert(data.error || "Failed to remove from wishlist");
      }
    } catch (err) {
      alert("Failed to remove from wishlist");
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

  const { profile, quote, metrics, recommendations, sentiment } = stockDetails;
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
                  className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                >
                  🗑️ Remove from Wishlist
                </button>
              ) : (
                <button
                  onClick={handleAddToWishlist}
                  className="rounded-md bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700"
                >
                  ⭐ Add to Wishlist
                </button>
              )}

              {/* Portfolio Button */}
              {isInPortfolio ? (
                <Link
                  href={`/portfolio/edit/${symbol}`}
                  className="rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
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
                  className="rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
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
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Analyst Recommendations
                  </h2>
                  <div className="space-y-3">
                    {[
                      { label: "Strong Buy", value: latestRecommendation.strongBuy, color: "green-700" },
                      { label: "Buy", value: latestRecommendation.buy, color: "green-600" },
                      { label: "Hold", value: latestRecommendation.hold, color: "gray-600" },
                      { label: "Sell", value: latestRecommendation.sell, color: "red-600" },
                      { label: "Strong Sell", value: latestRecommendation.strongSell, color: "red-700" },
                    ].map((item) => {
                      const total = latestRecommendation.strongBuy + latestRecommendation.buy + 
                                   latestRecommendation.hold + latestRecommendation.sell + 
                                   latestRecommendation.strongSell;
                      const percentage = (item.value / total) * 100;
                      
                      return (
                        <div key={item.label} className="flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className={`text-sm font-medium text-${item.color}`}>{item.label}</span>
                              <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-${item.color}`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <p className="text-xs text-gray-500 mt-2">
                      Period: {latestRecommendation.period}
                    </p>
                  </div>
                </div>
              )}

              {/* Sentiment Analysis */}
              {sentiment && (
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    News Sentiment
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {sentiment.sentiment && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">Bullish Sentiment</p>
                          <p className="text-2xl font-semibold text-green-600">
                            {(sentiment.sentiment.bullishPercent * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Bearish Sentiment</p>
                          <p className="text-2xl font-semibold text-red-600">
                            {(sentiment.sentiment.bearishPercent * 100).toFixed(1)}%
                          </p>
                        </div>
                      </>
                    )}
                    {sentiment.buzz && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">Articles This Week</p>
                          <p className="text-2xl font-semibold text-gray-900">
                            {sentiment.buzz.articlesInLastWeek}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Buzz Score</p>
                          <p className="text-2xl font-semibold text-gray-900">
                            {sentiment.buzz.buzz?.toFixed(2)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
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
