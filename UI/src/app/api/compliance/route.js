// @ts-nocheck
export const runtime = 'nodejs'; export const revalidate = 0; export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    const policies = await query('select id,name,status,jurisdiction from compliance_policies limit 100');
    const tasks = await query('select id,title,state,assignee,updated_at from compliance_tasks order by updated_at desc limit 100');
    return NextResponse.json({ policies: policies.rows || [], tasks: tasks.rows || [] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}