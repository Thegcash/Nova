import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  const sb = supabaseServer()
  const { data, error } = await sb
    .from('experiments')
    .select('id,nl_change,created_at')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const rows = (data ?? []).map(r => ({
    id: r.id,
    name: r.nl_change || `Experiment ${r.id.slice(0, 6)}`,
    status: 'queued', // hardcode for now
    createdAt: r.created_at,
  }))
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any))
  const nl_change = (body?.name && String(body.name).trim()) || 'Untitled Backtest'

  const sb = supabaseServer()
  // First try to get an existing rate_plan_id
  const { data: ratePlan } = await sb
    .from('rate_plans')
    .select('id')
    .limit(1)
    .single()

  const { data, error } = await sb
    .from('experiments')
    .insert({ 
      tenant_id: '00000000-0000-0000-0000-000000000001', // default tenant for now
      rate_plan_id: ratePlan?.id || null, // use existing rate plan or null
      nl_change, 
      cohort_sql: 'SELECT 1', // placeholder
      param_patch: {}, 
      backtest_from: '2025-01-01',
      backtest_to: '2025-01-31',
      created_by: '00000000-0000-0000-0000-000000000001' // default user
    })
    .select('id,nl_change,created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(
    {
      id: data.id,
      name: data.nl_change,
      status: 'queued',
      createdAt: data.created_at,
    },
    { status: 201 }
  )
}