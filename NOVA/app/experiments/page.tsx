import ExperimentsClient from "@/components/ExperimentsClient";
import AppShell from "@/components/AppShell";

export default function ExperimentsPage() {
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold mb-4">Experiments</h1>
      <ExperimentsClient initialExperiments={[]} />
    </AppShell>
  );
}