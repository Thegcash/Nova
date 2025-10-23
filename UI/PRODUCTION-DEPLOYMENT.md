# 🚀 Nova Command Center - Production Deployment Guide

## ✅ **PRE-DEPLOYMENT CHECKLIST**

### 1. Vercel Postgres Setup
- [ ] Go to Vercel → Your Project → **Integrations**
- [ ] Add **Vercel Postgres** → Choose region closest to your users
- [ ] Copy the `DATABASE_URL` from the integration

### 2. Google Maps API Setup
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Enable **Maps JavaScript API**
- [ ] Create a **Browser Key** (not Server Key)
- [ ] **Restrict by HTTP referrer** to your production domain
- [ ] Copy the API key

### 3. Environment Variables (Vercel → Project → Settings → Environment Variables → **Production**)

```bash
DATABASE_URL=postgres://<user>:<pass>@<host>:5432/<db>
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
NEXT_PUBLIC_BASE_URL=https://YOUR_PROD_DOMAIN.vercel.app
```

**⚠️ Remove any Supabase variables - we don't use them anymore.**

### 4. Deploy to Production
- [ ] Push to GitHub
- [ ] Deploy on Vercel
- [ ] Wait for deployment to complete

## 🎯 **POST-DEPLOYMENT SETUP**

### 1. Bootstrap Database (One-time)
```bash
curl -s https://YOUR_PROD_DOMAIN.vercel.app/api/setup | jq
```

**Expected Response:**
```json
{ "ok": true }
```

### 2. Run Health Checks
```bash
# Health endpoint
curl -s https://YOUR_PROD_DOMAIN.vercel.app/api/health | jq

# Pages
curl -sI https://YOUR_PROD_DOMAIN.vercel.app/risk-dashboard | head -1
curl -sI https://YOUR_PROD_DOMAIN.vercel.app/guardrail-engine | head -1

# APIs
curl -s https://YOUR_PROD_DOMAIN.vercel.app/api/risk-metrics | jq '.totals'
curl -s https://YOUR_PROD_DOMAIN.vercel.app/api/fleets | jq '.fleets | length'
```

### 3. Test Assistant
```bash
curl -s -X POST https://YOUR_PROD_DOMAIN.vercel.app/api/assistant \
  -H 'content-type: application/json' \
  -d '{"prompt":"Give me 2 guardrail ideas to reduce losses."}' | jq
```

## 🔍 **VERIFICATION CHECKLIST**

### ✅ Dashboard Features
- [ ] **Risk Dashboard** loads with live KPIs
- [ ] **Google Maps** shows 3 fleet locations
- [ ] **Mode indicator** shows "LIVE"
- [ ] **Guardrail Engine** shows seeded guardrails
- [ ] **Compliance Engine** shows policies and tasks
- [ ] **ROI Dashboard** shows financial metrics
- [ ] **Nova Assistant** responds to prompts

### ✅ API Endpoints
- [ ] `/api/risk-metrics` returns non-zero totals
- [ ] `/api/fleets` returns 3 seeded fleets with lat/lng
- [ ] `/api/guardrails` returns seeded guardrails
- [ ] `/api/compliance` returns policies and tasks
- [ ] `/api/roi` returns hasExposures: true, hasLosses: true
- [ ] `/api/assistant` returns text responses

### ✅ Google Maps
- [ ] Map tiles load correctly
- [ ] 3 markers appear for seeded fleets
- [ ] No "Loading map..." message
- [ ] Map is interactive (zoom, pan)

## 🚨 **TROUBLESHOOTING**

### Common Issues & Fixes

**1. 500 Error on `/api/assistant`**
- ✅ Check `OPENAI_API_KEY` is set in Production env vars
- ✅ Ensure API route has `export const runtime = 'nodejs';`
- ✅ Verify OpenAI account has sufficient quota

**2. Map Shows "Loading map..."**
- ✅ Enable **Maps JavaScript API** in Google Cloud Console
- ✅ Check `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set
- ✅ Verify API key restrictions include your domain
- ✅ Wait 5-10 minutes after enabling API

**3. Empty Metrics/Data**
- ✅ Run `/api/setup` endpoint once after deployment
- ✅ Check `DATABASE_URL` is set correctly
- ✅ Verify Vercel Postgres integration is active

**4. Database Connection Errors**
- ✅ Confirm `DATABASE_URL` is in **Production** scope (not Preview)
- ✅ Check Vercel Postgres integration is connected
- ✅ Redeploy after adding environment variables

## 🎉 **SUCCESS INDICATORS**

When everything is working correctly, you should see:

- **Dashboard**: Live KPIs, interactive map, working assistant
- **APIs**: Real data from database, no mock fallbacks
- **Health**: `{"db": true, "status": "healthy"}`
- **Maps**: Interactive map with fleet markers
- **Assistant**: Instant responses to prompts

## 📞 **Quick Fix Commands**

```bash
# Check health
curl -s https://YOUR_DOMAIN/api/health | jq

# Re-bootstrap database
curl -s https://YOUR_DOMAIN/api/setup | jq

# Test assistant
curl -s -X POST https://YOUR_DOMAIN/api/assistant \
  -H 'content-type: application/json' \
  -d '{"prompt":"Hello"}' | jq
```

---

**🎯 Your Nova Command Center is now LIVE and production-ready!**

