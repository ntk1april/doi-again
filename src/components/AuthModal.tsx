"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
}

type Mode = "signin" | "signup" | "forgot" | "otp" | "reset";

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "signin",
}: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [verifiedOtp, setVerifiedOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // For real-time password match indicator only
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Refs to read real DOM values
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const resetAll = () => {
    setError("");
    setSuccessMsg("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    resetAll();
  };

  const getVal = (ref: React.RefObject<HTMLInputElement | null>) =>
    ref.current?.value?.trim() ?? "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      if (mode === "signin") {
        const email = getVal(emailRef);
        const pw = passwordRef.current?.value ?? "";
        if (!email || !pw) {
          setError("Email and password are required");
          return;
        }
        await signIn(email, pw);
        resetAll();
        onClose();
      } else if (mode === "signup") {
        const name = getVal(nameRef);
        const email = getVal(emailRef);
        const pw = passwordRef.current?.value ?? "";
        const cpw = confirmPasswordRef.current?.value ?? "";

        if (!name || !email || !pw) {
          setError("All fields are required");
          return;
        }
        if (!email.includes("@") || !email.includes(".")) {
          setError("Please enter a valid email address");
          return;
        }
        if (pw.length < 6) {
          setError("Password must be at least 6 characters");
          return;
        }
        if (pw !== cpw) {
          setError("Passwords do not match");
          return;
        }

        await signUp(email, pw, name);
        resetAll();
        onClose();
      } else if (mode === "forgot") {
        const email = getVal(emailRef);
        if (!email || !email.includes("@")) {
          setError("Please enter a valid email address");
          return;
        }

        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to send OTP");
        setVerifiedEmail(email);
        switchMode("otp");
      } else if (mode === "otp") {
        const otp = getVal(otpRef);
        if (otp.length !== 6) {
          setError("Please enter the 6-digit OTP");
          return;
        }

        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: verifiedEmail, otp }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Invalid OTP");
        setVerifiedOtp(otp);
        switchMode("reset");
      } else if (mode === "reset") {
        const pw = passwordRef.current?.value ?? "";
        const cpw = confirmPasswordRef.current?.value ?? "";

        if (pw.length < 6) {
          setError("Password must be at least 6 characters");
          return;
        }
        if (pw !== cpw) {
          setError("Passwords do not match");
          return;
        }

        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: verifiedEmail,
            otp: verifiedOtp,
            newPassword: pw,
          }),
        });
        const data = await res.json();
        if (!data.success)
          throw new Error(data.error || "Failed to reset password");
        setSuccessMsg("Password reset successfully! You can now sign in.");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch = confirmPassword !== "" && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword !== "" && password !== confirmPassword;

  const titles: Record<Mode, { heading: string; sub: string }> = {
    signin: {
      heading: "Welcome Back",
      sub: "Sign in to access your portfolio dashboard",
    },
    signup: {
      heading: "Create Account",
      sub: "Start tracking your stocks with Doi Again",
    },
    forgot: {
      heading: "Reset Password",
      sub: "Enter your email to receive a 6-digit OTP",
    },
    otp: {
      heading: "Verify OTP Code",
      sub: `Enter code sent to ${verifiedEmail}`,
    },
    reset: {
      heading: "Create New Password",
      sub: "Choose a strong password to secure your account",
    },
  };

  const isTabMode = mode === "signin" || mode === "signup";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md bg-white/95 dark:bg-gray-900/95 border border-gray-200/80 dark:border-gray-800 rounded-3xl shadow-2xl p-5 sm:p-6 overflow-hidden">
        {/* Ambient Background Gradients */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-red-500/10 to-green-500/10 dark:from-red-500/20 dark:to-green-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            resetAll();
            setMode(initialMode);
            onClose();
          }}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-4">
          <div className="border-2 rounded-xl border-red-400 dark:border-gray-700">
            {/* <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white dark:bg-gray-900 text-lg">
              📉
            </div> */}
            <img
              src="/da.png"
              alt="Doi Again Logo"
              className="h-10 w-10 object-contain rounded-xl shadow-md border border-white/20 bg-white/10 backdrop-blur-md group-hover:rotate-6 transition-transform"
            />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            {titles[mode].heading}
          </h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {titles[mode].sub}
          </p>
        </div>

        {/* Mode Switcher Tabs for Signin / Signup */}
        {isTabMode && (
          <div className="mb-4 flex p-1 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-gray-200/60 dark:border-gray-700/60">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                mode === "signin"
                  ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                mode === "signup"
                  ? "bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Password Recovery Step Progress */}
        {!isTabMode && (
          <div className="flex items-center justify-center gap-2 mb-4">
            {[
              { label: "Email", step: "forgot" },
              { label: "OTP", step: "otp" },
              { label: "Password", step: "reset" },
            ].map((s, i, arr) => {
              const order = ["forgot", "otp", "reset"];
              const cur = order.indexOf(mode);
              const si = order.indexOf(s.step);
              return (
                <div key={s.step} className="flex items-center gap-1.5">
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold transition-all ${
                      si < cur
                        ? "bg-emerald-500 text-white"
                        : si === cur
                        ? "bg-blue-500 text-white ring-2 ring-blue-500/20"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {si < cur ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-[11px] font-bold ${
                      si === cur
                        ? "text-gray-900 dark:text-gray-100"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {s.label}
                  </span>
                  {i < arr.length - 1 && (
                    <div className="w-4 h-0.5 bg-gray-200 dark:bg-gray-700" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-3 flex items-center gap-2 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 text-xs font-semibold text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-3 flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Full Name */}
          {mode === "signup" && (
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 ml-0.5"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  ref={nameRef}
                  id="name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 pl-9 pr-3 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="e.g. Nanthakorn Kaenkaew"
                />
              </div>
            </div>
          )}

          {/* Email */}
          {(mode === "signin" || mode === "signup" || mode === "forgot") && (
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 ml-0.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  ref={emailRef}
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 pl-9 pr-3 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="nanthakorn@example.com"
                />
              </div>
            </div>
          )}

          {/* OTP */}
          {mode === "otp" && (
            <div>
              <label
                htmlFor="otp"
                className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 ml-0.5"
              >
                6-Digit OTP Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  ref={otpRef}
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  minLength={6}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 pl-9 pr-3 py-2 text-center text-lg font-extrabold tracking-widest text-gray-900 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="••••••"
                  onInput={(e) => {
                    const input = e.currentTarget;
                    input.value = input.value.replace(/\D/g, "").slice(0, 6);
                  }}
                />
              </div>
            </div>
          )}

          {/* Password */}
          {(mode === "signin" || mode === "signup" || mode === "reset") && (
            <div>
              <div className="flex items-center justify-between mb-1 ml-0.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-gray-700 dark:text-gray-300"
                >
                  {mode === "reset" ? "New Password" : "Password"}
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete={
                    mode === "signin" ? "current-password" : "new-password"
                  }
                  minLength={mode === "signin" ? 1 : 6}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 pl-9 pr-9 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-end mt-2 mr-0.5">
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="text-[11px] font-extrabold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    Forgot?
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Confirm Password */}
          {(mode === "signup" || mode === "reset") && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1 ml-0.5"
              >
                Confirm {mode === "reset" ? "New " : ""}Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <input
                  ref={confirmPasswordRef}
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  minLength={6}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full rounded-xl border bg-gray-50/50 dark:bg-gray-800/50 pl-9 pr-9 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                    passwordsMismatch
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                      : passwordsMatch
                      ? "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                      : "border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {passwordsMismatch && (
                <p className="mt-1 ml-1 text-[11px] font-semibold text-red-500">
                  Passwords do not match
                </p>
              )}
              {passwordsMatch && (
                <p className="mt-1 ml-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  ✓ Passwords match
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-red-500 via-rose-500 to-emerald-500 hover:from-red-600 hover:to-emerald-600 shadow-md shadow-emerald-500/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>
                  {
                    (
                      {
                        signin: "Sign In",
                        signup: "Create Account",
                        forgot: "Send OTP Code",
                        otp: "Verify Code",
                        reset: "Reset Password",
                      } as Record<Mode, string>
                    )[mode]
                  }
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation Links */}
        <div className="mt-4 text-center space-y-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
          {mode === "signin" && (
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => switchMode("signup")}
                className="font-bold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Sign Up
              </button>
            </p>
          )}
          {mode === "signup" && (
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <button
                onClick={() => switchMode("signin")}
                className="font-bold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Sign In
              </button>
            </p>
          )}
          {(mode === "forgot" || mode === "otp" || mode === "reset") &&
            !successMsg && (
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                <button
                  onClick={() => switchMode("signin")}
                  className="font-bold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  ← Back to Sign In
                </button>
              </p>
            )}
          {successMsg && (
            <button
              onClick={() => switchMode("signin")}
              className="font-bold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-xs transition-colors"
            >
              Go to Sign In →
            </button>
          )}
          {mode === "otp" && (
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">
              Didn&apos;t receive it?{" "}
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/auth/send-otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: verifiedEmail }),
                  });
                  setSuccessMsg("OTP code resent!");
                  setTimeout(() => setSuccessMsg(""), 3000);
                }}
                className="font-bold text-amber-500 hover:text-amber-600 transition-colors"
              >
                Resend OTP
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
