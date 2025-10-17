export default function NotFound() {
  return <main className="min-h-screen grid place-items-center">
    <div className="text-center space-y-2">
      <div className="text-3xl font-semibold">404</div>
      <div className="opacity-70">This page could not be found.</div>
      <a href="/experiments" className="inline-block mt-3 rounded-lg bg-black px-4 py-2 text-white">Go to Experiments</a>
    </div>
  </main>;
}
