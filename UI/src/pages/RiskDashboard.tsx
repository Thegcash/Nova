// @ts-nocheck
"use client";
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart as RLineChart,
  Line,
  AreaChart as RAreaChart,
  Area,
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

// Enhanced UI primitives matching your design
const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl border bg-card/40 shadow-sm ${className}`}>{children}</div>
);

const CardContent = ({ className = "", children }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);

const Button = ({ className = "", children, variant = "solid", onClick, ...props }) => {
  const base =
    variant === "ghost"
      ? "bg-transparent hover:bg-foreground/5"
      : variant === "outline"
      ? "border bg-transparent hover:bg-foreground/5"
      : variant === "secondary"
      ? "bg-foreground/5 hover:bg-foreground/10"
      : "bg-primary/90 text-primary-foreground hover:bg-primary";
  return (
    <button className={`h-9 px-3 rounded-xl text-sm flex items-center ${base} ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};

const Input = ({ className = "", ...props }) => (
  <input className={`h-9 px-3 rounded-xl border bg-background w-full ${className}`} {...props} />
);

const Badge = ({ className = "", children, variant = "solid" }) => (
  <span
    className={`inline-flex items-center h-6 px-2 rounded-lg text-xs border ${
      variant === "secondary" ? "bg-foreground/5" : variant === "outline" ? "bg-transparent" : "bg-foreground/10"
    } ${className}`}
  >
    {children}
  </span>
);

const Avatar = ({ className = "", children }) => (
  <div className={`h-8 w-8 rounded-full bg-foreground/10 grid place-items-center ${className}`}>{children}</div>
);

const AvatarFallback = ({ children }) => <span className="text-xs font-medium">{children}</span>;

const Separator = () => <div className="h-px w-full bg-foreground/10" />;

const ScrollArea = ({ className = "", children }) => (
  <div className={`overflow-auto ${className}`}>{children}</div>
);

// Navigation items
const nav = [
  { label: "Risk Scoring", icon: "🧭" },
  { label: "Guardrail Engine", icon: "🛡️" },
  { label: "Compliance Engine", icon: "⚖️" },
  { label: "ROI Dashboard", icon: "📈" },
  { label: "Data Sources", icon: "🧱" },
  { label: "Policies", icon: "🔧" },
  { label: "Investigations", icon: "🔎" },
  { label: "Settings", icon: "⚙️" },
];

const dummyAlerts = [
  { level: "high", title: "Spike in fall risk on Unit A7", detail: "+34% vs. 7‑day baseline", time: "7m" },
  { level: "med", title: "Sensor packet loss: Fleet‑02", detail: "3.8% frames dropped", time: "25m" },
  { level: "low", title: "Model drift creeping", detail: "PSI 0.21 on RISK_V3", time: "1h" },
];

const topDrivers = [
  { name: "Near‑miss events (last 24h)", weight: +0.37 },
  { name: "Battery temp variance", weight: +0.22 },
  { name: "Operator override frequency", weight: +0.18 },
  { name: "Terrain grade (>8%)", weight: +0.11 },
  { name: "Compliance score", weight: -0.09 },
];

const baseActivity = [
  { id: "EVT-9217", tag: "override", impact: "+12%", ts: "19:42" },
  { id: "EVT-9211", tag: "near‑miss", impact: "+7%", ts: "18:20" },
  { id: "EVT-9198", tag: "inspection", impact: "−5%", ts: "16:03" },
  { id: "EVT-9182", tag: "policy‑update", impact: "−3%", ts: "13:11" },
];

