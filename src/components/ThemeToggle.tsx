"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authFetch } from "@/lib/utils/auth-fetch";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { user, updateUserDarkMode } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync theme when user logs in or user.darkMode changes
  useEffect(() => {
    if (mounted && user && typeof user.darkMode === "boolean") {
      const userTheme = user.darkMode ? "dark" : "light";
      if (theme !== userTheme) {
        setTheme(userTheme);
      }
    }
  }, [user, mounted]);

  if (!mounted) {
    return <div className="w-9 h-9" />; // Placeholder to avoid layout shift
  }

  const handleToggleTheme = async () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    const isDark = nextTheme === "dark";

    setTheme(nextTheme);

    if (user) {
      updateUserDarkMode(isDark);
      try {
        await authFetch("/api/user/theme", {
          method: "PUT",
          body: JSON.stringify({ darkMode: isDark }),
        });
      } catch (err) {
        console.error("Failed to save theme preference to server:", err);
      }
    }
  };

  return (
    <button
      onClick={handleToggleTheme}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
}
