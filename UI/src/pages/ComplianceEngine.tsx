// @ts-nocheck
"use client";
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart as RBarChart,
  Bar,
  LineChart as RLineChart,
  Line,
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
  { label: "Risk Scoring", icon: "🧭", path: "/risk-dashboard" },
  { label: "Guardrail Engine", icon: "🛡️", path: "/guardrail-engine" },
  { label: "Compliance Engine", icon: "⚖️", path: "/compliance-engine" },
  { label: "ROI Dashboard", icon: "📈", path: "/roi-dashboard" },
  { label: "Data Sources", icon: "🧱", path: "/data-sources" },
  { label: "Policies", icon: "🔧", path: "/policies" },
  { label: "Investigations", icon: "🔎", path: "/investigations" },
  { label: "Settings", icon: "⚙️", path: "/settings" },
];

const complianceNav = [
  "Overview",
  "Policies",
  "Controls",
  "Evidence",
  "Jurisdictions",
  "Attestations",
  "Exceptions",
  "Tasks",
  "Audit Trail",
  "Settings",
];

const mockPolicies = [
  { id: "POL-001", name: "Proximity Safety", owner: "A. Patel", version: "v3.2", status: "Compliant", updated: "2025-09-27", evidence: 6 },
  { id: "POL-014", name: "Thermal Management", owner: "R. Chen", version: "v1.9", status: "Partial", updated: "2025-09-21", evidence: 3 },
  { id: "POL-022", name: "Override Governance", owner: "J. Alvarez", version: "v2.1", status: "Gap", updated: "2025-08-30", evidence: 1 },
  { id: "POL-031", name: "Terrain & Stability", owner: "L. Kim", version: "v1.4", status: "Compliant", updated: "2025-09-29", evidence: 4 },
];

const evidenceQueue = [
  { id: "EV-9172", type: "Log extract", policy: "Thermal Management", due: "2d", owner: "Ops" },
  { id: "EV-9185", type: "Video clip", policy: "Proximity Safety", due: "5d", owner: "QA" },
  { id: "EV-9201", type: "Telemetry sample", policy: "Override Governance", due: "1d", owner: "Data" },
];

const exceptions = [
  { id: "EX-203", policy: "Override Governance", reason: "Pilot facility", until: "2025-11-15", owner: "Risk" },
  { id: "EX-219", policy: "Thermal Management", reason: "Hardware revision", until: "2025-10-22", owner: "Eng" },
];

const attestations = [
  { id: "AT-101", group: "Fleet Ops", status: "Pending", due: "2025-10-07" },
  { id: "AT-108", group: "Maintenance", status: "Complete", due: "2025-09-25" },
];

const tasks = [
  { id: "T-551", title: "Map guardrails to POL-014 controls", owner: "M. Singh", due: "2025-10-09", status: "Open" },
  { id: "T-558", title: "Upload evidence for EX-219", owner: "QA", due: "2025-10-05", status: "In Progress" },
];

function KPI({ title, value, note }) {
  return (
    <div className="p-3 rounded-xl border bg-card/40">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="text-xl font-semibold">{value}</div>
      {note && <div className="text-[10px] text-muted-foreground">{note}</div>}
    </div>
  );
}

