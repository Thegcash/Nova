// @ts-nocheck
"use client";
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
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

const CardHeader = ({ className = "", title, subtitle, right }) => (
  <div className={`p-4 pb-0 flex items-start justify-between ${className}`}>
    <div>
      <div className="font-semibold leading-tight">{title}</div>
      {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
    </div>
    {right}
  </div>
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

const Select = ({ className = "", children, ...props }) => (
  <select className={`h-9 px-3 rounded-xl border bg-background ${className}`} {...props}>{children}</select>
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

const Checkbox = ({ checked, onChange }) => (
  <input type="checkbox" className="h-4 w-4 rounded border" checked={checked} onChange={(e) => onChange?.(e.target.checked)} />
);

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

// Mock data
const templates = [
  { id: "TMP-OVR-01", name: "Limit operator overrides", tag: "Safety", desc: "Max overrides per shift" },
  { id: "TMP-SPD-02", name: "Speed cap near humans", tag: "Proximity", desc: "Limit speed within 3m" },
  { id: "TMP-TRN-07", name: "Steep terrain guard", tag: "Terrain", desc: "> 8% grade mitigation" },
  { id: "TMP-BAT-03", name: "Battery temp window", tag: "Thermal", desc: "Auto-derate > 70°C" },
];

const mockViolations = Array.from({ length: 6 }, (_, i) => ({
  id: `V-${9110 + i}`,
  guardrail: i % 2 ? "Speed cap near humans" : "Limit operator overrides",
  severity: ["low", "med", "high"][i % 3],
  fleet: `FLEET-0${(i % 3) + 1}`,
  time: `${12 + i}:0${i}`,
}));

function Metric({ title, value, note }) {
  return (
    <div className="p-3 rounded-xl border bg-card/40">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
      {note && <div className="text-[10px] text-muted-foreground">{note}</div>}
    </div>
  );
}

export default function GuardrailEngine() {
  const router = useRouter();
  const [active, setActive] = useState("Guardrail Engine");
  const [showAssistant, setShowAssistant] = useState(true);
  const [name, setName] = useState("Reduce near-miss events without hurting throughput");
  const [signal, setSignal] = useState("near_miss_rate");
  const [condition, setCondition] = useState("> 2 / 24h");
  const [action, setAction] = useState("Auto-derate speed by 15% and alert supervisor");
  const [scopeFleet, setScopeFleet] = useState("All Fleets");
  const [scopeZones, setScopeZones] = useState(["Warehouse A", "Line B"]);
  const [dryRun, setDryRun] = useState(true);

  // Sim data
  const sim = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        t: i + 1,
        baseline: 12 + Math.round(Math.sin(i / 2) * 4) + (i % 3 === 0 ? 3 : 0),
        withRule: 10 + Math.round(Math.sin(i / 2) * 3),
      })),
    []
  );

  const throughput = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        t: i + 1,
        baseline: 100 + Math.round(Math.cos(i / 3) * 8),
        withRule: 98 + Math.round(Math.cos(i / 3) * 8) - (i % 5 === 0 ? 2 : 0),
      })),
    []
  );

  const handleNavClick = (label) => {
    setActive(label);
    switch(label) {
      case "Risk Scoring":
        router.push("/risk-dashboard");
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
      {/* Left Rail */}
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

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 shrink-0 border-b px-4 flex items-center gap-3 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Input placeholder="Search guardrails, policies, events…" className="max-w-xl" />
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="secondary">Draft</Badge>
            <Badge variant="outline">Last saved 2m ago</Badge>
          </div>
        </div>

        {/* Body */}
        <ScrollArea className="flex-1 p-6">
          <div className="grid grid-cols-12 gap-5 min-w-0">
            {/* Builder Left: Definition */}
            <Card className="col-span-12 xl:col-span-6 min-w-0">
              <CardHeader title="Rule Definition" subtitle="Name the goal, choose a signal, set a condition and an action." right={<Button variant="outline">Save Draft</Button>} />
              <CardContent className="space-y-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Goal Name</div>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Signal</div>
                    <Select value={signal} onChange={(e) => setSignal(e.target.value)}>
                      <option value="near_miss_rate">near_miss_rate</option>
                      <option value="fall_probability">fall_probability</option>
                      <option value="override_count">override_count</option>
                      <option value="battery_temp">battery_temp</option>
                    </Select>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Condition</div>
                    <Input value={condition} onChange={(e) => setCondition(e.target.value)} placeholder="> 2 / 24h" />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Action</div>
                  <Input value={action} onChange={(e) => setAction(e.target.value)} placeholder="Auto-derate speed by 15% and alert supervisor" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Scope: Fleet</div>
                    <Select value={scopeFleet} onChange={(e) => setScopeFleet(e.target.value)}>
                      <option>All Fleets</option>
                      <option>FLEET-01</option>
                      <option>FLEET-02</option>
                      <option>FLEET-03</option>
                    </Select>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Scope: Zones</div>
                    <Input value={scopeZones.join(", ")} onChange={(e) => setScopeZones(e.target.value.split(",").map((s) => s.trim()))} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox checked={dryRun} onChange={setDryRun} />
                  <div className="text-sm">Dry-run (log only, no live actuation)</div>
                </div>
                <div className="flex gap-2">
                  <Button>Test Rule</Button>
                  <Button variant="outline">Publish</Button>
                </div>
              </CardContent>
            </Card>

            {/* Builder Right: Simulation & KPIs */}
            <Card className="col-span-12 xl:col-span-6 min-w-0">
              <CardHeader title="Simulation" subtitle="Compare baseline vs with-rule outcomes before rollout." right={<Badge variant="secondary">sandbox</Badge>} />
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="h-[220px]">
                    <div className="text-sm font-medium mb-1">Near-miss rate</div>
                    <ResponsiveContainer width="100%" height="100%">
                      <RLineChart data={sim} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="t" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} fontSize={12} />
                        <RTooltip />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Line type="monotone" dataKey="baseline" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="withRule" strokeWidth={2} dot={false} />
                      </RLineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-[220px]">
                    <div className="text-sm font-medium mb-1">Throughput impact</div>
                    <ResponsiveContainer width="100%" height="100%">
                      <RAreaChart data={throughput} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="t" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} fontSize={12} />
                        <RTooltip />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Area type="monotone" dataKey="baseline" strokeWidth={2} fillOpacity={0.15} />
                        <Area type="monotone" dataKey="withRule" strokeWidth={2} fillOpacity={0.15} />
                      </RAreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                  <Metric title="Risk reduction" value="−18%" note="near_miss_rate" />
                  <Metric title="Loss ratio delta" value="−2.6%" note="expected" />
                  <Metric title="Compliance" value="+3 guardrails" note="enabled" />
                  <Metric title="ROI window" value="6–8 wks" note="payback" />
                </div>
              </CardContent>
            </Card>

            {/* Templates */}
            <Card className="col-span-12 xl:col-span-4 min-w-0">
              <CardHeader title="Templates" subtitle="Start from a proven pattern." right={<Button variant="outline">View all</Button>} />
              <CardContent className="space-y-2">
                {templates.map((t) => (
                  <div key={t.id} className="p-3 rounded-xl border bg-card/40">
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.desc}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge variant="secondary">{t.tag}</Badge>
                      <Button variant="outline">Use</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Violations */}
            <Card className="col-span-12 xl:col-span-8 min-w-0">
              <CardHeader title="Recent Violations" subtitle="Monitor breaches tied to candidate guardrails." right={<Button variant="ghost">Export CSV</Button>} />
              <CardContent className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-2">ID</th>
                      <th className="py-2 pr-2">Guardrail</th>
                      <th className="py-2 pr-2">Severity</th>
                      <th className="py-2 pr-2">Fleet</th>
                      <th className="py-2 pr-2">Time</th>
                      <th className="py-2 pr-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockViolations.map((v) => (
                      <tr key={v.id} className="border-t">
                        <td className="py-2 pr-2">{v.id}</td>
                        <td className="py-2 pr-2">{v.guardrail}</td>
                        <td className="py-2 pr-2">
                          <Badge variant={v.severity === "high" ? "solid" : "secondary"}>
                            {v.severity}
                          </Badge>
                        </td>
                        <td className="py-2 pr-2">{v.fleet}</td>
                        <td className="py-2 pr-2">{v.time}</td>
                        <td className="py-2 pr-2 text-right">
                          <Button variant="outline">Investigate</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Rollout */}
            <Card className="col-span-12 min-w-0">
              <CardHeader title="Rollout Plan" subtitle="Choose cohorts, % of traffic, and monitoring windows." right={<Badge variant="secondary">staged</Badge>} />
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Cohort</div>
                    <Select>
                      <option>All fleets</option>
                      <option>FLEET-01</option>
                      <option>FLEET-02</option>
                      <option>FLEET-03</option>
                    </Select>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Traffic %</div>
                    <Input placeholder="10, 25, 50, 100" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Monitor window</div>
                    <Select>
                      <option>24 hours</option>
                      <option>7 days</option>
                      <option>30 days</option>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full">Schedule Rollout</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>

      {/* Right Dock: Assistant - Animated Collapse/Expand */}
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
                {[
                  "Suggest guardrails to cut near-miss rate without hurting throughput.",
                  "What's the expected ROI if I cap speed near humans?",
                  "Which fleets violate override limits most?",
                ].map((q) => (
                  <Button key={q} variant="outline" className="justify-start text-left text-sm whitespace-normal">
                    {q}
                  </Button>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                <div className="text-xs uppercase text-muted-foreground">Context</div>
                <div className="grid grid-cols-1 gap-2">
                  <Card className="border-dashed">
                    <CardContent className="p-3 text-sm">
                      <div className="font-medium">Active draft</div>
                      <div className="text-muted-foreground">{name}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-dashed">
                    <CardContent className="p-3 text-sm">
                      <div className="font-medium">Scope</div>
                      <div className="text-muted-foreground">{scopeFleet} · {scopeZones.join(", ")}</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
            <div className="p-3 border-t">
              <div className="text-[10px] text-muted-foreground">Private by default • Grounded with your data • Citations on request</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}