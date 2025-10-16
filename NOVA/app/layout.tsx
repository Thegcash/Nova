import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nova 2.0 — Rate Experiment Sandbox",
  description: "Pricing OS for commercial insurance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-[#0f1720] antialiased">{children}</body>
    </html>
  );
}


