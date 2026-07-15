"use client";

import PullToRefresh from "react-simple-pull-to-refresh";
import { useRouter } from "next/navigation";

export default function PullToRefreshWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <PullToRefresh
      onRefresh={async () => {
        router.refresh();
      }}
    >
      {children}
    </PullToRefresh>
  );
}
