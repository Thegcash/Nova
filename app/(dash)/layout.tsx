// app/(dash)/layout.tsx
"use client";

export default function DashLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}