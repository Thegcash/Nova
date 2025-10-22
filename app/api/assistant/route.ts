import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
const BUCKET = new Map<string, { count: number; windowStart: number }>();
const LIMIT = 10;           // requests
const WINDOW_MS = 60_000;   // 1 minute

function allow(ip: string) {
  const now = Date.now();
  const rec = BUCKET.get(ip);
  if (!rec || now - rec.windowStart > WINDOW_MS) {
    BUCKET.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (rec.count < LIMIT) {
    rec.count += 1;
    return true;
  }
  return false;
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  if (!allow(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) return NextResponse.json({ error: "message is required" }, { status: 400 });

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
      temperature: 0.3,
    });

    const reply = completion.choices?.[0]?.message?.content ?? "No response from model.";
    return NextResponse.json({ reply });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "OpenAI error" }, { status: 500 });
  }
}
