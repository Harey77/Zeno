"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button, Card, MoneyInput, Notice, PageHeader, Section } from "@/components/ui";
import { Donut, SegmentBar } from "@/components/charts";
import { inr, pct } from "@/lib/format";
import { useStore } from "@/lib/store";
import { ExpenseTracker } from "./expenses";

const COLORS = { essentials: "var(--accent)", emergency: "#0FA87A", savings: "var(--fg)", discretionary: "#FFB800", free: "var(--line)" };

const STEPS = [
  { key: "income", title: "Monthly Income", q: "How much reaches your bank account each month?", hint: "Take-home pay after tax and deductions. If it varies, use a typical or lower month." },
  { key: "essentials", title: "Essential Expenses", q: "What do you need to spend to live?", hint: "Rent, groceries, utilities, transport to work, EMIs, insurance, family support." },
  { key: "emergency", title: "Emergency Savings", q: "How much can you set aside for emergencies each month?", hint: "Builds a cushion for job loss or medical bills. Many guides suggest 3–6 months of essentials in total." },
  { key: "savings", title: "Comfortable Savings", q: "How much can you comfortably save towards a goal?", hint: "Pick an amount you could keep up even in a tight month. Consistency beats size." },
  { key: "discretionary", title: "Discretionary Funds", q: "How much for things you enjoy?", hint: "Eating out, shopping, subscriptions, trips. Spending on yourself is part of a healthy plan." },
] as const;

export default function View() {
  const { state, update } = useStore();
  const b = state.budget;
  const [step, setStep] = useState(0);
  const done = step === STEPS.length;

  const out = b.essentials + b.emergency + b.savings + b.discretionary;
  const free = b.income - out;
  const segs = [
    { label: "Essentials", value: b.essentials, color: COLORS.essentials },
    { label: "Emergency", value: b.emergency, color: COLORS.emergency },
    { label: "Savings", value: b.savings, color: COLORS.savings },
    { label: "Discretionary", value: b.discretionary, color: COLORS.discretionary },
    ...(free > 0 ? [{ label: "Unassigned", value: free, color: COLORS.free }] : []),
  ];
  const share = (v: number) => (b.income ? (v / b.income) * 100 : 0);
  const cushion = b.essentials ? b.emergencyBalance / b.essentials : 0;

  return (
    <>
      <PageHeader eyebrow="MONEY SNAPSHOT & EXPENSE TRACKER" title="Where your money goes each month">
        Plan your month in five quick steps, then track what you actually spend. No judgement. Your numbers stay in this browser.
      </PageHeader>
      <Section>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Card>
            <ol className="flex gap-2" aria-label="Progress">
              {STEPS.map((s, i) => (
                <li key={s.key} className="flex-1">
                  <button onClick={() => setStep(i)} aria-current={i === step ? "step" : undefined} aria-label={`Step ${i + 1}: ${s.title}`}
                    className={`h-1.5 w-full rounded-full transition ${i < step || done ? "bg-accent" : i === step ? "bg-accent/60" : "bg-line"}`} />
                </li>
              ))}
            </ol>

            {!done ? (
              <div key={step} className="fade-in mt-6">
                <p className="text-xs font-semibold tracking-widest text-muted">STEP {step + 1} OF {STEPS.length} · {STEPS[step].title.toUpperCase()}</p>
                <h2 className="mt-2 text-2xl font-bold">{STEPS[step].q}</h2>
                <div className="mt-6 space-y-5">
                  <MoneyInput label={STEPS[step].title} hint={STEPS[step].hint}
                    value={b[STEPS[step].key]} onChange={(n) => update("budget", { [STEPS[step].key]: n })} />
                  {STEPS[step].key === "emergency" && (
                    <>
                      <MoneyInput label="Already saved for emergencies" hint="Money you could reach within a day if needed."
                        value={b.emergencyBalance} onChange={(n) => update("budget", { emergencyBalance: n })} />
                      <Notice tone={cushion >= 3 ? "good" : "info"}>
                        Your current cushion covers about <b>{cushion.toFixed(1)} months</b> of essentials.
                        {cushion < 3 ? " A common target is 3–6 months. Building this first protects any investing later." : " That's within the commonly suggested 3–6 month range."}
                      </Notice>
                    </>
                  )}
                  {b.income > 0 && STEPS[step].key !== "income" && (
                    <p className="text-sm text-muted">That&apos;s <b className="text-fg">{pct(share(b[STEPS[step].key]))}</b> of your income.</p>
                  )}
                </div>
                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}><ArrowLeft className="h-4 w-4" /> Back</Button>
                  <Button onClick={() => setStep(step + 1)}>{step === STEPS.length - 1 ? "See summary" : "Next"} <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </div>
            ) : (
              <div className="fade-in mt-6">
                <p className="flex items-center gap-2 text-xs font-semibold tracking-widest text-good"><Check className="h-4 w-4" /> SNAPSHOT SAVED</p>
                <h2 className="mt-2 text-2xl font-bold">Your monthly picture</h2>
                <dl className="mt-6 divide-y divide-line">
                  {[["Income", b.income], ["Essentials", b.essentials], ["Emergency savings", b.emergency], ["Goal savings", b.savings], ["Discretionary", b.discretionary]].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between py-3 text-sm"><dt className="text-muted">{k}</dt><dd className="font-display font-semibold tabular-nums">{inr(v as number)}</dd></div>
                  ))}
                  <div className="flex justify-between py-3 text-sm"><dt className="text-muted">{free >= 0 ? "Unassigned" : "Shortfall"}</dt><dd className={`font-display font-semibold tabular-nums ${free < 0 ? "text-warn" : "text-good"}`}>{inr(Math.abs(free))}</dd></div>
                </dl>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => setStep(0)}><ArrowLeft className="h-4 w-4" /> Edit</Button>
                  <Link href="/planner/" onClick={() => update("plan", { monthly: b.savings })} className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent">
                    Plan with {inr(b.savings)}/month <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <Card>
              <p className="text-sm text-muted">Live breakdown</p>
              <div className="mt-4"><Donut segments={segs} center={inr(b.income)} sub="monthly income" /></div>
              <div className="mt-6"><SegmentBar segments={segs.filter((s) => s.label !== "Unassigned")} total={b.income} /></div>
              <ul className="mt-5 space-y-2.5 text-sm">
                {segs.map((s) => (
                  <li key={s.label} className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2"><span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />{s.label}</span>
                    <span className="tabular-nums text-muted">{inr(s.value)} · <b className="text-fg">{pct(share(s.value), 0)}</b></span>
                  </li>
                ))}
              </ul>
            </Card>
            {free < 0 ? (
              <Notice tone="warn">
                <b>Your plan is {inr(-free)} more than your income.</b> This happens to lots of people, especially early on or after a big change.
                You don&apos;t need to fix it all at once. You could look at discretionary spending first, lower the goal savings for now,
                or check if any essentials can be renegotiated. Your emergency cushion matters more than goal savings right now.
              </Notice>
            ) : free > 0 ? (
              <Notice tone="info">{inr(free)} is unassigned. You could leave it as a buffer, or give it a job like the emergency fund.</Notice>
            ) : (
              <Notice tone="good">Every rupee has a job. Nice and balanced.</Notice>
            )}
          </div>
        </div>
        <ExpenseTracker />
      </Section>
    </>
  );
}
