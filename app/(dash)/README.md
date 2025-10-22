# Fleet Command Center - Dashboard

This directory contains the main dashboard pages for the Nova Fleet Command Center, all using a single-shell layout.

## Pages

- **`/fleet-overview`** - Main dashboard with KPIs and fleet overview
- **`/map-live-ops`** - Live vehicle positions with real-time updates
- **`/playback`** - Historical vehicle movement playback with time scrubbing
- **`/alerts`** - Fleet alerts and notifications (placeholder)
- **`/exports`** - Data export functionality (placeholder)

## Live Transport

### Real-time Updates
The Live Ops page supports two modes for real-time updates:

1. **Server-Sent Events (SSE)** - Preferred method
   - Endpoint: `/api/live/stream`
   - Updates every 2 seconds
   - Automatic reconnection on connection loss
   - Toggle available in UI

2. **Polling** - Fallback method
   - Endpoint: `/api/live/latest`
   - Updates every 3 seconds
   - Used when SSE is not available

### Mapbox Integration

Both Live Ops and Playback pages support Mapbox GL JS for interactive maps:

- **Token Required**: `NEXT_PUBLIC_MAPBOX_TOKEN` environment variable
- **Fallback**: If no token is provided, pages display data in list format
- **Dynamic Loading**: Mapbox is loaded only when needed to avoid bundle bloat

### Data Sources

- **Live Positions**: `/api/live/latest` - Latest position per vehicle
- **Playback Data**: `/api/playback?vehicle_id=&start=&end=` - Historical positions
- **Fleet Overview**: `/api/fleet/overview` - KPI metrics

## Layout Structure

All pages use the single-shell layout defined in `app/(dash)/layout.tsx`:
- Top navigation bar
- Left sidebar with navigation
- Main content area
- No duplicate shells or sidebars

## Environment Variables

Required for full functionality:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE` - Server-side Supabase access
- `NEXT_PUBLIC_MAPBOX_TOKEN` - Optional, for map visualization

## Development

```bash
npm run dev
```

Pages will be available at:
- http://localhost:3000/fleet-overview
- http://localhost:3000/map-live-ops
- http://localhost:3000/playback
