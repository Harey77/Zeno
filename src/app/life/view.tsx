"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarX, HeartPulse, RotateCcw, ShoppingBasket, TrendingDown } from "lucide-react";
import { Button, Card, Notice, PageHeader, Section } from "@/components/ui";
import { inr, duration } from "@/lib/format";
import { monthsToGoalNoGrowth } from "@/lib/finance";
import { useStore } from "@/lib/store";

const SCENARIOS = [
  { key: "expense", icon: HeartPulse, title: "Unexpected Expense", body: "A medical bill or repair of ₹20,000." },
  { key: "income", icon: TrendingDown, title: "Income Reduction", body: "Take-home pay drops by 30%." },
  { key: "skip", icon: CalendarX, title: "Skipped Savings Month", body: "One month with no goal contribution." },
  { key: "surge", icon: ShoppingBasket, title: "Essential Expense Surge", body: "Rent, food or bills rise by 15%." },
] as const;
type Key = (typeof SCENARIOS)[number]["key"];

export default function View() {
  const { state } = useStore();
  const b = state.budget, p = state.plan;
  const [on, setOn] = useState<Set<Key>>(new Set());
  const toggle = (k: Key) => setOn((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });

  // Baseline
  const baseMonths = monthsToGoalNoGrowth(p.goal, p.current, b.savings);
  const baseCushion = b.essentials ? b.emergencyBalance / b.essentials : 0;

  // Scenario
  const income = on.has("income") ? b.income * 0.7 : b.income;
  const essentials = on.has("surge") ? b.essentials * 1.15 : b.essentials;
  let emergencyBal = b.emergencyBalance;
  let goalBal = p.current;
  if (on.has("expense")) {
    const fromCushion = Math.min(20000, emergencyBal);
    emergencyBal -= fromCushion;
    goalBal = Math.max(0, goalBal - (20000 - fromCushion));
  }
  // Any monthly shortfall comes out of goal savings first, then emergency contributions.
  let short = Math.max(0, essentials + b.emergency + b.savings + b.discretionary - income);
  const savings = Math.max(0, b.savings - short); short = Math.max(0, short - b.savings);
  const emergencyMonthly = Math.max(0, b.emergency - short); short = Math.max(0, short - b.emergency);
  const months = monthsToGoalNoGrowth(p.goal, goalBal, savings);
  const scenMonths = months === null ? null : months + (on.has("skip") ? 1 : 0);
  const cushion = essentials ? emergencyBal / essentials : 0;
  const delay = baseMonths !== null && scenMonths !== null ? scenMonths - baseMonths : null;

  return (
    <>
      <PageHeader eyebrow="LIFE HAPPENS SIMULATOR" title="Plans meet real life">
        Turn on one or more surprises and watch your goal timeline and emergency cushion respond. Uses your Money Snapshot and plan, with no growth assumed.
      </PageHeader>
      <Section>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-3">
            {SCENARIOS.map(({ key, icon: Icon, title, body }) => (
              <button key={key} onClick={() => toggle(key)} aria-pressed={on.has(key)}
                className={`card flex w-full items-center gap-4 p-5 text-left transition ${on.has(key) ? "border-warn/60 bg-warn/5" : "hover:border-accent/50"}`}>
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${on.has(key) ? "bg-warn/20 text-warn" : "bg-accent/10 text-accent"}`}><Icon className="h-5 w-5" /></span>
                <span className="flex-1"><span className="block font-semibold">{title}</span><span className="text-sm text-muted">{body}</span></span>
                <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${on.has(key) ? "bg-warn" : "bg-line"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${on.has(key) ? "left-6" : "left-1"}`} /></span>
              </button>
            ))}
            <Button variant="outline" onClick={() => setOn(new Set())} disabled={!on.size} className="w-full"><RotateCcw className="h-4 w-4" /> Reset Scenario</Button>
            <p className="text-xs text-muted">Based on income {inr(b.income)}, essentials {inr(b.essentials)}, goal savings {inr(b.savings)}/mo, goal {inr(p.goal)}. <Link href="/budget/" className="text-accent hover:underline">Edit snapshot</Link></p>
          </div>

          <div className="space-y-4">
            <Card>
              <p className="text-sm text-muted">Goal timeline · {inr(p.goal)}</p>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted">Before</p><p className="font-display text-2xl font-bold">{baseMonths === null ? "Not reachable" : duration(baseMonths)}</p></div>
                <div><p className="text-xs text-muted">With scenario</p><p className={`font-display text-2xl font-bold ${delay ? "text-warn" : ""}`}>{scenMonths === null ? "Not reachable" : duration(scenMonths)}</p></div>
              </div>
              {baseMonths !== null && scenMonths !== null && (
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-line">
                  <div className="h-3 rounded-full bg-accent transition-all" style={{ width: `${Math.min(100, (baseMonths / Math.max(scenMonths, baseMonths, 1)) * 100)}%` }} />
                </div>
              )}
              {delay !== null && delay > 0 && <p className="mt-3 text-sm text-warn">About {duration(delay)} later than planned.</p>}
              {scenMonths === null && on.size > 0 && <p className="mt-3 text-sm text-warn">With no goal savings left each month, there isn&apos;t a date to show.</p>}
            </Card>
            <Card>
              <p className="text-sm text-muted">Emergency cushion</p>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted">Before</p><p className="font-display text-2xl font-bold">{baseCushion.toFixed(1)} months</p><p className="text-xs text-muted">{inr(b.emergencyBalance)}</p></div>
                <div><p className="text-xs text-muted">With scenario</p><p className={`font-display text-2xl font-bold ${cushion < baseCushion ? "text-warn" : ""}`}>{cushion.toFixed(1)} months</p><p className="text-xs text-muted">{inr(emergencyBal)}</p></div>
              </div>
              <div className="mt-4 flex gap-1" aria-hidden>
                {Array.from({ length: 6 }, (_, i) => <span key={i} className={`h-2 flex-1 rounded-full ${i < Math.floor(cushion) ? "bg-good" : i < cushion ? "bg-good/40" : "bg-line"}`} />)}
              </div>
              <p className="mt-1 text-right text-[11px] text-muted">6-month marker</p>
            </Card>
            <div className="grid grid-cols-2 gap-3">
              <div className="card p-4"><p className="text-xs text-muted">Goal savings / month</p><p className="font-display text-lg font-semibold tabular-nums">{inr(savings)}</p>{savings < b.savings && <p className="text-xs text-warn">was {inr(b.savings)}</p>}</div>
              <div className="card p-4"><p className="text-xs text-muted">Emergency / month</p><p className="font-display text-lg font-semibold tabular-nums">{inr(emergencyMonthly)}</p>{emergencyMonthly < b.emergency && <p className="text-xs text-warn">was {inr(b.emergency)}</p>}</div>
            </div>
            {short > 0 && <Notice tone="warn">Even after pausing savings, monthly costs exceed income by {inr(short)}. In real life this gap would come from the emergency cushion, which is exactly what it&apos;s for.</Notice>}
            {on.size === 0 && <Notice tone="info">Pick a scenario on the left to see how your plan responds.</Notice>}
          </div>
        </div>
      </Section>
    </>
  );
}
