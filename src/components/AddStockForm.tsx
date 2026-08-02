/**
 * StockForm Component
 * Reusable form for adding a stock or buying/selling
 */

"use client";

import { useState, useEffect, useRef } from "react";
import StockLogo from "./StockLogo";
import { Search, Hash, DollarSign, Loader2, ArrowRight, ExternalLink } from "lucide-react";

interface Props {
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
  submitLabel?: string;
  initialSymbol?: string;
  readOnlySymbol?: boolean;
  children?: React.ReactNode;
}

export interface FormData {
  symbol: string;
  units: number;
  price: number;
  action?: "BUY" | "SELL";
}

export default function StockForm({
  onSubmit,
  isLoading,
  submitLabel = "Submit",
  initialSymbol = "",
  readOnlySymbol = false,
  children,
}: Props) {
  const [symbol, setSymbol] = useState(initialSymbol.toUpperCase());
  const [units, setUnits] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<
    { symbol: string; name: string; logo: string }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Update symbol when initialSymbol prop changes
  useEffect(() => {
    if (initialSymbol) {
      setSymbol(initialSymbol.toUpperCase());
    }
  }, [initialSymbol]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchStocks = async (query: string) => {
    if (!query.trim() || query.length < 1) {
      setSuggestions([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `/api/search-stocks?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSuggestions(data.results || []);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSymbolChange = (value: string) => {
    const upperValue = value.toUpperCase();
    setSymbol(upperValue);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (upperValue.length > 0) {
      debounceTimer.current = setTimeout(() => {
        searchStocks(upperValue);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleRowClick = (symbol: string, e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a")) {
      return;
    }
    window.location.href = `/stocks/${symbol}`;
  };

  const selectSuggestion = (sym: string) => {
    setSymbol(sym);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!symbol.trim() || !units || !price) {
      setError("All fields are required");
      return;
    }

    if (parseFloat(units) <= 0 || parseFloat(price) <= 0) {
      setError("Shares and price must be positive numbers");
      return;
    }

    try {
      await onSubmit({
        symbol: symbol.toUpperCase().trim(),
        units: parseFloat(units),
        price: parseFloat(price),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {children}

      {/* Symbol */}
      <div>
        <label
          htmlFor="symbol"
          className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-0.5"
        >
          Stock Symbol
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="symbol"
            type="text"
            value={symbol}
            onChange={(e) => handleSymbolChange(e.target.value)}
            onFocus={() =>
              symbol.length > 0 &&
              suggestions.length > 0 &&
              setShowSuggestions(true)
            }
            readOnly={readOnlySymbol}
            placeholder="e.g., AAPL, GOOGL, NVDA"
            className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 pl-10 pr-10 py-2.5 text-sm font-bold text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
            disabled={isLoading || readOnlySymbol}
            autoComplete="off"
          />
          {searchLoading && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            </div>
          )}

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 z-20 mt-2 rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 animate-in fade-in duration-150"
            >
              {suggestions.map((item) => (
                <div
                  key={item.symbol}
                  onClick={() => selectSuggestion(item.symbol)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50/50 dark:hover:bg-gray-800/80 cursor-pointer flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <StockLogo symbol={item.symbol} size="md" />
                    <div className="min-w-0" title={item.name}>
                      <div className="font-extrabold text-gray-900 dark:text-gray-100 text-sm">
                        {item.symbol}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.name}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(item.symbol, e);
                    }}
                    className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 transition-colors"
                  >
                    <span>Info</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showSuggestions &&
            symbol.length > 0 &&
            suggestions.length === 0 &&
            !searchLoading && (
              <div className="absolute top-full left-0 right-0 z-20 mt-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 shadow-xl">
                No matching stocks found.
              </div>
            )}
        </div>
      </div>

      {/* Shares */}
      <div>
        <label
          htmlFor="units"
          className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-0.5"
        >
          Number of Shares
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
            <Hash className="w-4 h-4" />
          </div>
          <input
            id="units"
            type="number"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            placeholder="e.g., 10"
            step="0.0000001"
            min="0"
            className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 pl-10 pr-4 py-2.5 text-sm font-bold text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Price */}
      <div>
        <label
          htmlFor="price"
          className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 ml-0.5"
        >
          Execution Price ($ USD)
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
            <DollarSign className="w-4 h-4" />
          </div>
          <input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., 150.50"
            step="0.0001"
            min="0"
            className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 pl-10 pr-4 py-2.5 text-sm font-bold text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-2xl border border-red-200 dark:border-red-800/80 bg-red-50 dark:bg-red-950/50 p-3 text-xs font-semibold text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-5 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <span>{submitLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
