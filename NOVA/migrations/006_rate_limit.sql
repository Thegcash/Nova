-- Lightweight events ledger for rate limiting
create table if not exists public.rate_limit_events (
  tenant_id uuid not null,
  key text not null,               -- e.g., 'llm_parse', 'backtest_run'
  ts timestamptz not null default now()
);
create index if not exists idx_rle_tenant_key_ts
  on public.rate_limit_events(tenant_id, key, ts);

-- SECURITY DEFINER: check + record atomically
create or replace function public.check_rate_limit(
  p_tenant_id uuid,
  p_key text,
  p_limit integer,
  p_window_seconds integer
) returns table (allowed boolean, remaining integer)
language plpgsql
security definer
as $$
declare
  cutoff timestamptz := now() - make_interval(secs => p_window_seconds);
  used int;
begin
  -- count in window
  select count(*) into used
  from public.rate_limit_events
  where tenant_id = p_tenant_id
    and key = p_key
    and ts >= cutoff;

  if used < p_limit then
    insert into public.rate_limit_events(tenant_id, key) values (p_tenant_id, p_key);
    return query select true as allowed, (p_limit - used - 1) as remaining;
  else
    return query select false as allowed, 0 as remaining;
  end if;
end;
$$;


