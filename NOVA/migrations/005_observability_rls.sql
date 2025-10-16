-- 1) Log table
create table if not exists public.experiment_logs (
  tenant_id uuid not null,
  experiment_id uuid not null,
  step text not null,          -- e.g., "run_backtest/materialize_cohort"
  detail jsonb,                -- arbitrary payload
  ms integer,                  -- duration for step (if applicable)
  ts timestamptz not null default now()
);

create index if not exists idx_experiment_logs_experiment
  on public.experiment_logs(tenant_id, experiment_id, ts);

-- 2) RLS scaffolding (safe defaults)
alter table public.experiments enable row level security;
alter table public.rate_plans enable row level security;
alter table public.exposures_daily enable row level security;
alter table public.losses enable row level security;
alter table public.cohort_units enable row level security;
alter table public.experiment_logs enable row level security;

-- Minimal policies (single-tenant dev: allow all reads; writes via service role)
do $$
begin
  if not exists (select 1 from pg_policies where tablename='experiments' and policyname='dev_read') then
    create policy dev_read on public.experiments for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='rate_plans' and policyname='dev_read') then
    create policy dev_read on public.rate_plans for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='exposures_daily' and policyname='dev_read') then
    create policy dev_read on public.exposures_daily for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='losses' and policyname='dev_read') then
    create policy dev_read on public.losses for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='cohort_units' and policyname='dev_read') then
    create policy dev_read on public.cohort_units for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='experiment_logs' and policyname='dev_read') then
    create policy dev_read on public.experiment_logs for select using (true);
  end if;
end $$;


