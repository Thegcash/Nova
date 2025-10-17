export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

async function logStep(sb: ReturnType<typeof supabaseServer>, experimentId: string, step: string, detail: string, ms?: number) {
  await sb.from('experiment_logs').insert({ experiment_id: experimentId, step, detail, ms: ms ?? null });
}

export async function POST(req: Request) {
  const { id } = await req.json().catch(() => ({}))
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })
  const sb = supabaseServer()

  await logStep(sb, id, 'start', 'received request')

  // running
  let r = await sb.from('experiments').update({ status: 'running' }).eq('id', id)
  if (r.error) {
    await logStep(sb, id, 'error', r.error.message)
    return NextResponse.json({ error: r.error.message }, { status: 500 })
  }
  await logStep(sb, id, 'status', 'set to running')

  // simulate work
  const t0 = Date.now()
  await new Promise(res => setTimeout(res, 5000))
  const workMs = Date.now() - t0
  await logStep(sb, id, 'work', 'simulated processing', workMs)

  // done + ROI
  const meta = { roi: Number((1 + Math.random()*2).toFixed(2)), incidents_avoided: Math.floor(Math.random()*10)+1 }
  r = await sb.from('experiments').update({ status: 'done', meta }).eq('id', id)
  if (r.error) {
    await logStep(sb, id, 'error', r.error.message)
    return NextResponse.json({ error: r.error.message }, { status: 500 })
  }
  await logStep(sb, id, 'status', 'set to done')

  const { data: final } = await sb
    .from('experiments')
    .select('id,nl_change,status,created_at,notes,meta')
    .eq('id', id).single()

  // richer payload (no more {})
  return NextResponse.json({
    id,
    name: final?.nl_change ?? null,
    status: final?.status ?? 'done',
    createdAt: final?.created_at ?? null,
    notes: final?.notes ?? null,
    meta: final?.meta ?? {}
  })
}
// Force rebuild: $(date +%s)
