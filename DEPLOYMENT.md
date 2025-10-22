# Nova Fleet Command Center - Production Deployment

## Pre-deployment Setup

### 1. Environment Variables
Rotate and set the following keys in your production environment:

```bash
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Google Maps Setup
- Enable Google Maps JavaScript API in Google Cloud Console
- Add production domain to referrers (e.g., `yourdomain.com/*`)
- Add localhost for development: `localhost:3000/*`

### 3. Supabase Setup
- Ensure database tables exist (`vehicles`, `positions`, `events`)
- Verify RLS policies are configured
- Test service role key has proper permissions

## Deployment Steps

### 1. Build and Start
```bash
npm run build
npm start
```

Or use the production script:
```bash
npm run start:prod
```

### 2. Verify Core Endpoints
```bash
# Health check
curl http://localhost:3000/api/health
# Expected: {"ok":true,"ts":"..."}

# Assistant (should work or rate limit)
curl -X POST http://localhost:3000/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
# Expected: {"reply":"..."} or {"error":"Rate limit exceeded"}

# Dev endpoints blocked in production
curl http://localhost:3000/api/dev/seed
# Expected: {"error":"Not available in production"}
```

### 3. Post-deploy Smoke Test
1. Visit `/fleet-overview` - Chat panel should work
2. Visit `/map-live-ops` - Google Map should load with markers
3. Run `npm run seed:fleet` to populate demo data
4. Verify markers update every ~3 seconds on live map

## Production Notes

- Dev endpoints (`/api/dev/*`) are automatically blocked when `NODE_ENV=production`
- Assistant API is rate limited to 10 requests/minute per IP
- All API calls use relative URLs (no base URL configuration needed)
- Single-shell layout prevents duplicate sidebars
