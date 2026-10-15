"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, CircleAlert, CircleCheck, LayoutDashboard } from "lucide-react";
import { Card, Chips, InrInput, Magnetic, MoneyInput, Notice, PageHeader, Section, Slider } from "@/components/ui";
import { Legend, LineChart } from "@/components/charts";
import { inr, inrShort, duration } from "@/lib/format";
import { monthsToGoal, project, PRESETS, type PresetKey } from "@/lib/finance";
import { useStore } from "@/lib/store";
import { ASSETS, assetOf, buildAllocation, sumWeights, type Weights } from "@/lib/allocation";
import { AllocationPicker, WeightsBar } from "./allocation-picker";

const GOALS = [100000, 1000000, 10000000];

export default function View() {
  const { state, update } = useStore();
  const router = useRouter();
  const build = () => {
    // Inputs already autosave; stamping builtAt marks the plan as confirmed for the dashboard.
    update("plan", { builtAt: new Date().toISOString() });
    router.push("/dashboard/");
  };
  const p = state.plan;
  const [custom, setCustom] = useState(!GOALS.includes(p.goal));
  const preset = PRESETS[p.preset];
  const alloc = buildAllocation(p);
  const isPreset = (p.mode ?? "preset") === "preset";
  // Presets keep their headline rate; other modes use the blend of the chosen assets.
  const eff = isPreset ? { label: preset.label, rate: preset.rate } : { label: alloc.label, rate: Math.round(alloc.blended * 10) / 10 };
  const invalid = p.mode === "custom" && sumWeights(p.custom) !== 100;
  const months = p.years * 12;
  const res = project(p.current, p.monthly, eff.rate, months);
  const reached = res.total >= p.goal;
  const eta = monthsToGoal(p.goal, p.current, p.monthly, eff.rate);
  const r = eff.rate / 100 / 12, g = Math.pow(1 + r, months);
  const needed = Math.max(0, (p.goal - p.current * g) / ((g - 1) / r));

  const years = Array.from({ length: p.years + 1 }, (_, i) => i);
  const labels = years.map((y) => `Yr ${y}`);
  const series = [
    { name: "Your contributions", color: "var(--fg)", values: years.map((y) => p.current + p.monthly * 12 * y) },
    { name: `${eff.label} illustration`, color: "var(--accent)", fill: true, values: years.map((y) => project(p.current, p.monthly, eff.rate, y * 12).total) },
  ];

  return (
    <>
      <PageHeader eyebrow="FINANCIAL PLAN BUILDER" title="Pick a goal. See an honest path.">
        Your own contributions are always shown separately from hypothetical growth. Growth rates are assumptions, not forecasts.
      </PageHeader>
      <Section>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <Card className="space-y-7">
            <div>
              <p className="text-sm font-medium">Goal</p>
              <div className="mt-3">
                <Chips<number | string> label="Goal" value={custom ? "custom" : p.goal}
                  onChange={(v) => { if (v === "custom") setCustom(true); else { setCustom(false); update("plan", { goal: v as number }); } }}
                  options={[{ value: 100000, label: "₹1,00,000" }, { value: 1000000, label: "₹10,00,000" }, { value: 10000000, label: "₹1,00,00,000" }, { value: "custom", label: "Custom" }]} />
              </div>
              {custom && <div className="mt-4"><MoneyInput label="Custom goal" value={p.goal} onChange={(n) => update("plan", { goal: n })} max={1e10} /></div>}
            </div>
            <MoneyInput label="Current savings toward this goal" value={p.current} onChange={(n) => update("plan", { current: n })} max={1e10} />
            <InrInput label="Monthly contribution" value={p.monthly} onChange={(n) => update("plan", { monthly: n })} steps={[500, 1000, 5000]} resetTo={7000} max={10_000_000} />
            <Slider label="Time period" value={p.years} min={1} max={40} step={1} onChange={(n) => update("plan", { years: n })} format={(n) => `${n} yr${n > 1 ? "s" : ""}`} />
            <AllocationPicker />
          </Card>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="card p-5"><p className="text-xs text-muted">You put in</p><p className="mt-1 font-display text-2xl font-bold tabular-nums">{inr(res.contributions)}</p><p className="mt-1 text-xs text-muted">Current + monthly × {months}</p></div>
              <div className="card p-5"><p className="text-xs text-muted">Hypothetical growth</p><p className="mt-1 font-display text-2xl font-bold tabular-nums text-accent">{inr(res.growth)}</p><p className="mt-1 text-xs text-muted">At an assumed {eff.rate}%/yr</p></div>
              <div className="card p-5"><p className="text-xs text-muted">Illustrative total</p><p className="mt-1 font-display text-2xl font-bold tabular-nums">{inr(res.total)}</p><p className="mt-1 text-xs text-muted">After {duration(months)}</p></div>
            </div>

            {reached ? (
              <Notice tone="good">
                <span className="flex gap-2"><CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-good" /><span>Under the {eff.label.toLowerCase()} assumption, this plan reaches {inr(p.goal)} in about <b>{duration(eta ?? months)}</b>. Your own contributions by then would be {inr(p.current + p.monthly * (eta ?? months))}. Real results could be earlier, later, or not at all.</span></span>
              </Notice>
            ) : (
              <Notice tone="warn">
                <span className="flex gap-2"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warn" /><span>
                  <b>Not reached in {p.years} years under this assumption.</b> The illustration ends {inr(p.goal - res.total)} short.{" "}
                  {p.monthly > 0 || p.current > 0
                    ? eta === null
                      ? "At this contribution it isn't reached within 50 years either, so we won't show a date."
                      : `Keeping this pace, it would take about ${duration(eta)}.`
                    : "Add a monthly contribution to see a path."}{" "}
                  To get there in {p.years} years at {eff.rate}%, you&apos;d need about <b>{inr(Math.ceil(needed / 100) * 100)}/month</b>, or a longer timeline.
                </span></span>
              </Notice>
            )}

            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted">Contributions vs. illustration</p>
                <Legend items={[{ label: "Your contributions", color: "var(--fg)" }, { label: `${eff.label} illustration`, color: "var(--accent)" }, { label: "Goal", color: "#FBBF24", dashed: true }]} />
              </div>
              <div className="mt-4"><LineChart series={series} labels={labels} markerY={{ value: p.goal, label: `Goal ${inrShort(p.goal)}` }} /></div>
            </Card>

            <Card>
              <p className="text-sm text-muted">Same inputs, all three presets, after {p.years} years</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {(Object.keys(PRESETS) as PresetKey[]).map((k) => {
                  const x = project(p.current, p.monthly, PRESETS[k].rate, months);
                  return (
                    <button key={k} onClick={() => update("plan", { preset: k, mode: "preset" })} aria-pressed={isPreset && k === p.preset}
                      className={`rounded-xl border p-4 text-left transition ${isPreset && k === p.preset ? "border-accent bg-accent/10" : "border-line hover:border-accent/50"}`}>
                      <p className="text-sm font-semibold">{PRESETS[k].label} · {PRESETS[k].rate}%</p>
                      <p className="mt-2 font-display text-lg font-bold tabular-nums">{inrShort(x.total)}</p>
                      <p className="text-xs text-muted">{inrShort(x.contributions)} yours + {inrShort(x.growth)} growth</p>
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-muted">Excludes fees, taxes and inflation. Real returns vary year to year and can be negative. Illustrations, not predictions.</p>
            </Card>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
          className="card relative mt-8 overflow-hidden border-accent/40 p-6 sm:p-8">
          <div className="glow pointer-events-none absolute inset-0 opacity-70" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-accent"><LayoutDashboard className="h-4 w-4" /> NEXT STEP</p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Turn these numbers into a personalised allocation</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted">
                Saves your {inr(p.goal)} goal, {inr(p.current)} start, {inr(p.monthly)}/month for {p.years} years with {isPreset ? `the ${eff.label} preset` : eff.label}, then opens your dashboard with a rupee-by-rupee split, growth timeline and stress test.
              </p>
              <div className="mt-4 max-w-md">
                <WeightsBar w={ASSETS.reduce((acc, a) => ({ ...acc, [a]: Math.round(alloc.sleeves.filter((s) => assetOf(s.key) === a).reduce((t, s) => t + s.weight * 100, 0)) }), {} as Weights)} />
                <p className="mt-1.5 text-xs text-muted">Blended assumption {alloc.blended.toFixed(1)}%/yr · bad-year fall about −{Math.round(alloc.badYearPct)}%</p>
              </div>
              {invalid && <p id="alloc-invalid" className="mt-3 text-sm font-medium text-warn">Your custom mix totals {sumWeights(p.custom)}%. Adjust it to exactly 100% to continue.</p>}
            </div>
            <Magnetic className="shrink-0">
              <button onClick={build} disabled={invalid} aria-describedby={invalid ? "alloc-invalid" : undefined} className="btn-accent inline-flex items-center gap-2 rounded-full px-7 py-4 text-base font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none">
                Build My Plan &amp; View Dashboard <ArrowRight className="h-5 w-5" />
              </button>
            </Magnetic>
          </div>
        </motion.div>
      </Section>
    </>
  );
}
