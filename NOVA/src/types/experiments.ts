// Nova 2.0 Experiment Data Contracts

export type RateParams = {
  base_rate: number;
  surcharges?: { name: string; when: Record<string, any>; percent: number }[];
  discounts?: { name: string; when: Record<string, any>; percent: number }[];
  caps?: { max_change_pct?: number; min_change_pct?: number };
};

export type ExperimentResults = {
  kpis: {
    portfolio: {
      delta_written: number;
      delta_earned: number;
      lr_base: number;
      lr_candidate: number;
      cr_base: number;
      cr_candidate: number;
      affected_policies: number;
      affected_units: number;
      book_coverage_pct: number;
    };
  };
  segments: {
    by_product: { product: string; lr_base: number; lr_cand: number; delta_written: number }[];
    by_fleet_size: { bucket: string; delta_cr: number }[];
    by_risk_decile: { decile: number; delta_lr: number }[];
    by_geo: { state: string; delta_written: number }[];
  };
  winners: { policy_id: string; unit_id: string; delta_total: number }[];
  losers: { policy_id: string; unit_id: string; delta_total: number }[];
  fairness_checks: {
    cohort_selectivity: number;
    guardrail_side_effect: { hit_rate_base: number; hit_rate_cand: number };
  };
  charts: { lr_over_time: any[]; delta_histogram: any[] };
  audit: { param_diff: { base_rate: { from: number; to: number } } };
};

export type ParserOutput = {
  cohort_sql: string;
  param_patch: any;
  confidence: number;
};

export type Experiment = {
  id: string;
  tenant_id: string;
  rate_plan_id: string | null;
  nl_change: string;
  cohort_sql: string;
  param_patch: any;
  backtest_from: string;
  backtest_to: string;
  results: ExperimentResults | null;
  status: string;
  created_by: string;
  created_at: string;
};

export type RatePlan = {
  id: string;
  tenant_id: string;
  name: string;
  params: RateParams;
  status: 'draft' | 'staging' | 'active';
  created_by: string;
  created_at: string;
};

export type ExposureDaily = {
  tenant_id: string;
  dt: string;
  policy_id: string;
  unit_id: string;
  product: string;
  risk_vars: Record<string, any>;
  written_premium: number;
  earned_premium: number;
  exposure: number;
};

export type Loss = {
  tenant_id: string;
  claim_id: string;
  unit_id: string;
  policy_id: string;
  dt: string;
  incurred: number;
  paid: number;
  cause?: string;
  status?: string;
};


