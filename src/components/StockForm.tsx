/**
 * StockForm Component
 * Reusable form for adding a stock or buying/selling
 */

"use client";

import { useState, useEffect, useRef } from "react";
import StockLogo from "./StockLogo";

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
  const [suggestions, setSuggestions] = useState<{ symbol: string; name: string; logo: string }[]>([]);
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
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
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
      const response = await fetch(`/api/search-stocks?q=${encodeURIComponent(query)}`);
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
      setError("Units and price must be positive numbers");
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
        <label htmlFor="symbol" className="block text-sm font-bold text-gray-700">
          Stock Symbol
        </label>
        <div className="relative">
          <input
            id="symbol"
            type="text"
            value={symbol}
            onChange={(e) => handleSymbolChange(e.target.value)}
            onFocus={() => symbol.length > 0 && suggestions.length > 0 && setShowSuggestions(true)}
            readOnly={readOnlySymbol}
            placeholder="e.g., MSFT"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            disabled={isLoading || readOnlySymbol}
            autoComplete="off"
          />
          {searchLoading && (
            <div className="absolute right-3 top-3 text-gray-400">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 z-10 mt-1 rounded-md border border-gray-300 bg-white shadow-lg max-h-56 overflow-y-auto"
            >
              {suggestions.map((item) => (
                <button
                  key={item.symbol}
                  type="button"
                  onClick={() => selectSuggestion(item.symbol)}
                  className="w-full text-left px-3 py-3 hover:bg-blue-50 border-b border-gray-200 last:border-b-0 flex items-center gap-3"
                >
                  <StockLogo symbol={item.symbol} size="md" />
                  <div className="flex-1 min-w-0"
                    title={item.name}
                  >
                    <div className="font-medium text-black">{item.symbol}</div>
                    <div className="text-sm text-gray-500 truncate">{item.name}</div>
                  </div>
                  <button
                    onClick={(e) => handleRowClick(item.symbol, e)}
                    className="rounded-md bg-blue-600 px-1 py-1 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Details
                  </button>
                </button>
              ))}
            </div>
          )}
          {showSuggestions && symbol.length > 0 && suggestions.length === 0 && !searchLoading && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-md border border-gray-300 bg-white shadow-lg p-3 text-gray-500">
              No stocks found. Try another search.
            </div>
          )}
        </div>
      </div>

      {/* Units */}
      <div>
        <label htmlFor="units" className="block text-sm font-bold text-gray-700">
          Units
        </label>
        <input
          id="units"
          type="number"
          value={units}
          onChange={(e) => setUnits(e.target.value)}
          placeholder="e.g., 10"
          step="0.01"
          min="0"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          disabled={isLoading}
        />
      </div>

      {/* Price */}
      <div>
        <label htmlFor="price" className="block text-sm font-bold text-gray-700">
          Price (USD)
        </label>
        <input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="e.g., 150.50"
          step="0.01"
          min="0"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm text-black placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          disabled={isLoading}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? "Processing..." : submitLabel}
      </button>
    </form>
  );
}
