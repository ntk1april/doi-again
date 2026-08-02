"use client";

import { useEffect, useState } from "react";
import { Loader2, LayoutGrid, List, Newspaper, ExternalLink, ChevronLeft, ChevronRight, Calendar, Building2 } from "lucide-react";

export default function NewsPage() {
  const [allNews, setAllNews] = useState<any[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"card" | "list">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("news-view") as "card" | "list") || "card";
    }
    return "card";
  });
  const articlesPerPage = 18;

  const toggleView = (mode: "card" | "list") => {
    setViewMode(mode);
    localStorage.setItem("news-view", mode);
  };

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
        setAllNews(data.data);
      }
    } catch (err) {
      console.error("Error fetching market news:", err);
    } finally {
      setIsLoadingNews(false);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(allNews.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const currentNews = allNews.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">📰</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
                Global Market News
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Live financial headlines, market commentary, and breaking news.
            </p>
            {!isLoadingNews && allNews.length > 0 && (
              <p className="mt-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                Showing {startIndex + 1}-{Math.min(endIndex, allNews.length)} of{" "}
                {allNews.length} articles
              </p>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-gray-800/80 p-1 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-md shadow-inner self-end md:self-auto">
            <button
              onClick={() => toggleView("card")}
              title="Card view"
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === "card"
                  ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-md"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Card</span>
            </button>
            <button
              onClick={() => toggleView("list")}
              title="List view"
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-md"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>

        {/* Market News Section */}
        {isLoadingNews ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
              Fetching financial news...
            </span>
          </div>
        ) : currentNews.length > 0 ? (
          <>
            <div
              className={
                viewMode === "card"
                  ? "grid md:grid-cols-2 lg:grid-cols-3 gap-5"
                  : "space-y-4"
              }
            >
              {currentNews.map((news, index) => (
                <a
                  key={index}
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group block bg-white/80 dark:bg-gray-900/80 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all border border-gray-200/80 dark:border-gray-800 backdrop-blur-xl transform hover:scale-[1.01] ${
                    viewMode === "list" ? "flex flex-col sm:flex-row gap-5 items-center" : ""
                  }`}
                >
                  {viewMode === "card" && news.image && (
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
                  <div className={viewMode === "list" ? "flex-1" : ""}>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        <Building2 className="w-3 h-3" />
                        <span>{news.source}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 dark:text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(news.datetime * 1000).toLocaleDateString()}
                        </span>
                      </span>
                    </div>

                    <h3
                      className={`font-extrabold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-500 transition-colors ${
                        viewMode === "card"
                          ? "line-clamp-2 text-base"
                          : "line-clamp-1 sm:line-clamp-2 text-sm"
                      }`}
                    >
                      {news.headline}
                    </h3>

                    <p
                      className={`text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed ${
                        viewMode === "card" ? "line-clamp-3" : "line-clamp-2"
                      }`}
                    >
                      {news.summary}
                    </p>

                    <div className="flex items-center text-xs font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                      <span>Read full article</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      const showPage =
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1);

                      const showEllipsis =
                        (page === currentPage - 2 && currentPage > 3) ||
                        (page === currentPage + 2 &&
                          currentPage < totalPages - 2);

                      if (showEllipsis) {
                        return (
                          <span
                            key={page}
                            className="px-2 py-1 text-xs text-gray-400 dark:text-gray-500 font-bold"
                          >
                            ...
                          </span>
                        );
                      }

                      if (!showPage) return null;

                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                            currentPage === page
                              ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                              : "bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Next Button */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-4 py-2 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/80 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white/80 dark:bg-gray-900/80 rounded-3xl border border-gray-200/80 dark:border-gray-800 backdrop-blur-xl">
            <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400">
              No market news available at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
