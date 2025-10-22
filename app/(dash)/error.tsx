"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold text-[var(--ink)] mb-4">
          Something went wrong!
        </h2>
        <p className="text-[var(--ink-dim)] mb-6">
          We encountered an unexpected error. Please try again.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="btn-ghost"
          >
            Try again
          </button>
          <Link href="/fleet-overview" className="btn-ghost">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
