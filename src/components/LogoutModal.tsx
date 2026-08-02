"use client";

import { useState } from "react";
import {
  LogOut,
  Heart,
  ArrowRight,
  X,
  TrendingDown,
  Sparkles,
} from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutModalProps) {
  const [showMeme, setShowMeme] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setShowMeme(false);
    onClose();
  };

  const handleCancelClick = () => {
    setShowMeme(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md bg-white/95 dark:bg-gray-900/95 border border-gray-200/80 dark:border-gray-800 rounded-3xl shadow-2xl p-5 sm:p-6 text-center overflow-hidden">
        {/* Subtle Ambient Glows */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-500/10 dark:bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {!showMeme ? (
          <div className="flex flex-col items-center">
            {/* Animated Icon Badge */}
            <div className="relative mb-5">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 opacity-30 blur-sm animate-pulse" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-500 dark:text-red-400 shadow-inner">
                <LogOut className="w-8 h-8 ml-0.5 text-red-500 dark:text-red-400" />
              </div>
            </div>

            {/* Header Text */}
            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
              Sign Out of Doi Again?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed max-w-xs">
              Are you sure you want to sign out? Your investment portfolio will
              be waiting for your return.
            </p>

            {/* Actions */}
            <div className="w-full space-y-3">
              {/* Confirm Sign Out */}
              <button
                onClick={onConfirm}
                className="w-full py-3.5 px-5 rounded-2xl font-bold text-white bg-gradient-to-r from-red-500 via-rose-500 to-red-600 hover:from-red-600 hover:to-rose-600 shadow-lg shadow-red-500/25 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                <span>Yes, I can&apos;t be here anymore!</span>
                <TrendingDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              </button>

              {/* Cancel / Stay */}
              <button
                onClick={handleCancelClick}
                className="w-full py-3.5 px-5 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600 hover:from-emerald-600 hover:to-green-600 shadow-lg shadow-emerald-500/25 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                <Heart className="w-4 h-4 fill-white/20 text-white group-hover:scale-110 transition-transform" />
                <span>No, I love red color!</span>
              </button>
            </div>
          </div>
        ) : (
          /* Meme / Easter Egg View */
          <div className="flex flex-col items-center animate-in fade-in duration-200 w-full">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Wise Choice!</span>
            </div>

            <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
              You really love red color! 🧠
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Can&apos;t lose money if you never sell!
            </p>

            <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-800 mb-6 bg-gray-100 dark:bg-gray-800">
              <img
                src="https://www.entrepreneur.com/wp-content/uploads/sites/2/2018/07/20180703190744-rollsafe-meme.jpeg?resize=800,450"
                alt="Roll Safe Meme"
                className="w-full h-48 object-cover"
              />
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3.5 px-5 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>Back to Portfolio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
