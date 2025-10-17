import AppShell from "@/components/AppShell";
export default function FilingsPage() {
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold mb-4">Filings</h1>
      <p className="opacity-70 text-sm">Manage filings TTL and exports here. (Wired to /api/filings/*)</p>
    </AppShell>
  );
}