import AppShell from "@/components/AppShell";
export default function SettingsPage() {
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      <ul className="text-sm space-y-1 opacity-80">
        <li>SUPABASE_URL: {process.env.SUPABASE_URL ? "set" : "missing"}</li>
        <li>NEXT_PUBLIC_BASE_URL: {process.env.NEXT_PUBLIC_BASE_URL ?? "(unset)"}</li>
      </ul>
    </AppShell>
  );
}