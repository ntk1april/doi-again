"use client";

import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, X } from "lucide-react";

interface LoginSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginSuccessModal({
  isOpen,
  onClose,
}: LoginSuccessModalProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isOpen) {
      setProgress(100);
      return;
    }

    const duration = 3000;
    const intervalTime = 30;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md bg-white/95 dark:bg-gray-900/95 border border-gray-200/80 dark:border-gray-800 rounded-3xl shadow-2xl p-5 sm:p-6 text-center overflow-hidden">
        {/* Subtle Ambient Background Glows */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-500/10 dark:bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge Header */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Welcome Back!</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mb-2">
            Are you ready to see your portfolio? 🙈
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Brace yourself for the red colors...
          </p>

          {/* Meme Image Container */}
          <div className="w-full rounded-2xl overflow-hidden border border-gray-200/80 dark:border-gray-800 shadow-lg mb-4 bg-gray-100 dark:bg-gray-800 relative group">
            <img
              src="https://lede-admin.dailydot.com/wp-content/uploads/sites/69/2025/01/dog-closing-eyes-meme-1.png?w=1170&quality=75"
              alt="Dog Closing Eyes Meme"
              className="w-full h-48 sm:h-52 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden mb-4">
            <div
              className="bg-gradient-to-r from-red-500 via-rose-500 to-emerald-500 h-full transition-all duration-75 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Manual Action Button */}
          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/20 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>Take Me to Portfolio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
