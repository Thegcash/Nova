import { NextResponse } from "next/server";
export function middleware(req: Request) {
  const url = new URL(req.url);
  if (process.env.NODE_ENV === "production" && url.pathname.startsWith("/api/dev/")) {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }
  return NextResponse.next();
}
export const config = { matcher: ["/api/dev/:path*"] };
