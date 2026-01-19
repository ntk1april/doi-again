"use client";

import { useEffect, useState } from "react";

export default function NewsPage() {
  const [allNews, setAllNews] = useState<any[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 18;

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Market News 📰</h1>
          <p className="mt-2 text-gray-600">
            Stay updated with the latest market trends and financial news
          </p>
          {!isLoadingNews && allNews.length > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(endIndex, allNews.length)} of {allNews.length} articles
            </p>
          )}
        </div>

        {/* Market News Section */}
        {isLoadingNews ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading market news...</p>
          </div>
        ) : currentNews.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentNews.map((news, index) => (
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    const showPage =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    const showEllipsis =
                      (page === currentPage - 2 && currentPage > 3) ||
                      (page === currentPage + 2 && currentPage < totalPages - 2);

                    if (showEllipsis) {
                      return <span key={page} className="px-2 py-2 text-gray-500">...</span>;
                    }

                    if (!showPage) return null;

                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-4 py-2 rounded-md transition-colors ${currentPage === page
                            ? "bg-blue-500 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">No market news available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
}
