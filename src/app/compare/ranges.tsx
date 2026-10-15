"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Card, Chips, InrInput, Notice } from "@/components/ui";
import { inr, inrShort } from "@/lib/format";
import { project } from "@/lib/finance";
import { useStore } from "@/lib/store";

// Illustrative bands for average yearly return over a multi-year stretch: a weak period and a strong one.
// Not forecasts. Equity bands are wide on purpose; short periods can be far worse than the low end.
const BANDS = [
  { key: "savings", name: "Savings account", lo: 2.5, hi: 4, color: "#8B9A94" },
  { key: "fd", name: "Fixed deposit (pre-tax)", lo: 6, hi: 7.5, color: "#0FA87A" },
  { key: "mf", name: "Mutual funds / SIP (hybrid–equity)", lo: 3, hi: 12, color: "var(--accent)" },
  { key: "gold", name: "Gold (ETF / fund)", lo: -2, hi: 12, color: "#FFB800" },
  { key: "stocks", name: "Stocks / equity ETFs", lo: -2, hi: 14, color: "#FF8A3D" },
];

export function PathwayRanges() {
  const { state } = useStore();
  const [monthly, setMonthly] = useState(state.plan.monthly || 5000);
  const [years, setYears] = useState(10);
  const m = years * 12;
  const rows = BANDS.map((b) => ({ ...b, low: project(0, monthly, b.lo, m).total, high: project(0, monthly, b.hi, m).total }));
  const put = monthly * m;
  const max = Math.max(put, ...rows.map((r) => r.high)) * 1.05;
  const x = (v: number) => `${(v / max) * 100}%`;

  return (
    <Card className="mt-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-accent">PATHWAY RANGES</p>
            <h2 className="mt-2 text-2xl font-bold">Same money, five paths</h2>
            <p className="mt-1 text-sm text-muted">Each bar runs from a weak stretch to a strong one. The wider the bar, the less certain the outcome.</p>
          </div>
          <InrInput label="Monthly amount" value={monthly} onChange={setMonthly} steps={[500, 1000, 5000]} resetTo={state.plan.monthly || 5000} max={10_000_000} />
          <div>
            <p className="text-sm font-medium">For how long</p>
            <div className="mt-2"><Chips label="Years" value={years} onChange={setYears} options={[3, 5, 10, 20].map((y) => ({ value: y, label: `${y} yrs` }))} /></div>
          </div>
        </div>
        <div>
          <div className="relative space-y-5">
            {rows.map((r, i) => (
              <div key={r.key}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium">{r.name}</span>
                  <span className="tabular-nums text-muted">{inrShort(r.low)} – <b className="text-fg">{inrShort(r.high)}</b> <span className="text-xs">({r.lo}% to {r.hi}%/yr)</span></span>
                </div>
                <div className="relative mt-2 h-3 rounded-full bg-line">
                  <motion.div className="absolute top-0 h-3 rounded-full" style={{ background: r.color }}
                    animate={{ left: x(r.low), width: x(r.high - r.low) }} transition={{ type: "spring", stiffness: 140, damping: 22, delay: i * 0.03 }} />
                  <motion.div className="absolute -top-1 h-5 w-0.5 rounded bg-fg" animate={{ left: x(put) }} transition={{ type: "spring", stiffness: 140, damping: 22 }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs text-muted"><span className="inline-block h-3 w-0.5 bg-fg" /> White marker: your own money, {inr(put)} ({inr(monthly)} × {m} months)</p>
          <div className="mt-4"><Notice tone="warn">These bands are illustrative assumptions, not historical guarantees or forecasts. Equity can do worse than the low end over short periods, and returns exclude fees, taxes and inflation.</Notice></div>
        </div>
      </div>
    </Card>
  );
}
