export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

type Params = { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
  const sb = supabaseServer()
  const { data, error } = await sb
    .from('experiments')
    .select('id,nl_change,status,created_at,cohort_sql,param_patch,results')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  return NextResponse.json({
    id: data.id,
    name: data.nl_change,
    status: data.status,
    createdAt: data.created_at,
    cohort_sql: data.cohort_sql,
    param_patch: data.param_patch,
    results: data.results,
  })
}