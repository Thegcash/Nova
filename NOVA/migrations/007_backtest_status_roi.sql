-- Add status and meta columns to experiments table for backtest tracking
-- Migration: 007_backtest_status_roi.sql

-- Ensure columns exist; add if missing:
alter table public.experiments
  add column if not exists status text not null default 'queued',
  add column if not exists meta jsonb not null default '{}'::jsonb;

-- Add index on status for efficient querying
create index if not exists idx_experiments_status on public.experiments(status);

-- Add index on meta for efficient JSON queries
create index if not exists idx_experiments_meta on public.experiments using gin(meta);

