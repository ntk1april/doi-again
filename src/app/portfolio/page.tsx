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
import { Loader2, Eye, EyeOff, Plus, LayoutGrid, Table, Sparkles, Quote as QuoteIcon } from "lucide-react";

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
            : [{ id: ALL_TAB_ID, name: "All Stocks", symbols: [] }, ...saved]
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
      0
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
        prev === investorQuotes.length - 1 ? 0 : prev + 1
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setCurrentQuote(investorQuotes[currentIndex]);
  }, [currentIndex]);

  const fetchExchangeRate = async () => {
    try {
      const response = await fetch("/api/exchange-rate");
      const data = await response.json();

      if (data.success && data.data.rate) {
        setExchangeRate(data.data.rate);
      }
    } catch (err) {
      console.error("Error fetching exchange rate:", err);
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

  if (authLoading) return null;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">📊</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                Portfolio Overview
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Welcome back, <span className="font-bold text-gray-800 dark:text-gray-200">{user.name}</span>! 👋
            </p>
          </div>

          <div className="flex justify-end flex-wrap items-center gap-2.5">
            {/* Hide Numbers Toggle */}
            <button
              onClick={() => setHideNumbers(!hideNumbers)}
              title={hideNumbers ? "Show numbers" : "Hide numbers"}
              className="flex items-center gap-1.5 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 shadow-sm transition-all active:scale-95"
            >
              {hideNumbers ? (
                <>
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span>Show</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 text-gray-400" />
                  <span>Hide</span>
                </>
              )}
            </button>

            {/* Currency Toggle */}
            <div className="flex items-center bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-md shadow-inner">
              <button
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1 text-xs font-extrabold rounded-xl transition-all ${
                  currency === "USD"
                    ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-md"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                $ USD
              </button>
              <button
                onClick={() => setCurrency("THB")}
                className={`px-3 py-1 text-xs font-extrabold rounded-xl transition-all ${
                  currency === "THB"
                    ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-md"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                ฿ THB
              </button>
            </div>

            {/* Add Stock Button */}
            <Link
              href="/portfolio/add"
              className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stock</span>
            </Link>
          </div>
        </div>

        {/* Motivational Quote */}
        <div
          className="mb-8 relative overflow-hidden bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-emerald-500/20 rounded-3xl p-5 sm:p-6 border border-blue-200/60 dark:border-blue-800/60 backdrop-blur-xl cursor-pointer select-none shadow-sm hover:shadow-md transition-all group"
          onClick={() =>
            setCurrentIndex((prev) =>
              prev === investorQuotes.length - 1 ? 0 : prev + 1
            )
          }
          title="Click for next quote"
        >
          <div className="flex items-start gap-3">
            <QuoteIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1 opacity-70 group-hover:scale-110 transition-transform" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-base font-semibold text-gray-800 dark:text-gray-200 italic mb-2 leading-relaxed">
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

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 dark:border-red-800/80 bg-red-50 dark:bg-red-950/50 p-4 text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300 shadow-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              Fetching portfolio data...
            </span>
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
              <div className="mt-8">
                <PortfolioDonutChart
                  stocks={filteredStocks}
                  hideNumbers={hideNumbers}
                />
              </div>
            )}

            {/* View toggle + Portfolio Table */}
            <div className="mt-8">
              {/* Toggle bar */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Holding Assets ({filteredStocks.length})
                </span>

                <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-md shadow-inner">
                  <button
                    onClick={() => {
                      setPortfolioView("card");
                      localStorage.setItem("portfolio-view", "card");
                    }}
                    title="Card view"
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      portfolioView === "card"
                        ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-md"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Cards</span>
                  </button>
                  <button
                    onClick={() => {
                      setPortfolioView("table");
                      localStorage.setItem("portfolio-view", "table");
                    }}
                    title="Table view"
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      portfolioView === "table"
                        ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-md"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Table</span>
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
