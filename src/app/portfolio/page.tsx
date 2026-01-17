/**
 * Portfolio Dashboard Page
 * Main page displaying all stocks and portfolio summary
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PortfolioSummary from "@/components/PortfolioSummary";
import PortfolioTable from "@/components/PortfolioTable";
import { PortfolioTableFiled, PortfolioSummary as PortfolioSummaryType, ApiResponse } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { authFetch } from "@/lib/utils/auth-fetch";

interface Quote {
  text: string;
  author: string;
}

const investorQuotes: Quote[] = [
  { text: "ตลาดหุ้นเต็มไปด้วยผู้คนที่รู้ราคาของทุกสิ่ง แต่ไม่รู้คุณค่าของสิ่งใดเลย - The stock market is filled with individuals who know the price of everything, but the value of nothing.", author: "Philip Fisher" },
  { text: "ในการลงทุน สิ่งที่ทำให้รู้สึกสบายใจมักจะไม่สร้างผลกำไร - In investing, what is comfortable is rarely profitable.", author: "Robert Arnott" },
  { text: "เวลาที่ดีที่สุดในการปลูกต้นไม้คือเมื่อ 20 ปีที่แล้ว เวลาที่ดีรองลงมาคือตอนนี้ - The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "ความเสี่ยงเกิดจากการไม่รู้ว่าตัวเองกำลังทำอะไรอยู่ - Risk comes from not knowing what you're doing.", author: "Warren Buffett" },
  { text: "นักลงทุนรายบุคคลควรประพฤติตนอย่างสม่ำเสมอในฐานะนักลงทุน ไม่ใช่ในฐานะนักเก็งกำไร - The individual investor should act consistently as an investor and not as a speculator.", author: "Ben Graham" },
  { text: "สิ่งสำคัญไม่ได้อยู่ที่ว่าคุณถูกหรือผิด แต่อยู่ที่ว่าคุณได้เงินเท่าไหร่เมื่อคุณถูก และคุณจะเสียเงินเท่าไหร่เมื่อคุณผิด - It's not whether you're right or wrong that's important, but how much money you make when you're right and how much you lose when you're wrong.", author: "George Soros" },
  { text: "คำที่อันตรายที่สุดในการลงทุนคือ: 'ครั้งนี้มันต่างออกไป' - The most dangerous words in investing are: 'this time it's different.'", author: "Sir John Templeton" },
  { text: "จงรู้ว่าคุณเป็นเจ้าของอะไร และจงรู้ว่าทำไมคุณถึงเป็นเจ้าของสิ่งนั้น - Know what you own, and know why you own it.", author: "Peter Lynch" },
  { text: "ตลาดหุ้นเป็นกลไกในการโอนเงินจากคนที่ใจร้อนไปยังคนที่ใจเย็นกว่า - The stock market is a device for transferring money from the impatient to the patient.", author: "Warren Buffett" },
  { text: "การลงทุนในความรู้ให้ผลตอบแทนที่ดีที่สุด - An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "ไม่ขาย = ไม่ขาดทุน - Not selling means not losing money.", author: "Nanthakorn K." },
  { text: "ความเสี่ยงสูง = ผลตอบแทนสูง - High risk, high return", author: "CK Cheong" },
];

export default function PortfolioDashboard() {
  const [stocks, setStocks] = useState<PortfolioTableFiled[]>([]);
  const [summary, setSummary] = useState<PortfolioSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentQuote, setCurrentQuote] = useState<Quote>(investorQuotes[0]);
  const { user, signOut, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!authLoading && !user) {
      router.push("/");
      return;
    }

    if (user) {
      fetchPortfolio();
    }
  }, [user, authLoading, router]);

  // Rotate quotes every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * investorQuotes.length);
      setCurrentQuote(investorQuotes[randomIndex]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const fetchPortfolio = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await authFetch("/api/portfolio/stocks");
      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch portfolio");
      }

      const { stocks: fetchedStocks, summary: fetchedSummary } = data.data as {
        stocks: PortfolioTableFiled[];
        summary: PortfolioSummaryType;
      };

      setStocks(fetchedStocks);
      setSummary(fetchedSummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching portfolio:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfolio 📊</h1>
            <p className="mt-2 text-gray-600">Welcome, {user.name}! 👋</p>
          </div>
          <Link
            href="/portfolio/add"
            className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            + Add Stock
          </Link>
        </div>

        {/* Motivational Quote */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
          <div className="text-lg text-gray-800 italic mb-2">
            "{currentQuote.text}"
          </div>
          <div className="text-gray-600 font-semibold text-sm">
            — {currentQuote.author}
          </div>
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
            <p className="text-gray-600">Loading portfolio...</p>
          </div>
        )}

        {/* Portfolio Summary */}
        {!isLoading && summary && (
          <>
            <PortfolioSummary summary={summary} />

            {/* Portfolio Table */}
            <div className="mt-8">
              <PortfolioTable stocks={stocks} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
