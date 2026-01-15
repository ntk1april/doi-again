"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";

interface Quote {
  text: string;
  author: string;
}

const investorQuotes: Quote[] = [
  { text: "The stock market is filled with individuals who know the price of everything, but the value of nothing.", author: "Philip Fisher" },
  { text: "In investing, what is comfortable is rarely profitable.", author: "Robert Arnott" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Risk comes from not knowing what you're doing.", author: "Warren Buffett" },
  { text: "The individual investor should act consistently as an investor and not as a speculator.", author: "Ben Graham" },
  { text: "It's not whether you're right or wrong that's important, but how much money you make when you're right and how much you lose when you're wrong.", author: "George Soros" },
  { text: "The four most dangerous words in investing are: 'this time it's different.'", author: "Sir John Templeton" },
  { text: "Know what you own, and know why you own it.", author: "Peter Lynch" },
  { text: "The stock market is a device for transferring money from the impatient to the patient.", author: "Warren Buffett" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
];

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentQuote, setCurrentQuote] = useState<Quote>(investorQuotes[0]);
  const [marketNews, setMarketNews] = useState<any[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");

  // Redirect if already signed in
  useEffect(() => {
    if (user) {
      router.push("/portfolio");
    }
  }, [user, router]);

  // Rotate quotes every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * investorQuotes.length);
      setCurrentQuote(investorQuotes[randomIndex]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Fetch market news
  useEffect(() => {
    fetchMarketNews();
  }, []);

  const fetchMarketNews = async () => {
    try {
      setIsLoadingNews(true);
      const response = await fetch("/api/market-news");
      const data = await response.json();
      
      if (data.success && data.data) {
        setMarketNews(data.data.slice(0, 6)); // Show top 6 news
      }
    } catch (err) {
      console.error("Error fetching market news:", err);
    } finally {
      setIsLoadingNews(false);
    }
  };

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              📉 Doy Again
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Track your investments, analyze trends, and grow your wealth with confidence
            </p>
            
            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center mb-12">
              <button
                onClick={() => {
                  setAuthModalMode("signup");
                  setShowAuthModal(true);
                }}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Get Started Free
              </button>
            </div>

            {/* Motivational Quote */}
            <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200">
              <div className="text-2xl text-gray-800 italic mb-4">
                "{currentQuote.text}"
              </div>
              <div className="text-gray-600 font-semibold">
                — {currentQuote.author}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need to Manage Your Portfolio
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Portfolio Tracking</h3>
              <p className="text-gray-700">
                Monitor your investments in real-time with detailed profit/loss calculations
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Wishlist</h3>
              <p className="text-gray-700">
                Track stocks you're interested in with notes and target prices
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Market Analysis</h3>
              <p className="text-gray-700">
                Get comprehensive stock details, analyst recommendations, and sentiment data
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Market News Section */}
      <div className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Latest Market News 📰
          </h2>

          {isLoadingNews ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading market news...</p>
            </div>
          ) : marketNews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketNews.map((news, index) => (
                <a
                  key={index}
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-200"
                >
                  {news.image && (
                    <img
                      src={news.image}
                      alt={news.headline}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                    {news.headline}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {news.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{news.source}</span>
                    <span>{new Date(news.datetime * 1000).toLocaleDateString()}</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No market news available at the moment</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of investors tracking their portfolios with Doy Again
          </p>
          <button
            onClick={() => {
              setAuthModalMode("signup");
              setShowAuthModal(true);
            }}
            className="inline-block rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Create Free Account
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}
