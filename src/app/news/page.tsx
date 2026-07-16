"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

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
        setAllNews(data.data); // Store all news
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Market News 📰
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Stay updated with the latest market trends and financial news
            </p>
            {!isLoadingNews && allNews.length > 0 && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Showing {startIndex + 1}-{Math.min(endIndex, allNews.length)} of{" "}
                {allNews.length} articles
              </p>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex justify-end items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1 shrink-0">
            <button
              onClick={() => toggleView("card")}
              title="Card view"
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                viewMode === "card"
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
              Card
            </button>
            <button
              onClick={() => toggleView("list")}
              title="List view"
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                viewMode === "list"
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
              List
            </button>
          </div>
        </div>

        {/* Market News Section */}
        {isLoadingNews ? (
          <div className="flex items-center justify-center h-100">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading market news...</span>
            </div>
          </div>
        ) : currentNews.length > 0 ? (
          <>
            <div
              className={
                viewMode === "card"
                  ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {currentNews.map((news, index) => (
                <a
                  key={index}
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700 ${
                    viewMode === "list" ? "flex flex-col sm:flex-row gap-4" : ""
                  }`}
                >
                  {viewMode === "card" && news.image && (
                    <img
                      src={news.image}
                      alt={news.headline}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <div className={viewMode === "list" ? "flex-1" : ""}>
                    <h3
                      className={`font-bold text-gray-900 dark:text-gray-100 mb-2 ${
                        viewMode === "card"
                          ? "line-clamp-2"
                          : "line-clamp-1 sm:line-clamp-2"
                      }`}
                    >
                      {news.headline}
                    </h3>
                    <p
                      className={`text-sm text-gray-600 dark:text-gray-400 mb-3 ${
                        viewMode === "card" ? "line-clamp-3" : "line-clamp-2"
                      }`}
                    >
                      {news.summary}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{news.source}</span>
                      <span>
                        {new Date(news.datetime * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      // Show first page, last page, current page, and pages around current
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
                            className="px-2 py-2 text-gray-500 dark:text-gray-400"
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
                          className={`px-4 py-2 rounded-md transition-colors ${
                            currentPage === page
                              ? "bg-blue-500 text-white"
                              : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    },
                  )}
                </div>

                {/* Next Button */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              No market news available at the moment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
