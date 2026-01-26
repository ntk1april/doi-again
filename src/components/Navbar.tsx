"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import StockLogo from "./StockLogo";
import AuthModal from "./AuthModal";
import { authFetch } from "@/lib/utils/auth-fetch";
import Swal from "sweetalert2";
import { Menu, X } from "lucide-react";

interface StockSuggestion {
  symbol: string;
  name: string;
}

export default function Navbar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const searchRef = useRef<HTMLDivElement>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setShowActionMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search for stocks
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search-stocks?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();

        if (data.results && Array.isArray(data.results)) {
          setSuggestions(data.results.slice(0, 8));
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Error searching stocks:", err);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleAddToPortfolio = (symbol: string) => {
    if (!user) {
      setAuthModalMode("signin");
      setShowAuthModal(true);
      return;
    }
    setShowActionMenu(null);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    router.push(`/portfolio/add?symbol=${symbol}`);
  };

  const handleAddToWishlist = async (symbol: string) => {
    if (!user) {
      setAuthModalMode("signin");
      setShowAuthModal(true);
      return;
    }

    try {
      const response = await authFetch("/api/wishlist", {
        method: "POST",
        body: JSON.stringify({ symbol }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          title: `${symbol} added to wishlist!`,
          icon: "success",
          draggable: true,
          showConfirmButton: false,
          timer: 1500,
        }).then(() => {
          if (pathname === "/wishlist") {
            window.location.reload();
          }
        });
        setShowActionMenu(null);
        setSearchQuery("");
        setSuggestions([]);
        setShowSuggestions(false);
      } else {
        Swal.fire({
          title: "Failed to add to wishlist",
          text: data.error,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      Swal.fire({
        title: "Failed to add to wishlist",
        text: err instanceof Error ? err.message : "An error occurred",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleViewDetails = (symbol: string) => {
    setShowActionMenu(null);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    router.push(`/stocks/${symbol}`);
  };

  const handleRowClick = (symbol: string, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a")) {
      return;
    }
    setShowActionMenu(null);
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    router.push(`/stocks/${symbol}`);
  };

  // Show navbar on all pages now (no signin/signup pages to hide it on)
  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-red-500 to-green-500 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href={user ? "/portfolio" : "/"} className="flex items-center gap-2">
              <div className="text-2xl font-bold text-white">📉</div>
              <span className="text-xl font-bold text-white hidden sm:block">Doy Again</span>
            </Link>

            {/* Navigation Links - Only for authenticated users */}
            {user && (
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="/portfolio"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === "/portfolio"
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  Portfolio 💼
                </Link>
                <Link
                  href="/wishlist"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname?.startsWith("/wishlist")
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  Wishlist 🔖
                </Link>
                <Link
                  href="/history"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === "/portfolio/history"
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  History 📜
                </Link>
                <Link
                  href="/news"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === "/news"
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  News 📰
                </Link>
              </div>
            )}
          </div>

          {/* Search Bar - Available for everyone */}
          <div className="flex-1 max-w-md mx-4" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                placeholder="Search stocks..."
                className="w-full rounded-lg bg-white/90 px-4 py-2 pr-10 text-gray-900 placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-white/50"
                autoComplete="off"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                </div>
              )}

              {/* Search Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-gray-200 bg-white shadow-xl max-h-96 overflow-y-auto">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.symbol}
                      className="relative border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                        <StockLogo symbol={suggestion.symbol} size="md" />
                        <div className="flex-1 min-w-0"
                          onClick={(e) => handleRowClick(suggestion.symbol, e)}
                          title={suggestion.name}
                        >
                          <div className="font-semibold text-gray-900">{suggestion.symbol}</div>
                          <div className="text-sm text-gray-600 truncate">{suggestion.name}</div>
                        </div>
                        <button
                          onClick={() => setShowActionMenu(showActionMenu === suggestion.symbol ? null : suggestion.symbol)}
                          className="rounded-md bg-blue-500 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Actions ▼
                        </button>
                      </div>

                      {/* Action Menu */}
                      {showActionMenu === suggestion.symbol && (
                        <div className="absolute right-4 top-full mt-1 w-48 rounded-md border border-gray-200 bg-white shadow-lg z-10">
                          <button
                            onClick={() => handleAddToPortfolio(suggestion.symbol)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 border-b border-gray-100"
                          >
                            📊 Add to Portfolio
                          </button>
                          <button
                            onClick={() => handleAddToWishlist(suggestion.symbol)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 border-b border-gray-100"
                          >
                            ⭐ Add to Wishlist
                          </button>
                          <button
                            onClick={() => handleViewDetails(suggestion.symbol)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            🔍 View Details
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Menu or Auth Buttons */}
          {user ? (
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-sm text-white/90">
                {user.name}
              </span>
              <button
                onClick={signOut}
                className="rounded-md bg-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/30 transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setAuthModalMode("signin");
                  setShowAuthModal(true);
                }}
                className="rounded-md bg-white/20 px-4 py-2 text-sm font-medium text-white hover:bg-white/30 transition-colors"
              >
                Sign In
              </button>
            </div>
          )}

          {/*Mobile menu*/}
          <div className="md:hidden">
            {user && (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="rounded-md p-2 text-white hover:bg-white/20 transition-colors"
              >
                {showMobileMenu ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            )}
            {/* Mobile menu */}
            {user && showMobileMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-gray-200 bg-white shadow-xl max-h-96 overflow-y-auto">
                {/* Mobile menu links */}
                <div className="flex flex-col gap-2 p-4">
                  <Link
                    href="/portfolio"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === "/portfolio"
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    Portfolio
                  </Link>
                  <Link
                    href="/wishlist"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === "/wishlist"
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    Wishlist
                  </Link>
                  <Link
                    href="/history"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === "/history"
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    History
                  </Link>
                  <Link
                    href="/news"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === "/news"
                      ? "bg-blue-500 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    News
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
    </nav>
  );
}
