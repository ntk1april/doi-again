"use client";

import { useEffect, useState } from "react";

/**
 * NetworkStatusBanner
 * Shows a banner when offline. When the device comes back online,
 * it automatically reloads the page so the app recovers without
 * the user needing to manually close & reopen the app.
 */
export default function NetworkStatusBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    const handleOnline = () => {
      setIsOnline(true);
      // If we were offline before, auto-reload to re-fetch all data
      if (wasOffline) {
        setReloading(true);
        // Short delay so user can see the "Back online!" message
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [wasOffline]);

  // Don't render anything if we're online and were never offline
  if (isOnline && !reloading) return null;

  if (reloading) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-2 bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-md animate-pulse">
        <span>✅ Back online! Refreshing...</span>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between gap-2 bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md">
      <span className="flex items-center gap-2">
        <span>📵</span>
        <span>No internet connection. The app will reload automatically when you're back online.</span>
      </span>
      <button
        onClick={() => window.location.reload()}
        className="flex-shrink-0 rounded-md bg-white/20 px-3 py-1 text-xs font-bold hover:bg-white/30 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}
