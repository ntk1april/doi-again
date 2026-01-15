"use client";

import { useEffect, useState } from "react";

export default function NewsPage() {
  const [marketNews, setMarketNews] = useState<any[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);

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
        setMarketNews(data.data.slice(0, 18)); // Show top 18 news
      }
    } catch (err) {
      console.error("Error fetching market news:", err);
    } finally {
      setIsLoadingNews(false);
    }
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
        </div>

        {/* Market News Section */}
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
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">No market news available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
}
