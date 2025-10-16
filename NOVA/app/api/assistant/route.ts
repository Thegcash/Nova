import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { message } = await req.json().catch(() => ({ message: '' }))
  if (!message) return NextResponse.json({ error: 'missing message' }, { status: 400 })

  // Minimal chat completion
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are Nova assistant. Be concise and specific to pricing experiments, filings, ROI.' },
        { role: 'user', content: message }
      ],
      temperature: 0.2,
    }),
  })

  if (!r.ok) {
    const t = await r.text().catch(()=>'')
    return NextResponse.json({ error: `OpenAI error ${r.status}`, detail: t }, { status: 500 })
  }
  const data = await r.json()
  const content = data.choices?.[0]?.message?.content ?? ''
  return NextResponse.json({ reply: content })
}
