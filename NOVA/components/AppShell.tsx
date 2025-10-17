"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/experiments", label: "Experiments" },
  { href: "/filings", label: "Filings" },
  { href: "/settings", label: "Settings" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen grid md:grid-cols-[220px_1fr]">
      <aside className="hidden md:block border-r p-4">
        <div className="text-lg font-semibold mb-4">Nova 2.0</div>
        <nav className="space-y-1">
          {tabs.map(t => {
            const active = pathname.startsWith(t.href);
            return (
              <Link key={t.href} href={t.href}
                className={`block rounded-md px-3 py-2 text-sm ${active ? "bg-black text-white" : "hover:bg-gray-100"}`}>
                {t.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex flex-col">
        <header className="border-b p-4 flex items-center justify-between">
          <div className="md:hidden font-semibold">Nova 2.0</div>
          <div className="text-sm opacity-70">Production</div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
