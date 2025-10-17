import ExperimentsClient from "@/components/ExperimentsClient";

async function getExperiments() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/experiments`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load experiments");
  return res.json();
}

export default async function ExperimentsPage() {
  const experiments = await getExperiments();
  return <ExperimentsClient initialExperiments={experiments} />;
}