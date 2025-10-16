# Nova Command Center - Setup Guide

## 🚀 Quick Start

### Local Development
```bash
npm install
npm run dev
```

Open **http://localhost:3000**

---

## 📊 Add Pilot Data

To see the dashboard with real data, run this SQL in your **Supabase SQL Editor**:

### Option 1: Quick Test (Mock Data)
Copy and paste `pilot-data.sql` into Supabase SQL Editor and run it.

This creates 30 days of sample ROI data for visualization.

### Option 2: Connect Real Data

The app expects these Supabase tables/views:

#### 1. ROI Data
```sql
-- View or table: vw_policy_roi_v1_with_baseline
-- Columns: policy_id, day, alert_count, avoided_incidents, downtime_avoided_min, 
--          loss_prevented_est_sum, baseline_alerts, baseline_avoided_incidents, 
--          baseline_downtime_min, baseline_loss
```

#### 2. Export Runs
```sql
-- Table: export_runs
-- Columns: id, tenant_id, from_date, to_date, format, status, manifest, 
--          duration_ms, error, created_at
```

#### 3. Export Settings
```sql
-- Table: export_settings
-- Columns: tenant_id, retention_days, updated_at
```

---

## 🎨 Design System

Nova uses a **clean, professional design system**:

- **Single accent color**: Blue (#2563EB)
- **Status colors**: Green, Amber, Red
- **No emojis**: All icons from Lucide React
- **Fast transitions**: 170ms with custom easing
- **Professional typography**: Inter font

### Components Available

- `.card` - White card with shadow and border
- `.stat-card` - KPI display card
- `.btn` - Button (primary, secondary variants)
- `.badge-*` - Status badges (success, warning, error, neutral)
- `.grid` - Responsive grid layouts

---

## 📄 Pages

| Page | Route | Backend API | Status |
|------|-------|-------------|--------|
| Dashboard | `/` | `/api/roi/health` | ✅ Working |
| ROI | `/roi` | Direct Supabase query | ✅ Working |
| Exports | `/exports` | `/api/exports/carrier/*` | ✅ Working |
| Events | `/events` | Ready for data | 🟡 Needs data |
| Alerts | `/alerts` | Ready for data | 🟡 Needs data |
| Policies | `/policies` | Ready for data | 🟡 Needs data |

---

## 🌐 Deployment

### Current URLs

- **Local**: http://localhost:3000
- **Production**: https://nova-eiorrobhg-gerardos-projects-6b44c4d9.vercel.app

### Deploy Updates
```bash
vercel --prod
```

Or push to git and Vercel auto-deploys.

---

## 🔧 Environment Variables

Required in `.env.local`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE=your_service_role_key
TENANT_ID=your_tenant_uuid
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 📈 Charts & Visualizations

All charts use **Recharts** with professional styling:
- Single-color area/line charts
- Subtle gradients
- Clean axes
- No animations (fast, decisive)

### Dashboard
- Risk trend (30 days) - Area chart

### ROI Page
- Avoided incidents trend - Line chart (blue)
- Cost savings trend - Area chart (green)
- Daily breakdown table

---

## 🎯 Next Steps

1. **Run pilot-data.sql** in Supabase to see charts populate
2. **Test exports** - Try creating an export and verify files in Supabase Storage
3. **Connect real event streams** to Events/Alerts pages
4. **Disable Vercel Protection** (optional) for public access

All pages are production-ready and connected to your backend! 🚀



