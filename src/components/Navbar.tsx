"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import StockLogo from "./StockLogo";
import AuthModal from "./AuthModal";
import { authFetch } from "@/lib/utils/auth-fetch";
import Swal from "sweetalert2";
import {
  Menu,
  X,
  Search,
  LogOut,
  User as UserIcon,
  Briefcase,
  Bookmark,
  History,
  Newspaper,
  Loader2,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">(
    "signin",
  );
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const searchRef = useRef<HTMLDivElement>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
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
        const response = await fetch(
          `/api/search-stocks?q=${encodeURIComponent(searchQuery)}`,
        );
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

  const handleRowClick = (symbol: string, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a")) {
      return;
    }
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    router.push(`/stocks/${symbol}`);
  };

  const navLinks = [
    {
      href: "/portfolio",
      label: "Portfolio",
      icon: Briefcase,
      match: pathname === "/portfolio",
    },
    {
      href: "/wishlist",
      label: "Wishlist",
      icon: Bookmark,
      match: pathname?.startsWith("/wishlist"),
    },
    {
      href: "/transaction",
      label: "Transaction",
      icon: History,
      match: pathname === "/transaction",
    },
    {
      href: "/news",
      label: "News",
      icon: Newspaper,
      match: pathname === "/news",
    },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-r from-red-600/95 via-rose-600/95 to-emerald-600/95 dark:from-gray-950/95 dark:via-gray-900/95 dark:to-gray-950/95 border-b border-white/10 dark:border-gray-800/80 shadow-md transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6 sm:gap-8">
            <Link
              href={user ? "/portfolio" : "/"}
              className="flex items-center gap-2.5 group transition-transform duration-200 hover:scale-[1.02]"
            >
              <img
                src="/da.png"
                alt="Doi Again Logo"
                className="h-9 w-9 object-contain rounded-xl shadow-md border border-white/20 bg-white/10 backdrop-blur-md group-hover:rotate-6 transition-transform"
              />
              <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Doi Again
              </span>
            </Link>

            {/* Navigation Links - Only for authenticated users */}
            {user && (
              <div className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-black/10 dark:bg-white/5 backdrop-blur-md border border-white/10">
                {navLinks.map(({ href, label, icon: Icon, match }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                      match
                        ? "bg-white text-gray-900 shadow-md dark:bg-gray-800 dark:text-white"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div
            className="flex-1 min-w-0 max-w-xs sm:max-w-md mx-2"
            ref={searchRef}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/60 dark:text-gray-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                placeholder="Search stocks..."
                className="w-full rounded-2xl bg-white/20 dark:bg-gray-800/80 backdrop-blur-md pl-10 pr-10 py-2 text-xs sm:text-sm text-white dark:text-gray-100 placeholder-white/60 dark:placeholder-gray-400 border border-white/20 dark:border-gray-700/80 focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 dark:focus:bg-gray-800 dark:focus:text-gray-100 focus:outline-none focus:ring-2 focus:ring-white/40 shadow-inner transition-all"
                autoComplete="off"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-white/80 dark:text-gray-400" />
                </div>
              )}

              {/* Search Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl max-h-96 overflow-y-auto z-50 divide-y divide-gray-100 dark:divide-gray-800 animate-in fade-in duration-150">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.symbol}
                      onClick={(e) => handleRowClick(suggestion.symbol, e)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50/50 dark:hover:bg-gray-800/80 cursor-pointer transition-colors"
                    >
                      <StockLogo symbol={suggestion.symbol} size="md" />
                      <div className="flex-1 min-w-0" title={suggestion.name}>
                        <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                          {suggestion.symbol}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {suggestion.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Controls & Theme Toggle */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-3">
                {/* <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 dark:bg-white/5 border border-white/10 text-white text-xs font-semibold">
                  <UserIcon className="w-3.5 h-3.5 text-white/80" />
                  <span className="truncate max-w-[120px]">{user.name}</span>
                </div> */}
                <button
                  onClick={signOut}
                  className="flex items-center gap-1.5 rounded-xl bg-white/15 hover:bg-red-500/80 dark:bg-white/10 dark:hover:bg-red-500/80 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white transition-all shadow-sm active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            )}

            <div className="rounded-xl p-1 bg-white/10 dark:bg-white/5 border border-white/10">
              <ThemeToggle />
            </div>

            {/* Mobile Menu Button */}
            {user && (
              <div className="md:hidden">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="rounded-xl p-2 text-white hover:bg-white/20 transition-colors"
                  aria-label="Toggle Menu"
                >
                  {showMobileMenu ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {user && showMobileMenu && (
        <div className="md:hidden border-t border-white/10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col p-3 space-y-1">
            {navLinks.map(({ href, label, icon: Icon, match }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setShowMobileMenu(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  match
                    ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
            <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
              <button
                onClick={() => {
                  signOut();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
    </nav>
  );
}
