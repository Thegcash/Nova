# Nova Command Center

A modern dashboard for autonomous vehicle fleet management built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Fleet Overview**: Monitor vehicle status, performance metrics, and health checks
- **Map & Live Operations**: Real-time vehicle tracking and operational control
- **Playback**: Review historical data and replay past operations
- **Data Ingestion**: Monitor data pipelines and ingestion processes
- **Cost Optimization**: Identify cost-saving opportunities and optimize operations

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library with consistent design system

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
nova-command-center/
├── app/
│   ├── (dash)/                 # Dashboard route group
│   │   ├── layout.tsx         # Dashboard layout with sidebar
│   │   ├── fleet-overview/    # Fleet monitoring page
│   │   ├── map-live-ops/      # Real-time operations
│   │   ├── playback/          # Historical data playback
│   │   ├── ingestion/         # Data pipeline monitoring
│   │   └── reduce-cost/       # Cost optimization
│   ├── globals.css            # Global styles with Tailwind
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page (redirects to fleet-overview)
├── components/
│   └── ui.tsx                 # Shared UI components
├── tailwind.config.js         # Tailwind configuration
├── tsconfig.json              # TypeScript configuration
└── next.config.js             # Next.js configuration
```

## UI Components

The project includes a set of reusable UI components:

- **RailItem**: Navigation rail items with active states
- **Chip**: Status indicators with different tones (ok, warn, bad)
- **Button**: Action buttons with primary/danger variants
- **Kbd**: Keyboard shortcut indicators
- **TestRow**: Status rows for system checks
- **Kpi**: Key performance indicator cards

## Policy ROI Dashboard

The application includes a comprehensive ROI tracking system for policy enforcement.

### API Endpoints

- **GET** `/api/roi/health` - Health check endpoint
- **GET** `/api/roi/summary` - ROI summary across policies (supports `from`, `to`, `policy_id` params)
- **GET** `/api/roi/policy/:id/trends` - 30-day trends for a specific policy
- **GET** `/api/roi/policy/:id/top-units` - Top units by loss prevention (7 days)
- **POST** `/api/cron/roi-digest` - Sends daily digest to Slack

### Environment Variables

Create a `.env.local` file in the project root with:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE=your_service_role_key
SLACK_WEBHOOK_ROI=https://hooks.slack.com/services/YOUR/WEBHOOK/URL  # Optional
```

**Security Note**: These variables are server-only and never exposed to the browser.

### Running the ROI Digest Manually

To trigger the daily ROI digest:

```bash
curl -X POST http://localhost:3006/api/cron/roi-digest
```

To check configuration status:

```bash
curl http://localhost:3006/api/cron/roi-digest
```

### Pages

- `/policy-roi` - Policy ROI dashboard with trends and top units

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Navigation

The dashboard includes keyboard shortcuts for quick navigation:
- **G/J/K/Space** - Various navigation shortcuts (as indicated in the sidebar)

## Customization

The design system uses Tailwind CSS with a clean, modern aesthetic. Colors and spacing can be customized in the `tailwind.config.js` file.

Each page is designed to be modular and can be extended with additional functionality as needed.

