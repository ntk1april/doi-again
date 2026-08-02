/**
 * Add Stock Page
 * Form to add a new stock to portfolio
 */

"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AddStockForm, { FormData } from "@/components/AddStockForm";
import { ApiResponse } from "@/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import { authFetch } from "@/lib/utils/auth-fetch";
import Swal from "sweetalert2";
import { ArrowLeft, PlusCircle, CheckCircle2 } from "lucide-react";

function AddStockContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const symbolFromUrl = searchParams.get("symbol") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (formData: FormData) => {
    const result = await Swal.fire({
      title: "Add Stock Position?",
      text: `You are about to add ${formData.units} shares of ${formData.symbol} at $${formData.price} each!`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, add position",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#10B981",
      cancelButtonColor: "#EF4444",
    });

    if (result.isConfirmed) {
      try {
        setIsLoading(true);
        setSuccessMessage("");
        setErrorMessage("");

        const response = await authFetch("/api/portfolio/stocks", {
          method: "POST",
          body: JSON.stringify({
            symbol: formData.symbol,
            units: formData.units,
            buyPrice: formData.price,
          }),
        });

        const data: ApiResponse = await response.json();

        if (!data.success) {
          Swal.fire({
            title: "Failed to add stock",
            text: data.error,
            icon: "error",
            confirmButtonText: "OK",
          });
          return;
        }

        setSuccessMessage(
          `Successfully added ${formData.units} shares of ${formData.symbol}!`
        );

        setTimeout(() => {
          router.push("/portfolio");
        }, 1500);
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "An error occurred"
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-500 shadow-inner">
              <PlusCircle className="w-6 h-6" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Add Stock Position
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Log a new buy order to your investment portfolio.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <span>{successMessage}</span>
                <p className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Redirecting to portfolio...
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl border border-red-200 dark:border-red-800/80 bg-red-50 dark:bg-red-950/50 text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <AddStockForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            submitLabel="Add Position"
            initialSymbol={symbolFromUrl}
          />

          {/* Back Link */}
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portfolio</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AddStockPage() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 flex items-center justify-center">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500">Loading...</p>
          </div>
        }
      >
        <AddStockContent />
      </Suspense>
    </ProtectedRoute>
  );
}