export default function ComplianceEngine() {
  const router = useRouter();
  const [active, setActive] = useState("Compliance Engine");
  const [complianceActive, setComplianceActive] = useState("Overview");
  const [filterRegion, setFilterRegion] = useState("Global");
  const [showGapsOnly, setShowGapsOnly] = useState(false);
  const [showAssistant, setShowAssistant] = useState(true);

  // Jurisdiction status chart (stacked) — counts by region
  const jurisdictionData = useMemo(
    () => [
      { r: "NA", compliant: 12, partial: 2, gap: 1 },
      { r: "EU", compliant: 9, partial: 4, gap: 2 },
      { r: "APAC", compliant: 7, partial: 5, gap: 3 },
      { r: "LATAM", compliant: 5, partial: 4, gap: 4 },
    ],
    []
  );

  // Compliance trend
  const trend = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({ t: i + 1, score: 72 + Math.round(Math.sin(i / 2.5) * 6) })),
    []
  );

  const filteredPolicies = useMemo(() => {
    if (!showGapsOnly) return mockPolicies;
    return mockPolicies.filter((p) => p.status !== "Compliant");
  }, [showGapsOnly]);

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
          <Input placeholder="Search policies, controls, evidence…" className="max-w-xl" />
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="secondary">Region</Badge>
            <Select value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)}>
              <option>Global</option>
              <option>NA</option>
              <option>EU</option>
              <option>APAC</option>
              <option>LATAM</option>
            </Select>
          </div>
        </div>

        {/* Body */}
        <ScrollArea className="flex-1 p-6">
          <div className="grid grid-cols-12 gap-5 min-w-0">
            {/* Overview KPIs */}
            <Card className="col-span-12 xl:col-span-4 min-w-0">
              <CardHeader title="Compliance Overview" subtitle="Snapshot across jurisdictions & policies." right={<Badge variant="secondary">auto-sync</Badge>} />
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <KPI title="Overall compliance" value="84%" note="weighted by jurisdiction" />
                  <KPI title="Open gaps" value="7" note="policies with issues" />
                  <KPI title="Attestations due" value="3" note="next 7 days" />
                  <KPI title="Upcoming audits" value="2" note="this month" />
                </div>
                <Separator />
                <div className="h-[160px] mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <RLineChart data={trend} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="t" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} />
                      <RTooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line type="monotone" dataKey="score" strokeWidth={2} dot={false} />
                    </RLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Jurisdiction status */}
            <Card className="col-span-12 xl:col-span-8 min-w-0">
              <CardHeader title="Jurisdictions" subtitle="Compliant vs partial vs gaps by region." right={<Button variant="outline">View map</Button>} />
              <CardContent>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RBarChart data={jurisdictionData} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="r" tickLine={false} axisLine={false} fontSize={12} />
                      <YAxis tickLine={false} axisLine={false} fontSize={12} />
                      <RTooltip />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="compliant" stackId="a" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="partial" stackId="a" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="gap" />
                    </RBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Policy Register */}
            <Card className="col-span-12 min-w-0">
              <CardHeader
                title="Policy Register"
                subtitle="Sources of truth for each policy with owners, versions, evidence, and status."
                right={
                  <div className="flex items-center gap-2">
                    <Checkbox checked={showGapsOnly} onChange={setShowGapsOnly} />
                    <span className="text-sm">Show gaps/partials only</span>
                    <Button variant="outline">New Policy</Button>
                  </div>
                }
              />
              <CardContent className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-2">ID</th>
                      <th className="py-2 pr-2">Name</th>
                      <th className="py-2 pr-2">Owner</th>
                      <th className="py-2 pr-2">Version</th>
                      <th className="py-2 pr-2">Status</th>
                      <th className="py-2 pr-2">Evidence</th>
                      <th className="py-2 pr-2">Updated</th>
                      <th className="py-2 pr-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPolicies.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="py-2 pr-2">{p.id}</td>
                        <td className="py-2 pr-2">{p.name}</td>
                        <td className="py-2 pr-2">{p.owner}</td>
                        <td className="py-2 pr-2">{p.version}</td>
                        <td className="py-2 pr-2">
                          <Badge variant={p.status === "Compliant" ? "secondary" : "solid"}>{p.status}</Badge>
                        </td>
                        <td className="py-2 pr-2">{p.evidence}</td>
                        <td className="py-2 pr-2">{p.updated}</td>
                        <td className="py-2 pr-2 text-right"><Button variant="outline">Open</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Evidence Queue */}
            <Card className="col-span-12 xl:col-span-4 min-w-0">
              <CardHeader title="Evidence Queue" subtitle="Pending items to verify & attach." right={<Button variant="outline">Upload</Button>} />
              <CardContent className="space-y-2">
                {evidenceQueue.map((e) => (
                  <div key={e.id} className="p-3 rounded-xl border bg-card/40">
                    <div className="text-sm font-medium">{e.type}</div>
                    <div className="text-xs text-muted-foreground">Policy: {e.policy}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge variant="secondary">Due {e.due}</Badge>
                      <Button variant="outline">Attach</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Attestations */}
            <Card className="col-span-12 xl:col-span-4 min-w-0">
              <CardHeader title="Attestations" subtitle="Group sign-offs and deadlines." right={<Button variant="outline">Request</Button>} />
              <CardContent className="space-y-2">
                {attestations.map((a) => (
                  <div key={a.id} className="p-3 rounded-xl border bg-card/40 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{a.group}</div>
                      <div className="text-xs text-muted-foreground">Due {a.due}</div>
                    </div>
                    <Badge variant={a.status === "Complete" ? "secondary" : "solid"}>{a.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Exceptions */}
            <Card className="col-span-12 xl:col-span-4 min-w-0">
              <CardHeader title="Exceptions" subtitle="Temporary waivers with owners & expiry." right={<Button variant="outline">New</Button>} />
              <CardContent className="space-y-2">
                {exceptions.map((x) => (
                  <div key={x.id} className="p-3 rounded-xl border bg-card/40">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{x.policy}</div>
                      <Badge variant="secondary">until {x.until}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">Reason: {x.reason} • Owner: {x.owner}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card className="col-span-12 min-w-0">
              <CardHeader title="Tasks" subtitle="What's next to move compliance forward." right={<Button variant="outline">Assign</Button>} />
              <CardContent className="overflow-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-2">ID</th>
                      <th className="py-2 pr-2">Title</th>
                      <th className="py-2 pr-2">Owner</th>
                      <th className="py-2 pr-2">Due</th>
                      <th className="py-2 pr-2">Status</th>
                      <th className="py-2 pr-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((t) => (
                      <tr key={t.id} className="border-t">
                        <td className="py-2 pr-2">{t.id}</td>
                        <td className="py-2 pr-2">{t.title}</td>
                        <td className="py-2 pr-2">{t.owner}</td>
                        <td className="py-2 pr-2">{t.due}</td>
                        <td className="py-2 pr-2">{t.status}</td>
                        <td className="py-2 pr-2 text-right"><Button variant="outline">Open</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Audit Trail */}
            <Card className="col-span-12 min-w-0">
              <CardHeader title="Audit Trail" subtitle="Immutable log of changes with diffs." right={<Button variant="ghost">Export</Button>} />
              <CardContent className="space-y-2">
                {[
                  { id: "AUD-3112", ts: "2025-10-02 18:20", msg: "POL-014 updated to v1.9 (owner: R. Chen)" },
                  { id: "AUD-3106", ts: "2025-09-29 10:03", msg: "Evidence EV-9185 attached to POL-001" },
                  { id: "AUD-3099", ts: "2025-09-25 07:41", msg: "Exception EX-219 approved (until 2025-10-22)" },
                ].map((ev) => (
                  <motion.div key={ev.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-3 rounded-xl border bg-card/40">
                    <div className="text-xs text-muted-foreground">{ev.id} • {ev.ts}</div>
                    <div className="text-sm">{ev.msg}</div>
                  </motion.div>
                ))}
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
                  "Which policies are gapped in EU and what evidence closes them?",
                  "Show me owners for all partial policies in LATAM.",
                  "Draft an attestation request for Fleet Ops.",
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
                      <div className="font-medium">Region</div>
                      <div className="text-muted-foreground">{filterRegion}</div>
                    </CardContent>
                  </Card>
                  <Card className="border-dashed">
                    <CardContent className="p-3 text-sm">
                      <div className="font-medium">Filters</div>
                      <div className="text-muted-foreground">{showGapsOnly ? "Show gaps only" : "All statuses"}</div>
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