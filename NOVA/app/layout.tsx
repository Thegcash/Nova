import "./globals.css";
export const metadata = { title: "Nova", description: "Nova Command Center" };
export const runtime = "nodejs"; // ensure Node runtime for server fetch
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}


