"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import {
  Loader2,
  TrendingDown,
  PieChart,
  Bookmark,
  BarChart3,
  ArrowRight,
  ExternalLink,
  Quote as QuoteIcon,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface Quote {
  text: string;
  author: string;
}

const investorQuotes: Quote[] = [
  {
    text: "ตลาดหุ้นเต็มไปด้วยผู้คนที่รู้ราคาของทุกสิ่ง แต่ไม่รู้คุณค่าของสิ่งใดเลย - The stock market is filled with individuals who know the price of everything, but the value of nothing.",
    author: "Philip Fisher",
  },
  {
    text: "ในการลงทุน สิ่งที่ทำให้รู้สึกสบายใจมักจะไม่สร้างผลกำไร - In investing, what is comfortable is rarely profitable.",
    author: "Robert Arnott",
  },
  {
    text: "เวลาที่ดีที่สุดในการปลูกต้นไม้คือเมื่อ 20 ปีที่แล้ว เวลาที่ดีรองลงมาคือตอนนี้ - The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
  },
  {
    text: "ความเสี่ยงเกิดจากการไม่รู้ว่าตัวเองกำลังทำอะไรอยู่ - Risk comes from not knowing what you're doing.",
    author: "Warren Buffett",
  },
  {
    text: "นักลงทุนรายบุคคลควรประพฤติตนอย่างสม่ำเสมอในฐานะนักลงทุน ไม่ใช่ในฐานะนักเก็งกำไร - The individual investor should act consistently as an investor and not as a speculator.",
    author: "Ben Graham",
  },
  {
    text: "สิ่งสำคัญไม่ได้อยู่ที่ว่าคุณถูกหรือผิด แต่อยู่ที่ว่าคุณได้เงินเท่าไหร่เมื่อคุณถูก และคุณจะเสียเงินเท่าไหร่เมื่อคุณผิด - It's not whether you're right or wrong that's important, but how much money you make when you're right and how much you lose when you're wrong.",
    author: "George Soros",
  },
  {
    text: "คำที่อันตรายที่สุดในการลงทุนคือ: 'ครั้งนี้มันต่างออกไป' - The most dangerous words in investing are: 'this time it's different.'",
    author: "Sir John Templeton",
  },
  {
    text: "จงรู้ว่าคุณเป็นเจ้าของอะไร และจงรู้ว่าทำไมคุณถึงเป็นเจ้าของสิ่งนั้น - Know what you own, and know why you own it.",
    author: "Peter Lynch",
  },
  {
    text: "ตลาดหุ้นเป็นกลไกในการโอนเงินจากคนที่ใจร้อนไปยังคนที่ใจเย็นกว่า - The stock market is a device for transferring money from the impatient to the patient.",
    author: "Warren Buffett",
  },
  {
    text: "การลงทุนในความรู้ให้ผลตอบแทนที่ดีที่สุด - An investment in knowledge pays the best interest.",
    author: "Benjamin Franklin",
  },
  {
    text: "ไม่ขาย = ไม่ขาดทุน - Not selling means not losing money.",
    author: "Nanthakorn K.",
  },
  {
    text: "ความเสี่ยงสูง = ผลตอบแทนสูง - High risk, high return",
    author: "CK Cheong",
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentQuote, setCurrentQuote] = useState<Quote>(investorQuotes[0]);
  const [marketNews, setMarketNews] = useState<any[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">(
    "signup",
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  // Redirect if already signed in
  useEffect(() => {
    if (user) {
      router.push("/portfolio");
    }
  }, [user, router]);

  // Rotate quotes every 10 seconds
  useEffect(() => {
    if (!investorQuotes.length) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === investorQuotes.length - 1 ? 0 : prev + 1,
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentQuote(investorQuotes[currentIndex]);
  }, [currentIndex]);

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
        setMarketNews(data.data.slice(0, 6));
      }
    } catch (err) {
      console.error("Error fetching market news:", err);
    } finally {
      setIsLoadingNews(false);
    }
  };

  if (user) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 overflow-hidden">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-red-500/10 via-rose-500/10 to-emerald-500/15 dark:from-red-500/20 dark:via-rose-500/10 dark:to-emerald-500/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <div className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/80 dark:border-gray-800 shadow-sm text-xs font-bold text-gray-700 dark:text-gray-300 mb-6">
            <span className="text-base">📉</span>
            <span>The Stock Portfolio Tracker</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight leading-tight mb-6">
            Doi Again{" "}
            <span className="bg-gradient-to-r from-red-500 via-rose-500 to-emerald-500 bg-clip-text text-transparent">
              Portfolio
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            If you are happy all day and want to see some vibrant red color to
            keep you humble, welcome home. Track positions, P/L, and watchlist
            stocks in real-time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-12">
            <button
              onClick={() => {
                setAuthModalMode("signup");
                setShowAuthModal(true);
              }}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-emerald-500 hover:from-red-600 hover:to-emerald-600 px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-xl shadow-emerald-500/20 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setAuthModalMode("signin");
                setShowAuthModal(true);
              }}
              className="flex items-center gap-2 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200/80 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 px-6 py-3.5 text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200 shadow-sm transition-all active:scale-[0.98]"
            >
              <span>Sign In</span>
            </button>
          </div>

          {/* Motivational Quote Card */}
          <div
            className="max-w-2xl mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200/80 dark:border-gray-800 text-left cursor-pointer select-none hover:shadow-2xl transition-all group relative overflow-hidden"
            onClick={() =>
              setCurrentIndex((prev) =>
                prev === investorQuotes.length - 1 ? 0 : prev + 1,
              )
            }
            title="Click for next quote"
          >
            <QuoteIcon className="w-6 h-6 text-blue-500 opacity-40 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-sm sm:text-lg text-gray-800 dark:text-gray-200 font-semibold italic mb-4 leading-relaxed">
              &ldquo;{currentQuote.text}&rdquo;
            </p>
            <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
              <span>— {currentQuote.author}</span>
              <span className="text-[10px] text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                {currentIndex + 1} / {investorQuotes.length} · click next →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 sm:py-24 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border-y border-gray-200/60 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              Powerful Features for Smart Investors
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
              Everything you need to analyze, organize, and monitor your
              investment assets.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 shadow-sm hover:shadow-xl transition-all transform hover:scale-[1.01] group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 mb-2">
                Portfolio Dashboard & Groups
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Organize holdings into custom group tabs, track live unrealized
                and realized P/L, and view interactive allocation donut charts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 shadow-sm hover:shadow-xl transition-all transform hover:scale-[1.01] group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800 text-amber-500 mb-4 group-hover:scale-110 transition-transform">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 mb-2">
                Wishlist & Target Prices
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Save prospective stocks, set custom target entry prices, attach
                personal investment notes, and receive market status updates.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 shadow-sm hover:shadow-xl transition-all transform hover:scale-[1.01] group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 mb-2">
                Live News & Market Insights
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Stay updated with real-time stock news, analyst consensus
                recommendations, financial metrics, and currency conversion ($ /
                ฿).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Market News Section */}
      <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              Latest Market News 📰
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
              Stay connected to real-time global financial headlines.
            </p>
          </div>

          {isLoadingNews ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                Loading market headlines...
              </span>
            </div>
          ) : marketNews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketNews.map((news, index) => (
                <a
                  key={index}
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-white/80 dark:bg-gray-900/80 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all border border-gray-200/80 dark:border-gray-800 backdrop-blur-xl transform hover:scale-[1.01]"
                >
                  {news.image && (
                    <div className="w-full h-44 overflow-hidden rounded-2xl mb-4 bg-gray-100 dark:bg-gray-800">
                      <img
                        src={news.image}
                        alt={news.headline}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <h3 className="font-extrabold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 text-sm sm:text-base group-hover:text-blue-500 transition-colors">
                    {news.headline}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-3 leading-relaxed">
                    {news.summary}
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 dark:text-gray-500">
                    <span>{news.source}</span>
                    <span>
                      {new Date(news.datetime * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/80 dark:bg-gray-900/80 rounded-3xl border border-gray-200/80 dark:border-gray-800">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                No market news available at the moment.
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setAuthModalMode("signup");
                setShowAuthModal(true);
              }}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 animate-bounce transition-colors"
            >
              <span>Join Doi Again to see full news & portfolio insights</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="py-16 sm:py-20 bg-gradient-to-r from-red-600 via-rose-600 to-emerald-600 dark:from-red-950 dark:via-gray-900 dark:to-emerald-950 border-t border-white/10 relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <img
            src="/da.png"
            alt="Doi Again Logo"
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 object-contain rounded-2xl shadow-2xl border border-white/20 bg-white/10 backdrop-blur-md p-2"
          />
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Ready to embrace the red color?
          </h2>
          <p className="text-sm sm:text-lg text-white/90 mb-8 max-w-xl mx-auto leading-relaxed">
            Join fellow investors who track their stock portfolio with total
            clarity and humor on Doi Again.
          </p>
          <button
            onClick={() => {
              setAuthModalMode("signup");
              setShowAuthModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-sm sm:text-base font-extrabold shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4 text-gray-900" />
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
