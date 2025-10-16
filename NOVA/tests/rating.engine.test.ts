import { describe, it, expect } from "vitest";
import { quote } from "@/src/rating/engine";

describe("rating engine", () => {
  it("applies surcharge when condition met", () => {
    const out = quote(
      { base_rate: 0.045, surcharges:[{ name:"hits", when:{ guardrail_hits_30d:{">=":3}}, percent:0.07 }] },
      { exposure:1, guardrail_hits_30d:4 }
    );
    expect(out.base).toBeCloseTo(0.045);
    expect(out.total).toBeCloseTo(0.045*1.07);
  });

  it("does not apply surcharge when condition not met", () => {
    const out = quote(
      { base_rate: 0.045, surcharges:[{ name:"hits", when:{ guardrail_hits_30d:{">=":3}}, percent:0.07 }] },
      { exposure:1, guardrail_hits_30d:2 }
    );
    expect(out.base).toBeCloseTo(0.045);
    expect(out.total).toBeCloseTo(0.045);
  });

  it("caps max change", () => {
    const out = quote(
      { base_rate:0.045, surcharges:[{name:"big", when:{}, percent:0.50}], caps:{ max_change_pct:0.25 }},
      { exposure:1 }
    );
    expect(out.total).toBeCloseTo(0.045*1.25);
  });

  it("floors min change", () => {
    const out = quote(
      { base_rate:0.045, discounts:[{name:"big", when:{}, percent:-0.50}], caps:{ min_change_pct:-0.15 }},
      { exposure:1 }
    );
    expect(out.total).toBeCloseTo(0.045*0.85);
  });

  it("handles multiple surcharges", () => {
    const out = quote(
      { 
        base_rate: 0.045, 
        surcharges:[
          { name:"hit1", when:{ a:{">=":1}}, percent:0.05 },
          { name:"hit2", when:{ b:{">=":1}}, percent:0.03 }
        ] 
      },
      { exposure:1, a:2, b:3 }
    );
    expect(out.total).toBeCloseTo(0.045*1.08);
  });

  it("handles exposure multiplier", () => {
    const out = quote(
      { base_rate: 0.045 },
      { exposure:2.5 }
    );
    expect(out.base).toBeCloseTo(0.1125);
    expect(out.total).toBeCloseTo(0.1125);
  });
});


