"use client";

import { useState } from "react";
import { AnimatedNumber, Card, InrInput, MoneyInput, Notice, PageHeader, Section, Slider } from "@/components/ui";
import { inr } from "@/lib/format";
import { useStore } from "@/lib/store";

const PERIODS = [1, 3, 5, 10];

export default function View() {
  const { state } = useStore();
  const [base, setBase] = useState(state.plan.monthly || 3000);
  const [current, setCurrent] = useState(state.plan.current);
  const [extra, setExtra] = useState(500);
  const maxVal = Math.max(1, (base + extra) * 120);

  return (
    <>
      <PageHeader eyebrow={`WHAT IF I SAVE ₹${extra.toLocaleString("en-IN")} MORE?`} title="Small change. Exact difference.">
        Plain arithmetic: monthly contribution × months. No growth, no guesses.
      </PageHeader>
      <Section>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
          <Card className="space-y-6">
            <InrInput label="Baseline monthly contribution" value={base} onChange={setBase} resetTo={state.plan.monthly || 3000} max={10_000_000} />
            <Slider label="Extra each month" value={extra} min={100} max={5000} step={100} onChange={setExtra} format={inr} />
            <MoneyInput label="Current savings (kept separate)" value={current} onChange={setCurrent} hint="Shown as a starting point only. It is not multiplied." />
            <Notice tone="info">Formula: <b>Monthly Contribution × Months</b>. Fees, taxes, inflation and any investment growth are excluded.</Notice>
          </Card>

          <div className="space-y-4">
            {PERIODS.map((y) => {
              const m = y * 12, a = base * m, b = (base + extra) * m;
              return (
                <Card key={y} className="p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-display text-lg font-bold">{y} year{y > 1 ? "s" : ""} <span className="text-sm font-normal text-muted">· {m} months</span></h2>
                    <p className="text-sm"><span className="text-muted">Difference </span><b className="font-display text-xl text-accent">+<AnimatedNumber value={b - a} format={inr} /></b></p>
                  </div>
                  <div className="mt-4 space-y-2.5">
                    {[{ label: "Baseline", v: a, sub: `${inr(base)} × ${m}`, c: "bg-fg/70" }, { label: `+${inr(extra)}`, v: b, sub: `${inr(base + extra)} × ${m}`, c: "bg-accent" }].map((row) => (
                      <div key={row.label} className="grid grid-cols-[84px_1fr] items-center gap-3 text-sm sm:grid-cols-[100px_1fr_auto]">
                        <span className="text-muted">{row.label}</span>
                        <div className="h-3 rounded-full bg-line"><div className={`h-3 rounded-full ${row.c}`} style={{ width: `${(row.v / maxVal) * 100}%`, transition: "width .4s ease" }} /></div>
                        <span className="col-span-2 text-right tabular-nums sm:col-span-1"><b>{inr(row.v)}</b> <span className="text-xs text-muted">({row.sub})</span></span>
                      </div>
                    ))}
                  </div>
                  {current > 0 && <p className="mt-3 text-xs text-muted">Plus your existing {inr(current)}: {inr(current + a)} vs {inr(current + b)} in total.</p>}
                </Card>
              );
            })}
          </div>
        </div>
      </Section>
    </>
  );
}
