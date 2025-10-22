import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="text-center p-8">
        <h2 className="text-2xl font-semibold text-[var(--ink)] mb-4">
          Page not found
        </h2>
        <p className="text-[var(--ink-dim)] mb-6">
          The page you're looking for doesn't exist.
        </p>
        <Link href="/fleet-overview" className="btn-ghost">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
