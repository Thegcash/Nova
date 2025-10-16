-- Cohort table (stores units per experiment)
create table if not exists public.cohort_units (
  tenant_id uuid not null,
  experiment_id uuid not null,
  unit_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (tenant_id, experiment_id, unit_id)
);

-- SECURITY DEFINER function to materialize arbitrary cohort SQL safely
create or replace function public.materialize_cohort(
  p_tenant_id uuid,
  p_experiment_id uuid,
  p_cohort_sql text
) returns void
language plpgsql
security definer
as $$
declare
  sql text;
begin
  delete from public.cohort_units
  where tenant_id = p_tenant_id and experiment_id = p_experiment_id;

  sql := format(
    'insert into public.cohort_units(tenant_id, experiment_id, unit_id)
     select %L as tenant_id, %L as experiment_id, s.unit_id
     from (%s) as s',
    p_tenant_id, p_experiment_id, p_cohort_sql
  );
  execute sql;
end;
$$;

create index if not exists idx_cohort_units_tenant_exp_unit
  on public.cohort_units(tenant_id, experiment_id, unit_id);


