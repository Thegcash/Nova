#!/usr/bin/env tsx

import { db, supabaseServer } from '../lib/db';

interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  status: string;
}

const VEHICLES: Vehicle[] = [
  { id: '1', name: 'AV-001', make: 'Tesla', model: 'Model 3', status: 'active' },
  { id: '2', name: 'AV-002', make: 'Tesla', model: 'Model Y', status: 'active' },
  { id: '3', name: 'AV-003', make: 'Waymo', model: 'Chrysler Pacifica', status: 'idle' },
  { id: '4', name: 'AV-004', make: 'Cruise', model: 'Chevrolet Bolt', status: 'active' },
  { id: '5', name: 'AV-005', make: 'Tesla', model: 'Model S', status: 'active' },
];

async function seedVehicles() {
  console.log('🚗 Seeding vehicles...');
  
  for (const vehicle of VEHICLES) {
    try {
      // Check if vehicle exists
      const existing = await db.vehicles.getById(vehicle.id).catch(() => null);
      
      if (!existing) {
        // Insert vehicle
        const { error } = await db.supabaseServer
          .from('vehicles')
          .insert({
            id: vehicle.id,
            name: vehicle.name,
            make: vehicle.make,
            model: vehicle.model,
            status: vehicle.status,
            last_heartbeat_at: new Date().toISOString()
          });
        
        if (error) throw error;
        console.log(`✅ Created vehicle: ${vehicle.name}`);
      } else {
        console.log(`⏭️  Vehicle already exists: ${vehicle.name}`);
      }
    } catch (error) {
      console.error(`❌ Failed to create vehicle ${vehicle.name}:`, error);
    }
  }
}

async function seedPositions() {
  console.log('📍 Seeding positions...');
  
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  for (const vehicle of VEHICLES) {
    try {
      // Generate 24 hours of positions (1 every 10 seconds)
      const positions = [];
      const startTime = twentyFourHoursAgo.getTime();
      const endTime = now.getTime();
      const interval = 10 * 1000; // 10 seconds
      
      // Base coordinates for each vehicle (spread around NYC)
      const baseCoords = {
        '1': { lat: 40.7128, lon: -74.0060 }, // Manhattan
        '2': { lat: 40.7589, lon: -73.9851 }, // Times Square
        '3': { lat: 40.6892, lon: -74.0445 }, // Brooklyn Bridge
        '4': { lat: 40.7505, lon: -73.9934 }, // Central Park
        '5': { lat: 40.7614, lon: -73.9776 }, // Lincoln Center
      };
      
      const base = baseCoords[vehicle.id as keyof typeof baseCoords] || baseCoords['1'];
      
      for (let time = startTime; time <= endTime; time += interval) {
        // Add some random movement around base coordinates
        const latOffset = (Math.random() - 0.5) * 0.01; // ~0.5 mile radius
        const lonOffset = (Math.random() - 0.5) * 0.01;
        
        // Simulate realistic speed (0-60 mph)
        const speed = Math.random() * 60;
        
        // Simulate realistic heading (0-360 degrees)
        const heading = Math.random() * 360;
        
        positions.push({
          vehicle_id: vehicle.id,
          ts: new Date(time).toISOString(),
          lat: base.lat + latOffset,
          lon: base.lon + lonOffset,
          speed: speed,
          heading: heading
        });
      }
      
      // Insert positions in batches of 100
      const batchSize = 100;
      for (let i = 0; i < positions.length; i += batchSize) {
        const batch = positions.slice(i, i + batchSize);
        await db.positions.insertMany(batch);
      }
      
      console.log(`✅ Created ${positions.length} positions for ${vehicle.name}`);
    } catch (error) {
      console.error(`❌ Failed to create positions for ${vehicle.name}:`, error);
    }
  }
}

async function seedEvents() {
  console.log('🚨 Seeding events...');
  
  const eventTypes = ['speed_violation', 'hard_brake', 'lane_change', 'maintenance_required', 'battery_low'];
  const severities = ['info', 'warning', 'error'];
  
  const events = [];
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // Generate random events for each vehicle
  for (const vehicle of VEHICLES) {
    const numEvents = Math.floor(Math.random() * 10) + 5; // 5-15 events per vehicle
    
    for (let i = 0; i < numEvents; i++) {
      const eventTime = new Date(
        twentyFourHoursAgo.getTime() + Math.random() * (now.getTime() - twentyFourHoursAgo.getTime())
      );
      
      events.push({
        vehicle_id: vehicle.id,
        ts: eventTime.toISOString(),
        type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        meta: {
          value: Math.random() * 100,
          location: 'NYC',
          timestamp: eventTime.toISOString()
        }
      });
    }
  }
  
  try {
    // Insert events in batches
    const batchSize = 50;
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      await db.events.insertMany(batch);
    }
    
    console.log(`✅ Created ${events.length} events`);
  } catch (error) {
    console.error('❌ Failed to create events:', error);
  }
}

async function main() {
  console.log('🌱 Starting fleet data seeding...');
  
  try {
    await seedVehicles();
    await seedPositions();
    await seedEvents();
    
    console.log('🎉 Fleet data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${VEHICLES.length} vehicles created`);
    console.log('- 24 hours of position data (1 point every 10 seconds)');
    console.log('- Random events generated for each vehicle');
    console.log('\n🚀 You can now run `npm run dev` and see real data in the dashboard!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Check if this is being run directly
if (require.main === module) {
  main();
}
