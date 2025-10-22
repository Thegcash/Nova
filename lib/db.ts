/**
 * Server-only Supabase client
 * DO NOT import this in client components - use only in Server Components and API Routes
 */

import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL) {
  throw new Error('Missing environment variable: SUPABASE_URL');
}

if (!process.env.SUPABASE_SERVICE_ROLE) {
  throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE');
}

/**
 * Server-side Supabase client with service role access
 * Use only in server-side code (API routes, Server Components, Server Actions)
 */
export const supabaseServer = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Fleet-specific database helpers
export const db = {
  // Vehicle operations
  vehicles: {
    async getAll() {
      const { data, error } = await supabaseServer
        .from('vehicles')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },

    async getById(id: string) {
      const { data, error } = await supabaseServer
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    async getActive() {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data, error } = await supabaseServer
        .from('vehicles')
        .select('*')
        .gte('last_heartbeat_at', fiveMinutesAgo);
      if (error) throw error;
      return data;
    },

    async updateHeartbeat(id: string) {
      const { error } = await supabaseServer
        .from('vehicles')
        .update({ last_heartbeat_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
  },

  // Position operations
  positions: {
    async insertMany(positions: Array<{
      vehicle_id: string;
      ts: string;
      lat: number;
      lon: number;
      speed: number;
      heading: number;
    }>) {
      const { data, error } = await supabaseServer
        .from('positions')
        .insert(positions)
        .select();
      if (error) throw error;
      return data;
    },

    async getLatest(vehicleId?: string) {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      
      let query = supabaseServer
        .from('positions')
        .select(`
          vehicle_id,
          ts,
          lat,
          lon,
          speed,
          heading,
          vehicles!inner(name, status)
        `)
        .gte('ts', twoMinutesAgo)
        .order('ts', { ascending: false });

      if (vehicleId) {
        query = query.eq('vehicle_id', vehicleId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by vehicle_id and get latest for each
      const latestByVehicle = new Map();
      data?.forEach(pos => {
        if (!latestByVehicle.has(pos.vehicle_id) || 
            new Date(pos.ts) > new Date(latestByVehicle.get(pos.vehicle_id).ts)) {
          latestByVehicle.set(pos.vehicle_id, pos);
        }
      });

      return Array.from(latestByVehicle.values());
    },

    async getPlayback(vehicleId: string, start: string, end: string) {
      const { data, error } = await supabaseServer
        .from('positions')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .gte('ts', start)
        .lte('ts', end)
        .order('ts', { ascending: true });
      if (error) throw error;
      return data;
    },

    async getIdleVehicles() {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      
      // Get vehicles that had speed < 1 for all points in last 10 minutes
      const { data, error } = await supabaseServer
        .from('positions')
        .select('vehicle_id')
        .gte('ts', tenMinutesAgo)
        .lt('speed', 1);
      
      if (error) throw error;
      return data?.map(row => row.vehicle_id) || [];
    },
  },

  // Event operations
  events: {
    async get24hAlerts() {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count, error } = await supabaseServer
        .from('events')
        .select('*', { count: 'exact', head: true })
        .gte('ts', twentyFourHoursAgo);
      if (error) throw error;
      return count || 0;
    },

    async insertMany(events: Array<{
      vehicle_id: string;
      ts: string;
      type: string;
      severity: string;
      meta?: any;
    }>) {
      const { data, error } = await supabaseServer
        .from('events')
        .insert(events)
        .select();
      if (error) throw error;
      return data;
    },
  },
};
