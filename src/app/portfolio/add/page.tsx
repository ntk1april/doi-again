/**
 * Add Stock Page
 * Form to add a new stock to portfolio
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import StockForm, { FormData } from "@/components/StockForm";
import { ApiResponse } from "@/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import { authFetch } from "@/lib/utils/auth-fetch";

export default function AddStockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const symbolFromUrl = searchParams.get("symbol") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (formData: FormData) => {
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
        throw new Error(data.error || "Failed to add stock");
      }

      setSuccessMessage(`Successfully added ${formData.units} units of ${formData.symbol}!`);

      // Redirect to portfolio after 2 seconds
      setTimeout(() => {
        router.push("/portfolio");
      }, 2000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An error occurred");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Add Stock</h1>
            <p className="mt-2 text-gray-600">Add a new stock to your portfolio</p>
          </div>

          {/* Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {successMessage}
                <p className="mt-2 text-xs text-gray-600">Redirecting to portfolio...</p>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <StockForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              submitLabel="Add Stock"
              initialSymbol={symbolFromUrl}
            />

            {/* Back Link */}
            <div className="mt-4 text-center">
              <Link href="/portfolio" className="text-sm text-blue-600 hover:underline">
                Back to Portfolio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