function RiskGauge({ score = 72 }) {
  const pct = Math.max(0, Math.min(100, score));
  const angle = (pct / 100) * 360;
  return (
    <div className="relative w-44 h-44 xl:w-48 xl:h-48 shrink-0">
      <div
        className="w-full h-full rounded-full"
        style={{
          background: `conic-gradient(hsl(142, 70%, 45%) 0deg, hsl(40, 90%, 50%) ${angle * 0.7}deg, hsl(0, 85%, 55%) ${angle}deg, hsl(224, 14%, 14%) ${angle}deg)`,
          boxShadow: "inset 0 0 0 10px rgba(255,255,255,0.04)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl xl:text-5xl font-semibold tracking-tight">{pct}</div>
          <div className="text-xs uppercase text-muted-foreground mt-1">Risk Score</div>
        </div>
      </div>
    </div>
  );
}

function AlertPill({ level }) {
  const map = {
    high: "bg-red-500/10 text-red-400 border-red-500/30",
    med: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    low: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  };
  return <span className={`text-[10px] px-2 py-1 rounded-full border ${map[level]}`}>{level}</span>;
}

export default function RiskDashboard() {
  const router = useRouter();
  const [active, setActive] = useState("Risk Scoring");
  const [activityRange, setActivityRange] = useState("24h");
  const [showAssistant, setShowAssistant] = useState(true);

  // Mocked range filter so tabs feel functional
  const recentActivity = useMemo(() => {
    if (activityRange === "7d") return [...baseActivity, ...baseActivity];
    if (activityRange === "30d") return [...baseActivity, ...baseActivity, ...baseActivity];
    return baseActivity;
  }, [activityRange]);

  // Demo data for charts (replace with live streams)
  const fleetData = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        t: i + 1,
        active: 180 + Math.round(Math.sin(i / 2) * 20),
        offline: 12 + Math.round(Math.cos(i / 3) * 6),
        incidents: Math.max(0, 5 + Math.round(Math.sin(i) * 3)),
      })),
    []
  );

  const weatherData = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        t: i + 1,
        wind: 8 + Math.round(Math.sin(i / 1.7) * 4),
        precip: Math.max(0, 40 + Math.round(Math.cos(i / 2.3) * 25)),
        temp: 18 + Math.round(Math.sin(i / 3.1) * 6),
      })),
    []
  );

  const riskData = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        t: i + 1,
        score: 68 + Math.round(Math.sin(i / 2.2) * 6) + Math.round(Math.cos(i / 4) * 3),
        exposure: 1.2 + Math.sin(i / 5) * 0.2,
      })),
    []
  );

  // Simple assistant mock state
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! Ask me about drivers, guardrails, or ROI. I'll ground answers in the current cohort." },
  ]);
  const [input, setInput] = useState("");

  const quickPrompts = [
    "Why did the risk score rise today?",
    "Summarize drift on RISK_V3 and propose fixes.",
    "Which guardrails reduce falls without hurting ROI?",
  ];

  function send(msg) {
    const text = (msg || input).trim();
    if (!text) return;
    setMessages((m) => [
      ...m,
      { role: "user", text },
      { role: "assistant", text: "(demo) I'd pull SHAP, policy deltas, and recent alerts to answer this. Plug your LLM to replace me." },
    ]);
    setInput("");
  }

  const handleNavClick = (label) => {
    setActive(label);
    switch(label) {
      case "Guardrail Engine":
        router.push("/guardrail-engine");
        break;
      case "Compliance Engine":
        router.push("/compliance-engine");
        break;
      case "ROI Dashboard":
        router.push("/roi-dashboard");
        break;
      default:
        // Stay on current page for other items
        break;
    }
  };

  return (
    <div className="h-dvh w-screen overflow-hidden bg-gradient-to-b from-background to-muted/20 text-foreground flex">
      {/* Left Rail (ChatGPT/Attio style) */}
      <aside className="w-64 shrink-0 border-r bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col min-w-0">
        <div className="px-4 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 grid place-items-center">✨</div>
          <div className="min-w-0">
            <div className="text-sm text-muted-foreground truncate">Nova</div>
            <div className="font-semibold leading-tight truncate">Risk Platform</div>
          </div>
        </div>
        <Separator />
        <ScrollArea className="flex-1">
          <nav className="px-2 py-2 space-y-1">
            {nav.map((item) => {
              const isActive = active === item.label;
              return (
                <Button
                  key={item.label}
                  onClick={() => handleNavClick(item.label)}
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2 text-sm"
                >
                  <span className="w-4 text-center">{item.icon}</span> {item.label}
                </Button>
              );
            })}
          </nav>
          <div className="px-3 py-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Spaces</div>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-between">
                Default Workspace <span>›</span>
              </Button>
              <Button variant="outline" className="w-full justify-between">
                Underwriting <span>›</span>
              </Button>
            </div>
          </div>
        </ScrollArea>
        <div className="p-3 border-t">
          <Button 
            className="w-full justify-center gap-2" 
            variant="outline" 
            onClick={() => setShowAssistant(!showAssistant)}
          >
            💬 Nova Assistant
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 shrink-0 border-b backdrop-blur supports-[backdrop-filter]:bg-background/60 bg-background/80 px-4 flex items-center gap-3">
          <Input placeholder="Search robots, policies, events…" className="max-w-xl" />
          <div className="ml-auto flex items-center gap-3">
            <Badge variant="secondary" className="gap-1">🟢 Live</Badge>
            <Avatar>
              <AvatarFallback>GG</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Body */}
        <ScrollArea className="flex-1 px-6 py-6">
          <div className="grid grid-cols-12 gap-5 min-w-0">
            {/* Score + Drivers */}
            <Card className="col-span-12 xl:col-span-5 min-w-0">
              <CardContent className="p-6 flex items-center gap-6 min-w-0">
                <RiskGauge score={72} />
                <div className="space-y-3 min-w-0">
                  <div className="text-sm text-muted-foreground">Portfolio</div>
                  <div className="text-2xl font-semibold tracking-tight">Global Risk: 72 / 100</div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="outline" className="gap-1">⬇︎ −4.2% 7‑day</Badge>
                    <Badge variant="outline" className="gap-1">⬆︎ +9.5% 30‑day</Badge>
                  </div>
                  <Separator />
                  <div className="text-xs uppercase text-muted-foreground">Top Drivers</div>
                  <ul className="space-y-1">
                    {topDrivers.map((d) => (
                      <li key={d.name} className="flex items-center justify-between text-sm">
                        <span className="truncate pr-3">{d.name}</span>
                        <span className={d.weight >= 0 ? "text-red-400" : "text-emerald-400"}>{d.weight > 0 ? `+${d.weight.toFixed(2)}` : d.weight.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card className="col-span-12 xl:col-span-4 min-w-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold">Realtime Alerts</div>
                  <Button variant="ghost" className="h-8">View all</Button>
                </div>
                <div className="space-y-3">
                  {dummyAlerts.map((a, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border bg-card/40">
                      <AlertPill level={a.level} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium leading-tight truncate">{a.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{a.detail}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">{a.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Explainers */}
            <Card className="col-span-12 xl:col-span-3 min-w-0">
              <CardContent className="p-6">
                <div className="font-semibold mb-3">Model Explainability</div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span>✅</span>
                    <div>
                      <div className="font-medium">SHAP Snapshot</div>
                      <div className="text-muted-foreground">Top 5 features contributing to current score.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>⚠️</span>
                    <div>
                      <div className="font-medium">Policy Impact</div>
                      <div className="text-muted-foreground">2 guardrails raised score by +6 in the last 24h.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span>🛡️</span>
                    <div>
                      <div className="font-medium">Residual Risk</div>
                      <div className="text-muted-foreground">Expected loss at current operating plan: 0.42%.</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts Row 1 */}
            <Card className="col-span-12 xl:col-span-4 min-w-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">Fleet Status</div>
                  <Badge variant="secondary" className="text-[10px]">Last 12 intervals</Badge>
                </div>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RBarChart data={fleetData} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="t" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} />
                      <RTooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="active" stackId="a" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="offline" stackId="a" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="incidents" />
                    </RBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-12 xl:col-span-4 min-w-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">Weather Status</div>
                  <Badge variant="secondary" className="text-[10px]">Wind · Precip · Temp</Badge>
                </div>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RAreaChart data={weatherData} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                      <defs>
                        <linearGradient id="w1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="currentColor" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="currentColor" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="t" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} />
                      <RTooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area type="monotone" dataKey="precip" strokeWidth={2} fillOpacity={1} fill="url(#w1)" />
                      <Area type="monotone" dataKey="wind" strokeWidth={2} fillOpacity={0.2} />
                      <Area type="monotone" dataKey="temp" strokeWidth={2} fillOpacity={0.15} />
                    </RAreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-12 xl:col-span-4 min-w-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold">Overall Risk (Adaptive)</div>
                  <Badge variant="secondary" className="text-[10px]">Score vs Exposure</Badge>
                </div>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RLineChart data={riskData} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="t" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} />
                      <RTooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="score" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="exposure" strokeWidth={2} dot={false} />
                    </RLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card className="col-span-12 min-w-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="font-semibold">Recent Activity</div>
                  <div className="flex gap-2">
                    {["24h", "7d", "30d"].map((r) => (
                      <Button key={r} variant={activityRange === r ? "secondary" : "outline"} onClick={() => setActivityRange(r)}>
                        {r}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  {recentActivity.map((e) => (
                    <motion.div
                      key={e.id + activityRange}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 rounded-xl border bg-card/40"
                    >
                      <div className="text-xs text-muted-foreground">{e.id}</div>
                      <div className="mt-1 text-sm font-medium capitalize">{e.tag.replace("-", " ")}</div>
                      <div className="text-xs text-muted-foreground">Impact: {e.impact}</div>
                      <div className="text-xs text-muted-foreground">{e.ts}</div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>

      {/* Chatbot Dock - Animated Collapse/Expand */}
      <AnimatePresence>
        {showAssistant && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 360, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="shrink-0 border-l bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex-col overflow-hidden"
            style={{ display: 'flex' }}
          >
            <div className="h-16 border-b px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div>💬</div>
                <div className="font-semibold">Nova Assistant</div>
              </div>
              <Button 
                variant="ghost" 
                className="h-8 w-8 p-0"
                onClick={() => setShowAssistant(false)}
              >
                ×
              </Button>
            </div>
        <ScrollArea className="flex-1 p-4 space-y-3">
          <div className="text-xs text-muted-foreground">Try asking:</div>
          <div className="grid grid-cols-1 gap-2">
            {quickPrompts.map((q) => (
              <Button key={q} variant="outline" className="justify-start text-left text-sm whitespace-normal" onClick={() => send(q)}>
                {q}
              </Button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            <div className="text-xs uppercase text-muted-foreground">Context Cards</div>
            <div className="grid grid-cols-1 gap-2">
              <Card className="border-dashed">
                <CardContent className="p-3 text-sm">
                  <div className="font-medium">Underwriting context</div>
                  <div className="text-muted-foreground">LOB: Robotics Liability · Region: NA/EU · Policy: NOVA‑HX</div>
                </CardContent>
              </Card>
              <Card className="border-dashed">
                <CardContent className="p-3 text-sm">
                  <div className="font-medium">Active cohort</div>
                  <div className="text-muted-foreground">Humanoids: 2,418 · Fleet owners: 126 · Telemetry coverage: 96%</div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 space-y-2">
              <div className="text-xs uppercase text-muted-foreground">Thread</div>
              <div className="space-y-2">
                {messages.map((m, i) => (
                  <div key={i} className={`p-3 rounded-xl border ${m.role === "user" ? "bg-primary/5" : "bg-card/40"}`}>
                    <div className="text-xs text-muted-foreground mb-1">{m.role}</div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
        <div className="p-3 border-t">
          <div className="flex items-center gap-2">
            <Input placeholder="Ask Nova… (⌘K)" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
            <Button className="gap-2" onClick={() => send()}>↩︎ Send</Button>
          </div>
            <div className="mt-2 text-[10px] text-muted-foreground">Private by default • Grounded with your data • Citations on request</div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}