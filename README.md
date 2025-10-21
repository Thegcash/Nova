# Nova Fleet Command Center

A modern dashboard for autonomous vehicle fleet management built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env.local
# Fill in your Supabase and map API credentials

# 3. Run the development server
npm run dev

# 4. Open your browser
open http://localhost:3000
```

## 📊 Features

- **Fleet Overview**: Monitor vehicle status, performance metrics, and health checks
- **Map & Live Operations**: Real-time vehicle tracking and operational control
- **Playback**: Review historical data and replay past operations
- **Data Ingestion**: Monitor data pipelines and ingestion processes
- **Cost Optimization**: Identify cost-saving opportunities and optimize operations
- **ROI Tracking**: Policy performance and cost savings analysis
- **Data Exports**: Generate carrier data exports in CSV or Parquet format

## 🏗️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Maps**: Mapbox GL JS or Google Maps
- **Charts**: Recharts
- **UI Components**: Custom component library with consistent design system

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=your_service_role_key

# Map Integration (choose one)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token
# OR
# GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Export Configuration
EXPORT_DEFAULT_FORMAT=csv

# Application Configuration
TENANT_ID=default
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 📁 Project Structure

```
nova-fleet-command-center/
├── app/
│   ├── (dash)/                 # Dashboard route group
│   │   ├── layout.tsx         # Dashboard layout with sidebar
│   │   ├── fleet-overview/    # Fleet monitoring page
│   │   ├── map-live-ops/      # Real-time operations
│   │   ├── playback/          # Historical data playback
│   │   ├── ingestion/         # Data pipeline monitoring
│   │   └── reduce-cost/       # Cost optimization
│   ├── api/                   # API routes
│   ├── exports/               # Data export functionality
│   ├── roi/                   # ROI tracking
│   └── globals.css            # Global styles
├── components/
│   └── ui.tsx                 # Shared UI components
├── lib/                       # Utility libraries
└── types/                     # TypeScript type definitions
```

## 🎨 Design System

The project uses a clean, professional design system:

- **Single accent color**: Blue (#2563EB)
- **Status colors**: Green, Amber, Red
- **No emojis**: All icons from Lucide React
- **Fast transitions**: 170ms with custom easing
- **Professional typography**: Inter font

### Available Components

- `.card` - White card with shadow and border
- `.stat-card` - KPI display card
- `.btn` - Button (primary, secondary variants)
- `.badge-*` - Status badges (success, warning, error, neutral)
- `.grid` - Responsive grid layouts

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🧪 Development

```bash
# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

## 📈 Current Status

### ✅ Working Features
- **ROI Dashboard** - Real Supabase integration with policy performance tracking
- **Data Exports** - Functional CSV/Parquet export system
- **Basic Navigation** - Clean sidebar with all pages accessible
- **Design System** - Professional, consistent UI components

### 🚧 In Development
- **Fleet Overview** - Real vehicle data integration
- **Map & Live Ops** - Real-time vehicle tracking
- **Playback System** - Historical data visualization
- **Data Ingestion** - Pipeline monitoring

## 🔗 Related Projects

- **[Nova Pricing OS](../nova-pricing-os)** - Insurance rating engine (separate repository)

## 📞 Support

For issues and questions:
1. Check the documentation in each page directory
2. Review the API routes in `/app/api/`
3. Check environment variable configuration

## 📜 License

Proprietary — Nova Fleet Command Center

---

**Built with:** Next.js 15, TypeScript, Tailwind CSS, Supabase  
**Design:** Clean, professional fleet management UI  
**Status:** 🚧 **In Active Development**