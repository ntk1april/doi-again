"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import LogoutModal from "@/components/LogoutModal";
import LoginSuccessModal from "@/components/LoginSuccessModal";

interface User {
  id: string;
  email: string;
  name: string;
  darkMode?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => void;
  updateUserDarkMode: (darkMode: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLoginSuccessModal, setShowLoginSuccessModal] = useState(false);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const updateUserDarkMode = (darkMode: boolean) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, darkMode };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const signIn = async (email: string, password: string) => {
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to sign in");
    }

    // Store token and user
    localStorage.setItem("token", data.data.token);
    localStorage.setItem("user", JSON.stringify(data.data.user));

    setToken(data.data.token);
    setUser(data.data.user);

    // Show modern login success modal
    setShowLoginSuccessModal(true);
  };

  const handleLoginSuccessClose = () => {
    setShowLoginSuccessModal(false);
    router.push("/portfolio");
  };

  const signUp = async (email: string, password: string, name: string) => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to create account");
    }

    // Store token and user
    localStorage.setItem("token", data.data.token);
    localStorage.setItem("user", JSON.stringify(data.data.user));

    setToken(data.data.token);
    setUser(data.data.user);

    // Redirect to portfolio
    router.push("/portfolio");
  };

  const signOut = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setShowLogoutModal(false);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateUserDarkMode,
      }}
    >
      {children}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmSignOut}
      />
      <LoginSuccessModal
        isOpen={showLoginSuccessModal}
        onClose={handleLoginSuccessClose}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
