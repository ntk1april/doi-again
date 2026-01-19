/**
 * StockLogo Component
 * Displays stock logo with fallback chain: Profile logo → Finnhub → FMP → 2-letter symbol
 */

"use client";

import { useState, useEffect } from "react";
import { getStockLogo, getFallbackLogo, getLogoFromProfile } from "@/lib/utils/logos";

interface Props {
  symbol: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  profile?: any; // Optional: Finnhub profile data with logo field
}

export default function StockLogo({ symbol, size = "md", className = "", profile }: Props) {
  const [currentSource, setCurrentSource] = useState<"profile" | "primary" | "fallback" | "placeholder">("profile");

  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-12 w-12 text-base",
  };

  // Check if profile logo is available
  const profileLogo = profile ? getLogoFromProfile(profile) : null;

  // Set initial source based on profile availability
  useEffect(() => {
    if (profileLogo) {
      setCurrentSource("profile");
    } else {
      setCurrentSource("primary");
    }
  }, [profileLogo]);

  const handleError = () => {
    if (currentSource === "profile") {
      // Try primary logo
      setCurrentSource("primary");
    } else if (currentSource === "primary") {
      // Try fallback logo
      setCurrentSource("fallback");
    } else if (currentSource === "fallback") {
      // Use placeholder
      setCurrentSource("placeholder");
    }
  };

  const fallbackText = symbol.substring(0, 2).toUpperCase();

  // Show placeholder (2-letter symbol)
  if (currentSource === "placeholder") {
    return (
      <div
        className={`${sizeClasses[size]} ${className} flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-white shadow-sm`}
      >
        {fallbackText}
      </div>
    );
  }

  // Get appropriate logo URL
  let logoUrl: string;
  if (currentSource === "profile" && profileLogo) {
    logoUrl = profileLogo;
  } else if (currentSource === "primary") {
    logoUrl = getStockLogo(symbol);
  } else {
    logoUrl = getFallbackLogo(symbol);
  }

  return (
    <img
      src={logoUrl}
      alt={symbol}
      className={`${sizeClasses[size]} ${className} rounded-full object-cover bg-gray-100`}
      onError={handleError}
    />
  );
}
