-- Nova Fleet Command Center - Database Schema
-- Run this in your Supabase SQL Editor

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  make TEXT,
  model TEXT,
  status TEXT DEFAULT 'active',
  last_heartbeat_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create positions table
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id TEXT REFERENCES vehicles(id),
  ts TIMESTAMPTZ NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  speed DOUBLE PRECISION DEFAULT 0,
  heading DOUBLE PRECISION DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id TEXT REFERENCES vehicles(id),
  ts TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_positions_vehicle_ts ON positions(vehicle_id, ts);
CREATE INDEX IF NOT EXISTS idx_events_vehicle_ts ON events(vehicle_id, ts);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_heartbeat ON vehicles(last_heartbeat_at);

-- Enable Row Level Security (RLS)
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access
CREATE POLICY "Service role can do everything" ON vehicles
  FOR ALL USING (true);

CREATE POLICY "Service role can do everything" ON positions
  FOR ALL USING (true);

CREATE POLICY "Service role can do everything" ON events
  FOR ALL USING (true);
