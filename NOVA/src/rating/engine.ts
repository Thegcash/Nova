// /src/rating/engine.ts
export type WhenCond =
  | number
  | { ">="?: number; "<="?: number; ">"?: number; "<"?: number; "=="?: number };

export type RateParams = {
  base_rate: number; // per exposure
  surcharges?: { name: string; when: Record<string, WhenCond>; percent: number }[];
  discounts?: { name: string; when: Record<string, WhenCond>; percent: number }[];
  caps?: { max_change_pct?: number; min_change_pct?: number };
};

export type QuoteOut = {
  premium_components: { name: string; percent: number; applied: boolean }[];
  base: number;
  total: number;
};

export function matches(vars: Record<string, any>, cond: Record<string, WhenCond>) {
  return Object.entries(cond).every(([k, v]) => {
    const x = vars[k];
    if (x === undefined || x === null) return false;
    if (typeof v === "number") return x === v;
    if (typeof v === "object") {
      if (v[">="] !== undefined && !(x >= v[">="]!)) return false;
      if (v["<="] !== undefined && !(x <= v["<="]!)) return false;
      if (v[">"] !== undefined && !(x > v[">"]!)) return false;
      if (v["<"] !== undefined && !(x < v["<"]!)) return false;
      if (v["=="] !== undefined && !(x === v["=="]!)) return false;
      return true;
    }
    return false;
  });
}

export function quote(params: RateParams, risk_vars: Record<string, any>): QuoteOut {
  const exposure = Number(risk_vars.exposure ?? 1);
  const base = exposure * Number(params.base_rate ?? 0);

  const components: QuoteOut["premium_components"] = [];
  let pct = 0;

  for (const s of params.surcharges ?? []) {
    const ok = matches(risk_vars, s.when ?? {});
    if (ok) pct += s.percent;
    components.push({ name: s.name, percent: s.percent, applied: ok });
  }
  for (const d of params.discounts ?? []) {
    const ok = matches(risk_vars, d.when ?? {});
    if (ok) pct += d.percent; // discounts should be negative
    components.push({ name: d.name, percent: d.percent, applied: ok });
  }

  if (params.caps) {
    if (params.caps.max_change_pct !== undefined) pct = Math.min(pct, params.caps.max_change_pct);
    if (params.caps.min_change_pct !== undefined) pct = Math.max(pct, params.caps.min_change_pct);
  }

  const total = Math.max(0, base * (1 + pct));
  return { premium_components: components, base, total };
}
