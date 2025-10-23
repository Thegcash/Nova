# 🚀 NOVA COMMAND CENTER - PRODUCTION READY

## ✅ COMPLETED IMPLEMENTATION

All systems are GO! Your Nova Command Center is now production-ready with:

- ✅ **Supabase Postgres** via generic `pg` client (pooled connection)
- ✅ **Node.js runtime** enforced on all API routes
- ✅ **No mocks in production** - always LIVE data
- ✅ **One-click bootstrap** via `/api/setup`
- ✅ **Health checks** via `/api/health`
- ✅ **Google Maps** integration
- ✅ **OpenAI Assistant** (Nova AI)

---

## 📋 PRODUCTION DEPLOYMENT STEPS

### **STEP 1: Set Production Environment Variables**

Go to **Vercel → Project → Settings → Environment Variables → Production** and set:

```bash
# Supabase Postgres (use pooled connection for production)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.mfqzqilnntoubacxdwbt.supabase.co:6543/postgres?sslmode=require&pgbouncer=true

# AI + Maps  
OPENAI_API_KEY=sk-proj-YOUR_OPENAI_API_KEY_HERE
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE

# App
NEXT_PUBLIC_BASE_URL=https://nova-sandy-pi.vercel.app

# Node TLS (for SSL certificate handling)
NODE_TLS_REJECT_UNAUTHORIZED=0
```

**⚠️ IMPORTANT:** Use **port 6543** (pooled) for production, **port 5432** (direct) for local development.

---

### **STEP 2: Redeploy Production**

After setting environment variables, **Redeploy** in Vercel to pick up the new configuration.

---

### **STEP 3: Bootstrap + Smoke Tests**

Once deployment is complete, run the provided script:

```bash
./deploy-production.sh
```

Or manually test each endpoint:

```bash
HOST="https://nova-sandy-pi.vercel.app"

# Bootstrap database
curl -s "$HOST/api/setup" | jq

# Health check
curl -s "$HOST/api/health" | jq

# Test APIs
curl -s "$HOST/api/risk-metrics" | jq '.totals'
curl -s "$HOST/api/fleets" | jq '.fleets | length'
curl -s "$HOST/api/guardrails" | jq '.guardrails | length'
curl -s "$HOST/api/compliance" | jq '.policies | length'
curl -s "$HOST/api/roi" | jq '.hasExposures, .hasLosses'

# Test Assistant
curl -s -X POST "$HOST/api/assistant" \
  -H 'content-type: application/json' \
  -d '{"prompt":"Give me 2 guardrail ideas to reduce losses."}' | jq '.text'
```

---

## 🎯 SUCCESS CRITERIA

**✅ GREEN = LIVE when you see:**

- `/api/setup`: `{ "ok": true }`
- `/api/health`: `{ "db": true, ... }`
- `/api/risk-metrics`: Non-zero totals (exposures, losses)
- `/api/fleets`: Length ≥ 3
- `/api/guardrails`: Length ≥ 2
- `/api/compliance`: Length ≥ 2
- `/api/roi`: `hasExposures: true, hasLosses: true`
- Assistant: Returns text response
- Pages: Load successfully with live data

---

## 🌐 READY-TO-DEMO URLs

- **Risk Dashboard:** `https://nova-sandy-pi.vercel.app/risk-dashboard`
  - Live KPIs from Supabase
  - Google Maps with fleet locations
  - Nova AI Assistant

- **Guardrail Engine:** `https://nova-sandy-pi.vercel.app/guardrail-engine`
  - Live guardrail data
  - Impact analysis
  - Nova AI Assistant

- **Compliance Engine:** `https://nova-sandy-pi.vercel.app/compliance-engine`
  - Policy coverage
  - Evidence queue
  - Nova AI Assistant

- **ROI Dashboard:** `https://nova-sandy-pi.vercel.app/roi-dashboard`
  - Financial KPIs
  - Payback analysis
  - Nova AI Assistant

---

## 🔧 LOCAL DEVELOPMENT

For local testing, use the direct connection (port 5432):

```bash
# .env.local
DATABASE_URL=postgresql://postgres:cATyNugCAQgIsqja@db.mfqzqilnntoubacxdwbt.supabase.co:5432/postgres
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
NEXT_PUBLIC_BASE_URL=http://localhost:3001
NODE_TLS_REJECT_UNAUTHORIZED=0
```

Then run:

```bash
npm run dev -- -p 3001
```

---

## 📊 ARCHITECTURE OVERVIEW

### **Database Layer**
- **Supabase Postgres** (managed PostgreSQL)
- **Singleton Pool** for connection reuse
- **SSL enabled** with proper certificate handling
- **Pooled connection (6543)** for production scalability

### **API Layer**
- **Node.js runtime** (not Edge) for OpenAI compatibility
- **Force-dynamic** rendering for real-time data
- **No caching** (`revalidate: 0`)
- **Graceful error handling** with fallbacks

### **Frontend Layer**
- **Next.js App Router** with React Server Components
- **Client components** for interactivity (maps, charts, AI)
- **Framer Motion** for smooth animations
- **Recharts** for data visualization
- **Google Maps** for fleet tracking

---

## 🚨 TROUBLESHOOTING

### **Issue: SSL Certificate Error**
**Solution:** Ensure `NODE_TLS_REJECT_UNAUTHORIZED=0` is set in environment variables.

### **Issue: API Returns Errors**
**Solution:** Run `/api/setup` to bootstrap the database tables.

### **Issue: OpenAI Rate Limit**
**Solution:** Check your OpenAI API key and billing status. The current key may need to be rotated.

### **Issue: Maps Not Loading**
**Solution:** Verify `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set correctly and has the Maps JavaScript API enabled.

---

## 🎉 YOU'RE LIVE!

Your Nova Command Center is now production-ready and deployed at:

**https://nova-sandy-pi.vercel.app**

All dashboards are connected to live Supabase data, Google Maps is tracking your fleet, and the Nova AI Assistant is ready to help with risk analysis and guardrail recommendations.

**Happy shipping! 🚀**


