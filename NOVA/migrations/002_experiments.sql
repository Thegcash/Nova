-- Nova 2.0 Rate Experiment Sandbox Schema
-- Run this migration in Supabase SQL Editor

-- exposures_daily: daily policy/unit exposure snapshot
create table if not exists exposures_daily (
  tenant_id uuid not null,
  dt date not null,
  policy_id uuid not null,
  unit_id uuid not null,
  product text not null,
  risk_vars jsonb not null,
  written_premium numeric not null,
  earned_premium numeric not null,
  exposure numeric not null default 1,
  primary key (tenant_id, dt, unit_id)
);

create index if not exists idx_exposures_tenant_dt on exposures_daily(tenant_id, dt);
create index if not exists idx_exposures_unit on exposures_daily(unit_id);
create index if not exists idx_exposures_policy on exposures_daily(policy_id);

-- losses: claims data
create table if not exists losses (
  tenant_id uuid not null,
  claim_id uuid primary key default gen_random_uuid(),
  unit_id uuid not null,
  policy_id uuid not null,
  dt date not null,
  incurred numeric not null default 0,
  paid numeric not null default 0,
  cause text,
  status text
);

create index if not exists idx_losses_tenant on losses(tenant_id);
create index if not exists idx_losses_unit on losses(unit_id);
create index if not exists idx_losses_policy_dt on losses(policy_id, dt);

-- guardrail_hits: ensure required columns
alter table guardrail_hits
  add column if not exists severity numeric,
  add column if not exists dt timestamptz,
  add column if not exists tenant_id uuid,
  add column if not exists unit_id uuid;

create index if not exists idx_guardrail_tenant_dt on guardrail_hits(tenant_id, dt);
create index if not exists idx_guardrail_unit on guardrail_hits(unit_id);

-- rate_plans: versioned rating parameters
create table if not exists rate_plans (
  tenant_id uuid not null,
  id uuid primary key default gen_random_uuid(),
  name text not null,
  params jsonb not null,
  status text not null check (status in ('draft','staging','active')),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_rate_plans_tenant on rate_plans(tenant_id);
create index if not exists idx_rate_plans_status on rate_plans(tenant_id, status);

-- experiments: pricing change backtests
create table if not exists experiments (
  tenant_id uuid not null,
  id uuid primary key default gen_random_uuid(),
  rate_plan_id uuid references rate_plans(id),
  nl_change text not null,
  cohort_sql text not null,
  param_patch jsonb not null,
  backtest_from date not null,
  backtest_to date not null,
  results jsonb,
  status text not null default 'running',
  created_by uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_experiments_tenant on experiments(tenant_id);
create index if not exists idx_experiments_created on experiments(tenant_id, created_at desc);

-- Performance rollup view
create or replace view vw_policy_performance as
select 
  e.tenant_id, 
  e.policy_id, 
  e.product,
  date_trunc('month', e.dt)::date as month,
  sum(e.written_premium) as written_premium,
  sum(e.earned_premium) as earned_premium,
  coalesce(sum(l.incurred), 0) as incurred,
  case 
    when sum(e.earned_premium) > 0
    then coalesce(sum(l.incurred), 0) / sum(e.earned_premium) 
  end as loss_ratio
from exposures_daily e
left join losses l
  on l.tenant_id = e.tenant_id 
  and l.policy_id = e.policy_id 
  and l.dt = e.dt
group by 1, 2, 3, 4;

-- RLS Policies (enable RLS on all tables)
alter table exposures_daily enable row level security;
alter table losses enable row level security;
alter table rate_plans enable row level security;
alter table experiments enable row level security;

-- RLS: tenant scoped SELECT
create policy "Tenant isolation for exposures_daily" on exposures_daily
  for select using (tenant_id = auth.jwt() -> 'app_metadata' ->> 'tenant_id'::uuid);

create policy "Tenant isolation for losses" on losses
  for select using (tenant_id = auth.jwt() -> 'app_metadata' ->> 'tenant_id'::uuid);

create policy "Tenant isolation for rate_plans" on rate_plans
  for all using (tenant_id = auth.jwt() -> 'app_metadata' ->> 'tenant_id'::uuid);

create policy "Tenant isolation for experiments" on experiments
  for all using (tenant_id = auth.jwt() -> 'app_metadata' ->> 'tenant_id'::uuid);


