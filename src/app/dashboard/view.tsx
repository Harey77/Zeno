"use client";

import Link from "next/link";
import { useState } from "react";
import { Award, Lock, Plus, Trash2 } from "lucide-react";
import { AnimatedNumber, Button, Card, MoneyInput, PageHeader, Section, Stat } from "@/components/ui";
import { LineChart, Legend } from "@/components/charts";
import { inr, pct } from "@/lib/format";
import { seeded } from "@/lib/finance";
import { useStore } from "@/lib/store";
import { PlanSimulator } from "./plan-sim";

// Fictional monthly returns (includes losing months) used to simulate the practice portfolio.
const rnd = seeded(77);
const MONTHLY = Array.from({ length: 240 }, () => (rnd() - 0.42) * 0.07);

export default function View() {
  const { state, update } = useStore();
  const { entries } = state.progress;
  const p = state.plan;
  const [amt, setAmt] = useState(p.monthly || 5000);

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  let value = p.current;
  const contribLine: number[] = [], valueLine: number[] = [], labels: string[] = [];
  let contrib = p.current;
  sorted.forEach((e, i) => {
    value = value * (1 + MONTHLY[i]) + e.amount;
    contrib += e.amount;
    contribLine.push(contrib); valueLine.push(value);
    labels.push(new Date(e.date).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }));
  });
  const added = sorted.reduce((a, e) => a + e.amount, 0);
  const gains = value - contrib;
  const completion = Math.min(100, (value / p.goal) * 100);

  const badges = [
    { title: "First ₹5,000", ok: contrib >= 5000 },
    { title: "Emergency cushion: 3 months", ok: state.budget.emergencyBalance >= state.budget.essentials * 3 },
    { title: "3 contributions logged", ok: entries.length >= 3 },
    { title: "25% Goal Reached", ok: completion >= 25 },
    { title: "50% Goal Reached", ok: completion >= 50 },
    { title: "Goal Reached", ok: completion >= 100 },
    { title: "Quiz finished", ok: state.quiz.attempts > 0 },
    { title: "10 expenses tracked", ok: state.expenses.items.length >= 10 },
    { title: "Myth Buster: 8/8", ok: state.quiz.best >= 8 },
  ];

  const add = () => {
    if (amt <= 0) return;
    const last = sorted.at(-1)?.date;
    const d = last ? new Date(last) : new Date();
    if (last) d.setMonth(d.getMonth() + 1);
    update("progress", { entries: [...entries, { id: crypto.randomUUID(), date: d.toISOString().slice(0, 10), amount: amt }] });
  };

  return (
    <>
      <PageHeader eyebrow="PROGRESS & PERSONALISED PORTFOLIO" title={`${state.profile.name && state.profile.name !== "Guest" ? `${state.profile.name}'s` : "Your"} plan & progress`}>
        A simulation built from your Plan Builder inputs, then your real logged contributions. Allocations are educational illustrations, not advice.
      </PageHeader>
      <Section>
        <PlanSimulator />

        <div className="mt-14 border-t border-line pt-10">
          <p className="text-xs font-semibold tracking-[0.18em] text-accent">PROGRESS TRACKER</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Your real contributions</h2>
          <p className="mt-1 text-sm text-muted">Log what you actually put aside each month. Gains and losses here use fictional monthly returns, including bad months.</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Current savings (simulated)" value={<AnimatedNumber value={value} format={inr} />} />
          <Stat label="Total contributions" value={<AnimatedNumber value={contrib} format={inr} />} sub={`${inr(p.current)} starting + ${inr(added)} logged`} />
          <Stat label="Simulated gains / losses" value={<>{gains >= 0 ? "+" : ""}<AnimatedNumber value={gains} format={inr} /></>} tone={gains >= 0 ? "good" : "bad"} sub={contrib ? `${gains >= 0 ? "+" : ""}${pct((gains / contrib) * 100)}` : undefined} />
          <Stat label={`Goal: ${inr(p.goal)}`} value={pct(completion)} tone="accent" sub={<span className="mt-2 block h-1.5 rounded-full bg-line"><span className="block h-1.5 rounded-full bg-accent shadow-[0_0_12px_rgba(0,245,155,0.6)] transition-all duration-700" style={{ width: `${completion}%` }} /></span>} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">Contributions vs. simulated value</p>
              <Legend items={[{ label: "Contributions", color: "var(--fg)" }, { label: "Simulated value", color: "var(--accent)" }]} />
            </div>
            <div className="mt-4">
              {sorted.length > 1 ? (
                <LineChart labels={labels} series={[{ name: "Contributions", color: "var(--fg)", values: contribLine }, { name: "Simulated value", color: "var(--accent)", values: valueLine, fill: true }]} />
              ) : <p className="py-16 text-center text-sm text-muted">Log at least two contributions to see a chart.</p>}
            </div>
          </Card>
          <Card>
            <h2 className="font-semibold">Log a contribution</h2>
            <div className="mt-4"><MoneyInput label="Amount" value={amt} onChange={setAmt} /></div>
            <Button className="mt-4 w-full" onClick={add}><Plus className="h-4 w-4" /> Add next month</Button>
            <ul className="mt-5 max-h-56 space-y-2 overflow-y-auto text-sm">
              {[...sorted].reverse().map((e) => (
                <li key={e.id} className="flex items-center justify-between rounded-lg border border-line px-3 py-2">
                  <span className="text-muted">{new Date(e.date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                  <span className="flex items-center gap-3 tabular-nums">{inr(e.amount)}
                    <button aria-label={`Remove ${inr(e.amount)} entry`} onClick={() => update("progress", { entries: entries.filter((x) => x.id !== e.id) })} className="text-muted hover:text-bad"><Trash2 className="h-4 w-4" /></button>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="mt-6">
          <h2 className="text-xl font-bold">Milestone badges</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {badges.map((b) => (
              <div key={b.title} className={`rounded-2xl border p-4 text-center transition ${b.ok ? "border-accent/50 bg-accent/10" : "border-line opacity-60"}`}>
                <span className={`mx-auto grid h-12 w-12 place-items-center rounded-full ${b.ok ? "bg-accent text-on-accent" : "bg-line text-muted"}`}>
                  {b.ok ? <Award className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
                </span>
                <p className="mt-3 text-sm font-semibold">{b.title}</p>
                <p className="text-xs text-muted">{b.ok ? "Unlocked" : "Locked"}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">Change your goal in the <Link href="/planner/" className="text-accent hover:underline">Plan Builder</Link>. Simulated values are illustrative only.</p>
        </Card>
      </Section>
    </>
  );
}
