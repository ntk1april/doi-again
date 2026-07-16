/**
 * Portfolio Dashboard Page
 * Main page displaying all stocks and portfolio summary
 */

"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PortfolioSummary from "@/components/PortfolioSummary";
import PortfolioTable from "@/components/PortfolioTable";
import PortfolioDonutChart from "@/components/PortfolioDonutChart";
import PortfolioTabBar, {
  PortfolioTab,
  ALL_TAB_ID,
} from "@/components/PortfolioTabBar";
import {
  PortfolioTableFiled,
  PortfolioSummary as PortfolioSummaryType,
  ApiResponse,
} from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { authFetch } from "@/lib/utils/auth-fetch";
import { Loader2 } from "lucide-react";

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

export default function PortfolioDashboard() {
  const [stocks, setStocks] = useState<PortfolioTableFiled[]>([]);
  const [summary, setSummary] = useState<PortfolioSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentQuote, setCurrentQuote] = useState<Quote>(investorQuotes[0]);
  const [currency, setCurrency] = useState<"USD" | "THB">("USD");
  const [exchangeRate, setExchangeRate] = useState(31.45);
  const [hideNumbers, setHideNumbers] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [portfolioView, setPortfolioView] = useState<"card" | "table">(() => {
    if (typeof window !== "undefined") {
      return (
        (localStorage.getItem("portfolio-view") as "card" | "table") || "table"
      );
    }
    return "table";
  });

  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [tabs, setTabs] = useState<PortfolioTab[]>([
    { id: ALL_TAB_ID, name: "All Stocks", symbols: [] },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>(ALL_TAB_ID);
  const [tabsLoaded, setTabsLoaded] = useState(false);

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!authLoading && !user) {
      router.push("/");
      return;
    }

    if (user) {
      fetchPortfolio();
      fetchExchangeRate();
      fetchTabs();
    }
  }, [user, authLoading, router]);

  // ── Load tabs from DB ───────────────────────────────────
  const fetchTabs = async () => {
    try {
      const res = await authFetch("/api/portfolio/tabs");
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const saved: PortfolioTab[] = data.data;
        const hasAll = saved.some((t) => t.id === ALL_TAB_ID);
        setTabs(
          hasAll
            ? saved
            : [{ id: ALL_TAB_ID, name: "All Stocks", symbols: [] }, ...saved],
        );
      }
    } catch {
      // If loading fails just keep the default All tab
    } finally {
      setTabsLoaded(true);
    }
  };

  // ── Save tabs to DB (debounced 800ms) ─────────────────────
  useEffect(() => {
    if (!tabsLoaded) return; // don't save on initial load
    const timer = setTimeout(() => {
      authFetch("/api/portfolio/tabs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tabs }),
      }).catch(() => {}); // fire-and-forget
    }, 800);
    return () => clearTimeout(timer);
  }, [tabs, tabsLoaded]);

  // ── Tab handlers ────────────────────────────────────────────
  const handleTabAdd = () => {
    const id = `tab-${Date.now()}`;
    const newTab: PortfolioTab = {
      id,
      name: `Group ${tabs.length}`,
      symbols: [],
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);
  };
  const handleTabRename = (id: string, name: string) =>
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, name } : t)));
  const handleTabDelete = (id: string) => {
    setTabs((prev) => prev.filter((t) => t.id !== id));
    if (activeTabId === id) setActiveTabId(ALL_TAB_ID);
  };
  const handleTabSymbolsChange = (id: string, symbols: string[]) =>
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, symbols } : t)));

  // ── Filtered stocks + summary for active tab ─────────────────
  const activeTab = tabs.find((t) => t.id === activeTabId);
  const filteredStocks = useMemo(() => {
    if (!activeTab || activeTab.id === ALL_TAB_ID) return stocks;
    return stocks.filter((s) => activeTab.symbols.includes(s.symbol));
  }, [stocks, activeTab]);

  const filteredSummary = useMemo((): PortfolioSummaryType | null => {
    if (!summary) return null;
    if (!activeTab || activeTab.id === ALL_TAB_ID) return summary;
    const invested = filteredStocks.reduce((s, st) => s + st.totalCost, 0);
    const currentVal = filteredStocks.reduce((s, st) => s + st.currentValue, 0);
    const unrealized = filteredStocks.reduce(
      (s, st) => s + st.unrealizedPnl,
      0,
    );
    const realized = filteredStocks.reduce((s, st) => s + st.realizedPnl, 0);
    const net = unrealized + realized;
    return {
      totalInvested: invested,
      currentValue: currentVal,
      unrealizedPnl: unrealized,
      realizedPnl: realized,
      netPnl: net,
      netPnlPercent: invested > 0 ? (net / invested) * 100 : 0,
    };
  }, [summary, activeTab, filteredStocks]);

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

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch("/api/exchange-rate");
      const data = await response.json();

      if (data.success && data.data.rate) {
        setExchangeRate(data.data.rate);
      }
    } catch (err) {
      console.error("Error fetching exchange rate:", err);
      // Keep using fallback rate
    }
  };

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
    // return (
    //   <div className="flex items-center justify-center h-64">
    //     <div className="flex items-center gap-3 text-muted-foreground">
    //       <Loader2 className="w-6 h-6 animate-spin" />
    //       <span>Loading...</span>
    //     </div>
    //   </div>
    // );
    return;
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Portfolio 📊
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Welcome, {user.name}! 👋
            </p>
          </div>

          <div className="flex justify-end flex-wrap items-center gap-2">
            {/* Hide Numbers Toggle */}
            <button
              onClick={() => setHideNumbers(!hideNumbers)}
              title={hideNumbers ? "Show numbers" : "Hide numbers"}
              className="flex items-center gap-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {hideNumbers ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Show
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                  Hide
                </>
              )}
            </button>

            {/* Currency Toggle */}
            <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-1">
              <button
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currency === "USD"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                $
              </button>
              <button
                onClick={() => setCurrency("THB")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  currency === "THB"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                ฿
              </button>
            </div>
            <Link
              href="/portfolio/add"
              className="rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Add Stock
            </Link>
          </div>
        </div>

        {/* Motivational Quote */}
        <div
          className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 rounded-2xl p-4 sm:p-6 border border-blue-200 dark:border-blue-800 cursor-pointer"
          onClick={() =>
            setCurrentIndex((prev) =>
              prev === investorQuotes.length - 1 ? 0 : prev + 1,
            )
          }
          title="Click for next quote"
        >
          <div className="text-sm sm:text-lg text-gray-800 dark:text-gray-200 italic mb-2 line-clamp-3 sm:line-clamp-none">
            "{currentQuote.text}"
          </div>
          <div className="text-gray-600 dark:text-gray-400 font-semibold text-xs sm:text-sm">
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
          <div className="flex items-center justify-center h-18">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading portfolio...</span>
            </div>
          </div>
        )}

        {/* Portfolio Tabs + Content */}
        {!isLoading && filteredSummary && (
          <>
            {/* Tab Bar */}
            <PortfolioTabBar
              tabs={tabs}
              activeTabId={activeTabId}
              allSymbols={stocks.map((s) => s.symbol)}
              onTabChange={setActiveTabId}
              onTabAdd={handleTabAdd}
              onTabRename={handleTabRename}
              onTabDelete={handleTabDelete}
              onTabSymbolsChange={handleTabSymbolsChange}
            />

            <PortfolioSummary
              summary={filteredSummary}
              currency={currency}
              exchangeRate={exchangeRate}
              stocks={filteredStocks}
              hideNumbers={hideNumbers}
            />

            {/* Donut Charts */}
            {filteredStocks.length > 0 && (
              <div className="mt-6">
                <PortfolioDonutChart
                  stocks={filteredStocks}
                  hideNumbers={hideNumbers}
                />
              </div>
            )}

            {/* View toggle + Portfolio Table */}
            <div className="mt-8">
              {/* Toggle bar */}
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {filteredStocks.length} stock
                  {filteredStocks.length !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1">
                  <button
                    onClick={() => {
                      setPortfolioView("card");
                      localStorage.setItem("portfolio-view", "card");
                    }}
                    title="Card view"
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                      portfolioView === "card"
                        ? "bg-blue-500 text-white shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
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
                    onClick={() => {
                      setPortfolioView("table");
                      localStorage.setItem("portfolio-view", "table");
                    }}
                    title="Table view"
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                      portfolioView === "table"
                        ? "bg-blue-500 text-white shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
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
              <PortfolioTable
                stocks={filteredStocks}
                currency={currency}
                exchangeRate={exchangeRate}
                hideNumbers={hideNumbers}
                viewMode={portfolioView}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
