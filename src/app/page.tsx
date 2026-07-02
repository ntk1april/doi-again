"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";

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
  }, [investorQuotes]);

  useEffect(() => {
    setCurrentQuote(investorQuotes[currentIndex]);
  }, [currentIndex, investorQuotes]);

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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-green-50 to-green-50 dark:from-red-900 dark:via-green-900 dark:to-green-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              📉 Doi Again
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              If you happy in your whole day and you want to see something like
              red color to make you down, you can use this app
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center mb-12">
              <button
                onClick={() => {
                  setAuthModalMode("signup");
                  setShowAuthModal(true);
                }}
                className="rounded-lg bg-gradient-to-r from-red-500 to-green-500 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Get Started Free
              </button>
            </div>

            {/* Motivational Quote */}
            <div className="max-w-2xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-2xl text-gray-800 dark:text-gray-200 italic mb-4">
                "{currentQuote.text}"
              </div>
              <div className="text-gray-600 dark:text-gray-400 font-semibold">
                — {currentQuote.author}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            Features that help you manage your portfolio
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-red-50 to-green-50 dark:from-red-900 dark:to-green-900 border border-blue-200 dark:border-blue-800">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Portfolio Tracking
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Monitor your investments with detailed profit/loss calculations
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border border-green-200 dark:border-green-800">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Wishlist
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Track stocks you're interested for add to portfolio or just keep
                an eye on them
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border border-green-200 dark:border-green-800">
              <div className="text-5xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Market Analysis
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                Get stock details, analyst recommendations, and news about the
                stock
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Market News Section */}
      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            Latest Market News 📰
          </h2>

          {isLoadingNews ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                Loading market news...
              </p>
            </div>
          ) : marketNews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketNews.map((news, index) => (
                <a
                  key={index}
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
                >
                  {news.image && (
                    <img
                      src={news.image}
                      alt={news.headline}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                    {news.headline}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                    {news.summary}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{news.source}</span>
                    <span>
                      {new Date(news.datetime * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No market news available at the moment
              </p>
            </div>
          )}
        </div>
        <p
          className="mt-8 text-blue-500 text-center cursor-pointer hover:text-blue-700 text-lg font-semibold animate-bounce"
          onClick={() => setShowAuthModal(true)}
        >
          Join with us to see more news
        </p>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-red-500 to-green-500 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            📉 Are you ready to see red color?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join with one of all investors who never see green color in his life
            like me, with Doi Again
          </p>
          <button
            onClick={() => {
              setAuthModalMode("signup");
              setShowAuthModal(true);
            }}
            className="inline-block rounded-lg bg-white dark:bg-gray-800 px-8 py-4 text-lg font-semibold text-blue-500 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
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
