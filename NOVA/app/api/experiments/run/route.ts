export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(req: Request) {
  const { id } = await req.json().catch(() => ({}))
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })
  const sb = supabaseServer()

  // running
  let r = await sb.from('experiments').update({ status: 'running' }).eq('id', id)
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })

  // simulate work
  await new Promise(res => setTimeout(res, 5000))

  // done + ROI
  const meta = { roi: Number((1 + Math.random()*2).toFixed(2)), incidents_avoided: Math.floor(Math.random()*10)+1 }
  r = await sb.from('experiments').update({ status: 'done', meta }).eq('id', id)
  if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })

  const { data } = await sb.from('experiments')
    .select('id,name,status,created_at,notes,meta').eq('id', id).single()
  return NextResponse.json({
    id: data?.id, name: data?.name, status: data?.status,
    createdAt: data?.created_at, notes: data?.notes, meta: data?.meta
  })
}
// Force redeploy
// Force new deployment
