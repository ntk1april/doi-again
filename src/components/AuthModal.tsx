"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
}

type Mode = "signin" | "signup" | "forgot" | "otp" | "reset";

export default function AuthModal({ isOpen, onClose, initialMode = "signin" }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [verifiedOtp, setVerifiedOtp] = useState("");

  // For real-time password match indicator only
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Refs to read real DOM values (catches browser autofill that bypasses onChange)
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
        if (!email || !pw) { setError("Email and password are required"); return; }
        await signIn(email, pw);
        resetAll();
        onClose();

      } else if (mode === "signup") {
        const name = getVal(nameRef);
        const email = getVal(emailRef);
        const pw = passwordRef.current?.value ?? "";
        const cpw = confirmPasswordRef.current?.value ?? "";

        if (!name || !email || !pw) { setError("All fields are required"); return; }
        if (!email.includes("@") || !email.includes(".")) {
          setError("Please enter a valid email address");
          return;
        }
        if (pw.length < 6) { setError("Password must be at least 6 characters"); return; }
        if (pw !== cpw) { setError("Passwords do not match"); return; }

        await signUp(name, email, pw);
        resetAll();
        onClose();

      } else if (mode === "forgot") {
        const email = getVal(emailRef);
        if (!email || !email.includes("@")) { setError("Please enter a valid email address"); return; }

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
        if (otp.length !== 6) { setError("Please enter the 6-digit OTP"); return; }

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

        if (pw.length < 6) { setError("Password must be at least 6 characters"); return; }
        if (pw !== cpw) { setError("Passwords do not match"); return; }

        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: verifiedEmail, otp: verifiedOtp, newPassword: pw }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to reset password");
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
  const passwordsMismatch = confirmPassword !== "" && password !== confirmPassword;

  const titles: Record<Mode, { heading: string; sub: string }> = {
    signin: { heading: "Welcome Back!", sub: "Sign in to continue to Doi Again" },
    signup: { heading: "Create Account", sub: "Join Doi Again to track your investments" },
    forgot: { heading: "Forgot Password?", sub: "Enter your email to receive a 6-digit OTP" },
    otp: { heading: "Enter OTP", sub: `We sent a 6-digit code to ${verifiedEmail}` },
    reset: { heading: "Set New Password", sub: "Choose a new password for your account" },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4">
        {/* Close */}
        <button
          onClick={() => { resetAll(); setMode(initialMode); onClose(); }}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl"
        >✕</button>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{titles[mode].heading}</h2>
            <p className="text-gray-600 text-sm">{titles[mode].sub}</p>
          </div>

          {/* Step indicator */}
          {(mode === "forgot" || mode === "otp" || mode === "reset") && (
            <div className="flex items-center justify-center gap-2 mb-6">
              {[{ label: "Email", step: "forgot" }, { label: "OTP", step: "otp" }, { label: "Password", step: "reset" }].map((s, i, arr) => {
                const order = ["forgot", "otp", "reset"];
                const cur = order.indexOf(mode);
                const si = order.indexOf(s.step);
                return (
                  <div key={s.step} className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${si < cur ? "bg-green-500 text-white" : si === cur ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                      {si < cur ? "✓" : i + 1}
                    </div>
                    <span className={`text-xs font-medium ${si === cur ? "text-gray-900" : "text-gray-400"}`}>{s.label}</span>
                    {i < arr.length - 1 && <div className="w-6 h-px bg-gray-300" />}
                  </div>
                );
              })}
            </div>
          )}

          {/* Alerts */}
          {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
          {successMsg && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">{successMsg}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            {mode === "signup" && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  ref={nameRef}
                  id="name" name="name" type="text" required
                  autoComplete="name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 text-black"
                  placeholder="Nanthakorn Kaenkaew"
                />
              </div>
            )}

            {/* Email */}
            {(mode === "signin" || mode === "signup" || mode === "forgot") && (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  ref={emailRef}
                  id="email" name="email" type="text" required
                  autoComplete="email"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 text-black"
                  placeholder="nanthakorn@example.com"
                />
              </div>
            )}

            {/* OTP */}
            {mode === "otp" && (
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">6-Digit OTP</label>
                <input
                  ref={otpRef}
                  id="otp" name="otp" type="text" required
                  inputMode="numeric" maxLength={6} minLength={6}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-2xl font-bold tracking-widest focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-300 text-black"
                  placeholder="••••••"
                  onInput={(e) => {
                    const input = e.currentTarget;
                    input.value = input.value.replace(/\D/g, "").slice(0, 6);
                  }}
                />
                <p className="mt-1 text-xs text-gray-500">Check your email inbox (and spam folder)</p>
              </div>
            )}

            {/* Password */}
            {(mode === "signin" || mode === "signup" || mode === "reset") && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  {mode === "reset" ? "New Password" : "Password"}
                </label>
                <input
                  ref={passwordRef}
                  id="password" name="password" type="password" required
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  minLength={mode === "signin" ? 1 : 6}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-gray-400 text-black"
                  placeholder="••••••••"
                />
                {mode !== "signin" && (
                  <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
                )}
              </div>
            )}

            {/* Confirm Password */}
            {(mode === "signup" || mode === "reset") && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm {mode === "reset" ? "New " : ""}Password
                </label>
                <input
                  ref={confirmPasswordRef}
                  id="confirmPassword" name="confirmPassword" type="password" required
                  autoComplete="new-password"
                  minLength={6}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 placeholder-gray-400 text-black ${
                    passwordsMismatch
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                      : passwordsMatch
                      ? "border-green-400 focus:border-green-500 focus:ring-green-500/20"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                  placeholder="••••••••"
                />
                {passwordsMismatch && <p className="mt-1 text-xs text-red-500">Passwords do not match</p>}
                {passwordsMatch && <p className="mt-1 text-xs text-green-600">✓ Passwords match</p>}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-red-500 to-green-500 px-4 py-3 font-semibold text-white hover:from-red-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? "Loading..." : ({ signin: "Sign In", signup: "Create Account", forgot: "Send OTP", otp: "Verify OTP", reset: "Reset Password" } as Record<Mode, string>)[mode]}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center space-y-2">
            {mode === "signin" && (
              <>
                <p className="text-sm text-gray-600">
                  Don&apos;t have an account?{" "}
                  <button onClick={() => switchMode("signup")} className="font-semibold text-blue-500 hover:text-blue-700">Sign Up</button>
                </p>
                <p className="text-sm text-gray-600">
                  Forgot your password?{" "}
                  <button onClick={() => switchMode("forgot")} className="font-semibold text-orange-500 hover:text-orange-700">Reset Password</button>
                </p>
              </>
            )}
            {mode === "signup" && (
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button onClick={() => switchMode("signin")} className="font-semibold text-blue-500 hover:text-blue-700">Sign In</button>
              </p>
            )}
            {(mode === "forgot" || mode === "otp" || mode === "reset") && !successMsg && (
              <p className="text-sm text-gray-600">
                <button onClick={() => switchMode("signin")} className="font-semibold text-blue-500 hover:text-blue-700">← Back to Sign In</button>
              </p>
            )}
            {successMsg && (
              <button onClick={() => switchMode("signin")} className="mt-2 font-semibold text-blue-500 hover:text-blue-700 text-sm">
                Go to Sign In →
              </button>
            )}
            {mode === "otp" && (
              <p className="text-sm text-gray-500">
                Didn&apos;t receive it?{" "}
                <button
                  type="button"
                  onClick={async () => {
                    await fetch("/api/auth/send-otp", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email: verifiedEmail }),
                    });
                    setSuccessMsg("OTP resent!");
                    setTimeout(() => setSuccessMsg(""), 3000);
                  }}
                  className="font-semibold text-orange-500 hover:text-orange-700"
                >Resend OTP</button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
