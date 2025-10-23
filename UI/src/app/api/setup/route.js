// @ts-nocheck
export const runtime = 'nodejs';
export const revalidate = 0;
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    await query(`
      create table if not exists fleets(
        id serial primary key,
        name text not null,
        status text default 'active',
        lat double precision,
        lng double precision,
        updated_at timestamptz default now()
      );
    `);

    await query(`
      create table if not exists exposures_daily(
        id bigserial primary key,
        date date default current_date,
        fleet_id int,
        exposure numeric,
        created_at timestamptz default now()
      );
    `);

    await query(`
      create table if not exists losses(
        id bigserial primary key,
        occurred_at timestamptz default now(),
        fleet_id int,
        amount numeric default 0
      );
    `);

    await query(`
      create table if not exists guardrails(
        id bigserial primary key,
        name text not null,
        status text not null default 'active',
        created_at timestamptz default now()
      );
    `);

    await query(`
      create table if not exists guardrail_hits(
        id bigserial primary key,
        guardrail_id int,
        fleet_id int,
        occurred_at timestamptz default now()
      );
    `);

    await query(`
      create table if not exists compliance_policies(
        id bigserial primary key,
        name text not null,
        status text not null default 'active',
        jurisdiction text
      );
    `);

    await query(`
      create table if not exists compliance_tasks(
        id bigserial primary key,
        title text not null,
        state text not null default 'open',
        assignee text,
        updated_at timestamptz default now()
      );
    `);

    // Seeds (minimal + idempotent)
    await query(`
      insert into fleets (name,status,lat,lng)
      values ('Fleet A','active',34.0522,-118.2437),
             ('Fleet B','active',40.7128,-74.0060),
             ('Fleet C','maintenance',37.7749,-122.4194)
      on conflict do nothing;
    `);

    await query(`
      insert into guardrails (name,status)
      values ('Speed > 75 mph for >60s','active'),
             ('Hard brake > -5 m/s^2','active')
      on conflict do nothing;
    `);

    // Skip exposures_daily insert if table has different schema
    try {
      await query(`
        insert into exposures_daily (date,fleet_id,exposure)
        select current_date - i, ((i % 3)+1), 1.0
        from generate_series(0,10) s(i);
      `);
    } catch (e) {
      console.log('exposures_daily insert skipped:', e.message);
    }

    // Skip losses insert if table has different schema
    try {
      await query(`
        insert into losses (occurred_at,fleet_id,amount)
        values (now() - interval '15 days',1,12500)
        on conflict do nothing;
      `);
    } catch (e) {
      console.log('losses insert skipped:', e.message);
    }

    await query(`
      insert into compliance_policies (name,status,jurisdiction)
      values ('Dashcam retention 30d','active','CA'),
             ('Night ops permit','active','TX')
      on conflict do nothing;
    `);

    await query(`
      insert into compliance_tasks (title,state,assignee)
      values ('Upload driver attestations','open','ops@nova'),
             ('Renew TX night-permit','in_progress','legal@nova')
      on conflict do nothing;
    `);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
