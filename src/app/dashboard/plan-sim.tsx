"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { CalendarClock, CircleAlert, CircleCheck, Flag, ListChecks, PencilLine, ShieldAlert, Sparkles, TrendingDown } from "lucide-react";
import { AnimatedNumber, Card, Notice, SpotlightCard } from "@/components/ui";
import { Donut, Legend, LineChart } from "@/components/charts";
import { inr, inrShort, duration, pct } from "@/lib/format";
import { breakEven } from "@/lib/finance";
import { buildAllocation } from "@/lib/allocation";
import { useStore } from "@/lib/store";

const fmtDate = (monthsAhead: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsAhead);
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
};

export function PlanSimulator() {
  const { state } = useStore();
  const p = state.plan, b = state.budget;
  const a = useMemo(() => buildAllocation(p), [p]);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const equityHeavy = a.badYearPct >= 25, marketLinked = a.badYearPct >= 8;
  // Read the clock once on mount: a plan confirmed in the last 5 minutes gets the "just saved" banner.
  const [now] = useState(() => Date.now());
  const fresh = !!p.builtAt && now - new Date(p.builtAt).getTime() < 5 * 60_000;
  const reached = a.total >= p.goal;
  const cushion = b.essentials ? b.emergencyBalance / b.essentials : 0;

  const warnings: string[] = [];
  if (equityHeavy && p.years < 7) warnings.push(`This mix is equity-heavy, but your horizon is ${p.years} years. Equity can take 3+ years to recover from a crash, so a shorter goal usually suits a mix with more FDs and debt.`);
  if (marketLinked && cushion < 3) warnings.push(`Your emergency cushion covers ${cushion.toFixed(1)} months of essentials. Most guides suggest 3–6 months before putting money into market-linked sleeves.`);
  if (!marketLinked && p.years >= 12) warnings.push(`Over ${p.years} years, a deposit-heavy mix may barely beat inflation after tax. That's the trade-off for stability.`);
  if (p.monthly > b.income * 0.6 && b.income > 0) warnings.push(`${inr(p.monthly)}/month is over 60% of your ${inr(b.income)} income in Money Snapshot. Check it's sustainable in a bad month.`);
  if (a.sleeves.length === 1) warnings.push(`Your whole plan sits in one asset (${a.sleeves[0].name}). If it has a bad stretch, nothing else in the plan offsets it. Even a 10–20% slice elsewhere adds resilience.`);
  const top = a.sleeves.reduce((m, s) => (s.weight > m.weight ? s : m), a.sleeves[0]);
  if (a.sleeves.length > 1 && top.weight >= 0.7) warnings.push(`${Math.round(top.weight * 100)}% is in ${top.name}. That concentration drives most of the outcome, good or bad.`);

  const labels = a.yearly.map((y) => `Yr ${y.year}`);

  return (
    <div className="space-y-6">
      {fresh ? (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Notice tone="good"><span className="flex items-center gap-2"><Sparkles className="h-4 w-4 shrink-0" /> Plan saved. Everything below is calculated from the numbers you just built.</span></Notice>
        </motion.div>
      ) : !p.builtAt ? (
        <Notice tone="info">
          These are your autosaved Plan Builder numbers. <Link href="/planner/" className="font-semibold text-accent hover:underline">Open the Plan Builder</Link> and press <b>Build My Plan &amp; View Dashboard</b> to confirm them.
        </Notice>
      ) : null}

      <Card className="relative overflow-hidden">
        <div className="glow pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-accent">YOUR PLAN · {a.label.toUpperCase()}</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{a.headline}</h2>
            <p className="mt-1 text-sm text-muted">{a.horizon}</p>
          </div>
          <Link href="/planner/" className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:border-accent/60"><PencilLine className="h-4 w-4" /> Edit plan</Link>
        </div>
        <dl className="relative mt-5 flex flex-wrap gap-2 text-sm">
          {[["Goal", inr(p.goal)], ["Starting with", inr(p.current)], ["Monthly", inr(p.monthly)], ["Horizon", `${p.years} yrs`], ["Blended assumption", `${a.blended.toFixed(1)}%/yr`]].map(([k, v]) => (
            <div key={k} className="rounded-full border border-line bg-bg/50 px-3 py-1.5"><dt className="inline text-muted">{k}: </dt><dd className="inline font-semibold tabular-nums">{v}</dd></div>
          ))}
        </dl>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: `Projected in ${p.years} yrs`, v: a.total, tone: "text-accent", sub: `at a blended ${a.blended.toFixed(1)}%` },
          { label: "Your contributions", v: a.contributions, tone: "", sub: `${inr(p.current)} + ${inr(p.monthly)} × ${p.years * 12}` },
          { label: "Hypothetical growth", v: a.growth, tone: "", sub: a.contributions ? `${pct((a.growth / a.contributions) * 100, 0)} on top of your money` : "" },
          { label: "Bad final year", v: a.stressed, tone: "text-warn", sub: `−${pct(a.badYearPct, 0)} if every sleeve had a bad year` },
        ].map((s) => (
          <SpotlightCard key={s.label} className="p-4 sm:p-5" tilt={5}>
            <p className="text-xs text-muted sm:text-sm">{s.label}</p>
            <p className={`mt-1.5 font-display text-xl font-semibold sm:text-2xl ${s.tone}`}><AnimatedNumber value={s.v} format={inr} /></p>
            <p className="mt-1 text-xs text-muted">{s.sub}</p>
          </SpotlightCard>
        ))}
      </div>

      {reached ? (
        <Notice tone="good"><span className="flex gap-2"><CircleCheck className="mt-0.5 h-4 w-4 shrink-0" /><span>On these assumptions the plan reaches {inr(p.goal)} around <b>{a.eta !== null ? fmtDate(a.eta) : "—"}</b> ({a.eta !== null ? duration(a.eta) : "—"}). In the bad-final-year case it would be {a.stressed >= p.goal ? "still above" : `${inr(p.goal - a.stressed)} short of`} the goal.</span></span></Notice>
      ) : (
        <Notice tone="warn"><span className="flex gap-2"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /><span>After {p.years} years this mix is projected {inr(p.goal - a.total)} short of {inr(p.goal)}. {a.eta !== null ? <>At this pace it gets there around <b>{fmtDate(a.eta)}</b> ({duration(a.eta)}).</> : "At this pace it isn't reached within 50 years."} Raising the monthly amount or extending the horizon closes the gap more reliably than picking a riskier preset.</span></span></Notice>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Card>
          <h3 className="font-semibold">Where each rupee goes</h3>
          <p className="text-xs text-muted">Tap a sleeve for the reasoning.</p>
          <div className="mt-5"><Donut size={190} center={inr(p.monthly)} sub="per month" segments={a.sleeves.map((s) => ({ label: s.name, value: s.weight, color: s.color }))} /></div>
          <ul className="mt-5 space-y-2">
            {a.sleeves.map((s, i) => (
              <motion.li key={s.key} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <button onClick={() => setOpenKey(openKey === s.key ? null : s.key)} aria-expanded={openKey === s.key}
                  className="w-full rounded-xl border border-line p-3 text-left text-sm transition hover:border-accent/40">
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />{s.name}</span>
                    <span className="tabular-nums"><b>{pct(s.weight * 100, 0)}</b> <span className="text-muted">· {inr(s.monthly)}/mo</span></span>
                  </span>
                  {openKey === s.key && (
                    <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 block text-xs leading-relaxed text-muted">
                      {s.why} <span className="block pt-1">Typical products: {s.examples}. Access: {s.liquidity}.</span>
                    </motion.span>
                  )}
                </button>
              </motion.li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold">Growth timeline</h3>
            <Legend items={[{ label: "Your contributions", color: "var(--fg)" }, { label: "Projected mix", color: "var(--accent)" }, { label: "Goal", color: "var(--warn)", dashed: true }]} />
          </div>
          <div className="mt-4">
            <LineChart labels={labels} markerY={{ value: p.goal, label: `Goal ${inrShort(p.goal)}` }}
              series={[{ name: "Contributions", color: "var(--fg)", values: a.yearly.map((y) => y.contributions) }, { name: "Projected", color: "var(--accent)", fill: true, values: a.yearly.map((y) => y.total) }]} />
          </div>
          <div className="mt-5">
            <p className="flex items-center gap-2 text-sm font-medium"><Flag className="h-4 w-4 text-accent" /> Milestones</p>
            <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {a.milestones.map((m) => (
                <li key={m.f} className={`rounded-xl border p-3 ${m.months !== null && m.months <= p.years * 12 ? "border-accent/40 bg-accent/5" : "border-line"}`}>
                  <p className="text-xs text-muted">{pct(m.f * 100, 0)} · {inrShort(p.goal * m.f)}</p>
                  <p className="mt-1 font-display font-semibold">{m.months === null ? "50+ yrs" : m.months === 0 ? "Already there" : fmtDate(m.months)}</p>
                  <p className="text-[11px] text-muted">{m.months ? duration(m.months) : ""}</p>
                </li>
              ))}
            </ol>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="flex items-center gap-2 font-semibold"><ListChecks className="h-4 w-4 text-accent" /> Your asset-by-asset action plan</h3>
        <p className="mt-1 text-xs text-muted">What each part of {inr(p.monthly)}/month{p.current ? ` and your ${inr(p.current)} starting amount` : ""} would do, in rupees. Product types only; Zeno never names specific schemes.</p>
        <ol className="mt-5 grid gap-3 md:grid-cols-2">
          {a.sleeves.map((s, i) => (
            <motion.li key={s.key} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-line bg-bg/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="flex items-center gap-2 font-semibold"><span className="grid h-6 w-6 place-items-center rounded-full font-display text-xs font-bold" style={{ background: `color-mix(in srgb, ${s.color} 20%, transparent)`, color: s.color }}>{i + 1}</span>{s.name}</p>
                <span className="shrink-0 rounded-full border border-line px-2 py-0.5 text-xs tabular-nums">{pct(s.weight * 100, 0)} · {inr(s.monthly)}/mo</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.action}</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-surface/70 p-2"><p className="text-muted">You put in</p><p className="font-display font-semibold tabular-nums">{inrShort(s.contributions)}</p></div>
                <div className="rounded-lg bg-surface/70 p-2"><p className="text-muted">At ~{s.rate}%</p><p className="font-display font-semibold tabular-nums text-accent">{inrShort(s.value)}</p></div>
                <div className="rounded-lg bg-surface/70 p-2"><p className="text-muted">Bad year</p><p className={`font-display font-semibold tabular-nums ${s.badYear ? "text-warn" : ""}`}>{s.badYear ? `−${inrShort((s.value * s.badYear) / 100)}` : "₹0"}</p></div>
              </div>
            </motion.li>
          ))}
        </ol>
      </Card>

      <Card className="overflow-x-auto">
        <h3 className="flex items-center gap-2 font-semibold"><CalendarClock className="h-4 w-4 text-accent" /> Sleeve by sleeve, after {p.years} years</h3>
        <table className="mt-4 w-full min-w-[720px] text-sm">
          <thead>
            <tr className="text-left text-muted">
              <th className="py-2 font-medium">Sleeve</th><th className="py-2 font-medium">Share</th><th className="py-2 font-medium">Monthly</th>
              <th className="py-2 font-medium">From savings</th><th className="py-2 font-medium">Assumed</th><th className="py-2 font-medium">You put in</th>
              <th className="py-2 font-medium">Projected</th><th className="py-2 font-medium">Bad-year fall</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {a.sleeves.map((s) => (
              <tr key={s.key} className="border-t border-line">
                <td className="py-3"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.name}</span></td>
                <td className="py-3">{pct(s.weight * 100, 0)}</td>
                <td className="py-3">{inr(s.monthly)}</td>
                <td className="py-3">{inr(s.start)}</td>
                <td className="py-3">{s.rate}%</td>
                <td className="py-3">{inr(s.contributions)}</td>
                <td className="py-3 font-semibold">{inr(s.value)}</td>
                <td className={`py-3 ${s.badYear >= 30 ? "text-bad" : s.badYear ? "text-warn" : "text-muted"}`}>{s.badYear ? `−${s.badYear}%` : "none"}</td>
              </tr>
            ))}
            <tr className="border-t border-line font-semibold">
              <td className="py-3">Total</td><td className="py-3">100%</td><td className="py-3">{inr(p.monthly)}</td><td className="py-3">{inr(p.current)}</td>
              <td className="py-3">{a.blended.toFixed(1)}%</td><td className="py-3">{inr(a.contributions)}</td><td className="py-3 text-accent">{inr(a.total)}</td>
              <td className="py-3 text-warn">−{pct(a.badYearPct, 0)}</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-3 text-xs text-muted">Assumed rates are illustrative averages after typical tax: deposits and debt-fund interest are taxed at your slab; equity long-term gains above ₹1.25 lakh a year at 12.5%. Real returns arrive unevenly and can be negative for years.</p>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-warn/30">
          <h3 className="flex items-center gap-2 font-semibold"><TrendingDown className="h-4 w-4 text-warn" /> Stress test</h3>
          <p className="mt-2 text-sm text-muted">Bad years usually hurt most near the end, when the balance is largest. If each sleeve had a typical bad year in year {p.years}:</p>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-line p-3"><p className="text-xs text-muted">Before</p><p className="font-display font-semibold tabular-nums">{inrShort(a.total)}</p></div>
            <div className="rounded-xl border border-warn/40 bg-warn/10 p-3"><p className="text-xs text-muted">After</p><p className="font-display font-semibold tabular-nums text-warn">{inrShort(a.stressed)}</p></div>
            <div className="rounded-xl border border-line p-3"><p className="text-xs text-muted">To recover</p><p className="font-display font-semibold tabular-nums">+{pct(breakEven(a.badYearPct), 1)}</p></div>
          </div>
          <p className="mt-4 text-xs text-muted">That&apos;s {inr(a.total - a.stressed)} of paper loss. Selling turns it into a real loss; plans with a near deadline usually move money from equity to debt/FDs over the final 2–3 years. <Link href="/risk/" className="font-semibold text-accent hover:underline">Try the 3D crash simulator →</Link></p>
        </Card>
        <Card>
          <h3 className="flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4 text-warn" /> Before you act on this</h3>
          {warnings.length ? (
            <ul className="mt-3 space-y-2 text-sm">{warnings.map((w) => <li key={w} className="flex gap-2 rounded-lg border border-warn/25 bg-warn/5 p-3"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warn" /><span className="text-muted">{w}</span></li>)}</ul>
          ) : (
            <p className="mt-3 flex gap-2 rounded-lg border border-accent/25 bg-accent/5 p-3 text-sm text-muted"><CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />Your horizon, cushion and contribution look consistent with this preset.</p>
          )}
          <p className="mt-4 text-xs leading-relaxed text-muted">
            This is an educational illustration of how a mix like yours ({a.label}) could be structured, not personalised investment advice. Zeno is not a SEBI-registered investment adviser. Mutual fund investments are subject to market risks; read all scheme-related documents carefully. For advice on specific products, consult a SEBI-registered investment adviser.
          </p>
        </Card>
      </div>
    </div>
  );
}
