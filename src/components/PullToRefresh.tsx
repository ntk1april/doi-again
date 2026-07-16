"use client";

import PullToRefresh from "react-simple-pull-to-refresh";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PullToRefreshWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <PullToRefresh
      onRefresh={async () => {
        // Add a small delay to ensure loading state is visible
        await new Promise((resolve) => setTimeout(resolve, 500));
        window.location.reload();
      }}
      pullDownThreshold={70}
      maxPullDownDistance={130}
    >
      {children}
    </PullToRefresh>
  );
}
