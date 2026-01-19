"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

    // Redirect to portfolio
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

  const signOut = async () => {
    const result = await Swal.fire({
      title: "Are you sure you want to sign out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, i can't be here anymore!",
      cancelButtonText: "No, i love red color!",
      confirmButtonColor: "#F93827",
      cancelButtonColor: "#16C47F",
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "Signed out successfully!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      router.push("/");
    } else {
      Swal.fire({
        title: "You really love red color!",
        imageUrl: "https://www.entrepreneur.com/wp-content/uploads/sites/2/2018/07/20180703190744-rollsafe-meme.jpeg?resize=800,450",
        imageWidth: 400,
        imageHeight: 225,
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signUp, signOut }}>
      {children}
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
