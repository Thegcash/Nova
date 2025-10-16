import "../globals.css";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      <div className="flex">
        {/* Left Navigation Rail */}
        <aside className="w-[256px] shrink-0 border-r bg-white/95 backdrop-blur sticky top-0 h-screen hidden md:flex flex-col">
          <div className="px-4 py-3 border-b flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-black text-white grid place-items-center font-bold">N</div>
            <div className="font-semibold">Nova</div>
          </div>
          <nav className="p-3 space-y-1 text-sm">
            <div className="text-[11px] uppercase tracking-wider text-gray-500 px-3 mb-1">Pages</div>
            <Link className="block px-3 py-2 rounded-lg hover:bg-gray-50" href="/fleet-overview">Fleet Overview</Link>
            <Link className="block px-3 py-2 rounded-lg hover:bg-gray-50" href="/map-live-ops">Map & Live Ops</Link>
            <Link className="block px-3 py-2 rounded-lg hover:bg-gray-50" href="/playback">Playback</Link>
            <Link className="block px-3 py-2 rounded-lg hover:bg-gray-50" href="/ingestion">Data Ingestion</Link>
            <Link className="block px-3 py-2 rounded-lg hover:bg-gray-50" href="/reduce-cost">Reduce Cost</Link>
          </nav>
          <div className="mt-auto p-3 border-t text-xs text-gray-600">
            Shortcuts: G/J/K/Space
          </div>
        </aside>

        {/* Page content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}

