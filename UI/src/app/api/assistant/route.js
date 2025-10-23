// @ts-nocheck
export const runtime = 'nodejs'; export const revalidate = 0; export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(req) {
  try {
    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'OPENAI_API_KEY not set' }, { status: 500 });

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'You are Nova, an insurance pricing & risk assistant.' },
        { role: 'user', content: prompt }
      ]
    });
    const text = completion.choices?.[0]?.message?.content || '';
    return NextResponse.json({ text });
  } catch (e) {
    return NextResponse.json({ error: 'Assistant failed', detail: String(e) }, { status: 500 });
  }
}