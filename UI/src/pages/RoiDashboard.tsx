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
  ComposedChart,
} from 'recharts';

// Enhanced UI primitives matching your design
const Card = ({ className = "", children }) => (
  <div className={`rounded-2xl border bg-card/40 shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ className = "", title, subtitle, right }) => (
  <div className={`p-4 pb-0 flex items-start justify-between ${className}`}>
    <div>
      <div className="font-semibold leading-tight">{title}</div>
      {subtitle ? <div className="text-xs text-muted-foreground mt-1">{subtitle}</div> : null}
    </div>
    {right || null}
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

const Separator = () => <div className="h-px w-full bg-foreground/10" />;

const ScrollArea = ({ className = "", children }) => (
  <div className={`overflow-auto ${className}`}>{children}</div>
);

// Navigation items
const nav = [
  { label: "Risk Scoring", icon: "🧭", path: "/risk-dashboard" },
  { label: "Guardrail Engine", icon: "🛡️", path: "/guardrail-engine" },
  { label: "Compliance Engine", icon: "⚖️", path: "/compliance-engine" },
  { label: "ROI Dashboard", icon: "📈", path: "/roi-dashboard" },
  { label: "Data Sources", icon: "🧱", path: "/data-sources" },
  { label: "Policies", icon: "🔧", path: "/policies" },
  { label: "Investigations", icon: "🔎", path: "/investigations" },
  { label: "Settings", icon: "⚙️", path: "/settings" },
];

// KPI helper (define early to avoid parser confusion)
function KPI({ title, value, note }) {
  return (
    <div className="p-3 rounded-xl border bg-card/40">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
      {note ? <div className="text-[10px] text-muted-foreground">{note}</div> : null}
    </div>
  );
}

export default function NovaROIDashboard() {
  const router = useRouter();
  const [active, setActive] = useState("ROI Dashboard");
  const [region, setRegion] = useState("Global");
  const [cohort, setCohort] = useState("All Fleets");
  const [scenario, setScenario] = useState("expected"); // baseline | expected | aggressive
  const [costPerIncident, setCostPerIncident] = useState(12000);
  const [monthlyGuardrailCost, setMonthlyGuardrailCost] = useState(45000);
  const [showTests, setShowTests] = useState(true); // dev tests
  const [showAssistant, setShowAssistant] = useState(true);

  // Derived
  const scenMul = scenario === "baseline" ? 0.9 : scenario === "aggressive" ? 1.1 : 1.0;
  const monthlySavingsDisplay = Math.round(220000 * scenMul);
  const netPerMonth = 220000 * scenMul - monthlyGuardrailCost;
  const roiPct = Math.round(((220000 * scenMul - monthlyGuardrailCost) / Math.max(1, monthlyGuardrailCost)) * 100);
  const paybackMonths = Math.max(1, Math.ceil(450000 / Math.max(1, netPerMonth)));

  // Data
  const lossTrend = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 12; i++) {
      arr.push({
        m: i + 1,
        baseline: 0.72 + Math.sin(i / 3) * 0.03,
        withNova: 0.66 + Math.sin(i / 3) * 0.02 - 0.02,
      });
    }
    return arr;
  }, []);

  const savings = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 6; i++) {
      arr.push({
        p: "M" + (i + 1),
        incidentAvoid: 180000 + i * 8000,
        downtimeAvoid: 90000 + i * 6000,
        complianceAvoid: 40000 + i * 3000,
        operatingCost: 45000,
      });
    }
    return arr;
  }, []);

  const payback = useMemo(() => {
    let cum = 0;
    const arr = [];
    for (let i = 0; i < 12; i++) {
      const monthlySavings = 220000 + i * 8000;
      const net = monthlySavings - monthlyGuardrailCost;
      cum += net;
      arr.push({ m: i + 1, cumulative: cum });
    }
    return arr;
  }, [monthlyGuardrailCost]);

  const cohortCompare = useMemo(() => [
    { name: "All Fleets", before: 6.2, after: 4.7 },
    { name: "FLEET-01", before: 7.1, after: 5.0 },
    { name: "FLEET-02", before: 5.8, after: 4.4 },
    { name: "FLEET-03", before: 6.6, after: 5.1 },
  ], []);

  const waterfall = useMemo(() => [
    { k: "Baseline Loss", v: 100 },
    { k: "Guardrails", v: -18 },
    { k: "Better Routing", v: -7 },
    { k: "Operator Training", v: -5 },
    { k: "Weather Adaption", v: -4 },
    { k: "Residual Loss", v: 66 },
  ], []);

  const initiatives = [
    { id: "ROI-101", name: "Speed cap near humans", cost: 12000, benefit: 68000, owner: "Ops", status: "Live" },
    { id: "ROI-114", name: "Override limit policy", cost: 8000, benefit: 41000, owner: "Risk", status: "Live" },
    { id: "ROI-129", name: "Thermal derate v2", cost: 15000, benefit: 52000, owner: "Eng", status: "Pilot" },
    { id: "ROI-141", name: "Terrain mapping upgrade", cost: 20000, benefit: 61000, owner: "Eng", status: "Planned" },
  ];

  const handleNavClick = (item) => {
    setActive(item.label);
    if (item.path) {
      router.push(item.path);
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
                  onClick={() => handleNavClick(item)}
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
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Region</Badge>
            <Select value={region} onChange={(e) => setRegion(e.target.value)}>
              <option>Global</option>
              <option>NA</option>
              <option>EU</option>
              <option>APAC</option>
              <option>LATAM</option>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Cohort</Badge>
            <Select value={cohort} onChange={(e) => setCohort(e.target.value)}>
              <option>All Fleets</option>
              <option>FLEET-01</option>
              <option>FLEET-02</option>
              <option>FLEET-03</option>
            </Select>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="secondary">Scenario</Badge>
            <div className="flex gap-1">
              {['baseline','expected','aggressive'].map((s) => (
                <Button key={s} variant={scenario === s ? 'secondary' : 'outline'} onClick={() => setScenario(s)} className="px-2 capitalize">{s}</Button>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <ScrollArea className="flex-1 p-6">
          <div className="grid grid-cols-12 gap-5 min-w-0">
            {/* KPIs */}
            <Card className="col-span-12 xl:col-span-6 min-w-0">
              <CardHeader title="Financial KPIs" subtitle="Scenario-adjusted view" right={<Badge variant="secondary">{scenario}</Badge>} />
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <KPI title="Monthly savings" value={"$" + monthlySavingsDisplay.toLocaleString()} note="incident + downtime + compliance" />
                  <KPI title="Monthly cost" value={"$" + monthlyGuardrailCost.toLocaleString()} note="guardrails + runtime" />
                  <KPI title="ROI" value={roiPct + "%"} note="(savings - cost) / cost" />
                  <KPI title="Payback" value={paybackMonths + " mo"} note="est. to break even" />
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Cost per incident ($)</div>
                    <Input type="number" value={costPerIncident} onChange={(e) => setCostPerIncident(parseInt(e.target.value || '0', 10))} />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Monthly guardrail cost ($)</div>
                    <Input type="number" value={monthlyGuardrailCost} onChange={(e) => setMonthlyGuardrailCost(parseInt(e.target.value || '0', 10))} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payback */}
            <Card className="col-span-12 xl:col-span-6 min-w-0">
              <CardHeader title="Payback Curve" subtitle="Cumulative net savings" right={<Badge variant="secondary">projection</Badge>} />
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RAreaChart data={payback} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} />
                      <RTooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Area type="monotone" dataKey="cumulative" strokeWidth={2} fillOpacity={0.15} />
                    </RAreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Loss Ratio Trend */}
            <Card className="col-span-12 xl:col-span-7 min-w-0">
              <CardHeader title="Loss Ratio Trend" subtitle="Baseline vs with Nova" right={<Badge variant="secondary">monthly</Badge>} />
              <CardContent>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RLineChart data={lossTrend} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="m" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickFormatter={(v) => (v * 100).toFixed(0) + '%'} tickLine={false} axisLine={false} fontSize={12} />
                      <RTooltip formatter={(v) => (Array.isArray(v) ? v : (typeof v === 'number' ? (v * 100).toFixed(1) + '%' : v))} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="baseline" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="withNova" strokeWidth={2} dot={false} />
                    </RLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Savings Breakdown */}
            <Card className="col-span-12 xl:col-span-5 min-w-0">
              <CardHeader title="Savings Breakdown" subtitle="Incident/Downtime/Compliance vs Cost" right={<Badge variant="secondary">last 6 mo</Badge>} />
              <CardContent>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RBarChart data={savings} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="p" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickFormatter={(v) => '$' + Math.round(v / 1000) + 'k'} tickLine={false} axisLine={false} fontSize={12} />
                      <RTooltip formatter={(v) => '$' + Number(v).toLocaleString()} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="incidentAvoid" stackId="s" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="downtimeAvoid" stackId="s" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="complianceAvoid" stackId="s" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="operatingCost" />
                    </RBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Cohort Comparison */}
            <Card className="col-span-12 xl:col-span-6 min-w-0">
              <CardHeader title="Cohort Comparison" subtitle="Incidents per 1k hours (before vs after)" right={<Badge variant="secondary">by fleet</Badge>} />
              <CardContent>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={cohortCompare} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} />
                      <RTooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="before" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="after" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Uplift vs Baseline */}
            <Card className="col-span-12 xl:col-span-6 min-w-0">
              <CardHeader title="Uplift vs Baseline" subtitle="Contribution by lever" right={<Badge variant="secondary">modeled</Badge>} />
              <CardContent>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RBarChart data={waterfall} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="k" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickFormatter={(v) => String(v) + '%'} tickLine={false} axisLine={false} fontSize={12} />
                      <RTooltip formatter={(v) => String(v) + '%'} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="v" />
                    </RBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Initiatives Table */}
            <Card className="col-span-12 min-w-0">
              <CardHeader title="Initiatives" subtitle="Cost vs benefit and rollout status" right={<Button variant="outline">Export CSV</Button>} />
              <CardContent className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-2">ID</th>
                      <th className="py-2 pr-2">Name</th>
                      <th className="py-2 pr-2">Owner</th>
                      <th className="py-2 pr-2">Cost</th>
                      <th className="py-2 pr-2">Benefit (mo)</th>
                      <th className="py-2 pr-2">Net (mo)</th>
                      <th className="py-2 pr-2">Status</th>
                      <th className="py-2 pr-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {initiatives.map((x) => (
                      <tr key={x.id} className="border-t">
                        <td className="py-2 pr-2">{x.id}</td>
                        <td className="py-2 pr-2">{x.name}</td>
                        <td className="py-2 pr-2">{x.owner}</td>
                        <td className="py-2 pr-2">{"$" + x.cost.toLocaleString()}</td>
                        <td className="py-2 pr-2">{"$" + x.benefit.toLocaleString()}</td>
                        <td className="py-2 pr-2">{"$" + (x.benefit - x.cost).toLocaleString()}</td>
                        <td className="py-2 pr-2">{x.status}</td>
                        <td className="py-2 pr-2 text-right"><Button variant="outline">Open</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* DEV: Sanity Tests (acts as test cases) */}
            {showTests ? (
              <Card className="col-span-12">
                <CardHeader title="DEV • Sanity Tests" subtitle="Visual checks to prevent JSX/logic regressions" right={<Button variant="outline" onClick={() => setShowTests(false)}>Hide</Button>} />
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <KPI title="KPI basic" value="$1,234" />
                    <KPI title="KPI with note" value="98%" note="ratio" />
                    <KPI title="KPI long title should not overflow" value="$0" note="note" />
                    <KPI title="Edge 0%" value={'0%'} />
                  </div>
                  <Separator />
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="p-3 rounded-xl border bg-card/40">
                      <div className="font-medium">ROI calc sanity</div>
                      <div>ROI % (current): {roiPct}%</div>
                      <div>Payback months (min 1): {paybackMonths}</div>
                    </div>
                    <div className="p-3 rounded-xl border bg-card/40">
                      <div className="font-medium">LossTrend sample</div>
                      <div>First baseline: {(lossTrend[0].baseline * 100).toFixed(1)}%</div>
                      <div>First withNova: {(lossTrend[0].withNova * 100).toFixed(1)}%</div>
                    </div>
                    <div className="p-3 rounded-xl border bg-card/40">
                      <div className="font-medium">Waterfall tail</div>
                      <div>Residual Loss: {waterfall[waterfall.length - 1].v}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}
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
                  "What's the projected payback if operating costs rise 10%?",
                  "Which fleet delivers the highest ROI per $1k?",
                  "Break down savings attributable to guardrails vs training.",
                ].map((q) => (
                  <Button key={q} variant="outline" className="justify-start text-left text-sm whitespace-normal">{q}</Button>
                ))}
              </div>
              <div className="mt-4 space-y-3">
                <div className="text-xs uppercase text-muted-foreground">Scenario</div>
                <div className="grid grid-cols-1 gap-2">
                  <Card className="border-dashed">
                    <CardContent className="p-3 text-sm">
                      <div className="font-medium">Active</div>
                      <div className="text-muted-foreground">{scenario} • {region} • {cohort}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-dashed">
                    <CardContent className="p-3 text-sm">
                      <div className="font-medium">Assumptions</div>
                      <div className="text-muted-foreground">Incident cost {"$" + costPerIncident.toLocaleString()} • Monthly cost {"$" + monthlyGuardrailCost.toLocaleString()}</div>
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