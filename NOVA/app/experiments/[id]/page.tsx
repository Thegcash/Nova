"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * Dynamic route: /experiments/[id]
 * Redirects to main experiments page with route state
 * (or implement standalone results view here if needed)
 */
export default function ExperimentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const experimentId = params?.id as string;

  useEffect(() => {
    if (!experimentId) return;
    // Redirect to main page with experiment ID in URL params
    // This allows the main page to handle the detail view
    router.push(`/experiments?id=${experimentId}&view=detail`);
  }, [experimentId, router]);

  return (
    <div className="min-h-screen bg-white grid place-items-center">
      <div className="text-center">
        <div className="text-sm text-gray-600">Loading experiment...</div>
      </div>
    </div>
  );
}


