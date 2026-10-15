"use client";

import { useState } from "react";
import { ArrowRight, Banknote, Coins, Landmark, LineChart, PiggyBank } from "lucide-react";
import { Card, Meter, Modal, Notice, PageHeader, Section } from "@/components/ui";
import { OPTIONS, type Option } from "@/lib/content";
import { PathwayRanges } from "./ranges";

const ICONS: Record<string, typeof Banknote> = { savings: PiggyBank, fd: Landmark, mf: Banknote, gold: Coins, stocks: LineChart };
const VOL = ["", "Very low", "Low", "Medium", "High", "Very high"];

function Detail({ o }: { o: Option }) {
  return (
    <div className="space-y-6 text-sm">
      <p className="text-base text-muted">{o.what}</p>
      {o.note && <Notice tone="info"><b>Good to know:</b> {o.note}</Notice>}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line p-3"><p className="text-xs text-muted">Volatility</p><div className="mt-2"><Meter value={o.volatility} label="Volatility" /></div><p className="mt-1 text-xs">{VOL[o.volatility]}</p></div>
        <div className="rounded-xl border border-line p-3"><p className="text-xs text-muted">Liquidity</p><p className="mt-1 font-semibold">{o.liquidity}</p></div>
        <div className="rounded-xl border border-line p-3"><p className="text-xs text-muted">Suggested horizon</p><p className="mt-1 font-semibold">{o.horizon}</p></div>
      </div>
      <div>
        <h3 className="font-semibold">Typical inputs</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">{o.inputs.map((i) => <li key={i}>{i}</li>)}</ul>
      </div>
      <div>
        <h3 className="font-semibold">Beginner roadmap</h3>
        <ol className="mt-3 space-y-2">
          {o.roadmap.map((r, i) => (
            <li key={r} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 text-xs font-bold text-accent">{i + 1}</span><span className="text-muted">{r}</span></li>
          ))}
        </ol>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-good/30 bg-good/5 p-4"><h3 className="font-semibold text-good">Pros</h3><ul className="mt-2 space-y-1.5 text-muted">{o.pros.map((p) => <li key={p}>+ {p}</li>)}</ul></div>
        <div className="rounded-xl border border-bad/30 bg-bad/5 p-4"><h3 className="font-semibold text-bad">Risks</h3><ul className="mt-2 space-y-1.5 text-muted">{o.risks.map((p) => <li key={p}>− {p}</li>)}</ul></div>
      </div>
      <p className="text-xs text-muted">Rates and limits are typical ranges for illustration. Check current figures with the provider.</p>
    </div>
  );
}

export default function View() {
  const [open, setOpen] = useState<Option | null>(null);
  return (
    <>
      <PageHeader eyebrow="COMPARE 5 PATHWAYS" title="Five places your money can go">
        Each option trades off safety, access and growth differently. None is &quot;best&quot;. The right mix depends on when you need the money.
      </PageHeader>
      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OPTIONS.map((o) => {
            const Icon = ICONS[o.key];
            return (
              <button key={o.key} onClick={() => setOpen(o)} className="card group flex flex-col p-6 text-left transition hover:-translate-y-0.5 hover:border-accent/50">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent"><Icon className="h-6 w-6" /></span>
                <h2 className="mt-5 text-xl font-bold">{o.name}</h2>
                <p className="mt-1 text-sm text-muted">{o.tagline}</p>
                <dl className="mt-5 grid gap-3 text-sm">
                  <div className="flex items-center justify-between"><dt className="text-muted">Volatility</dt><dd><Meter value={o.volatility} label="Volatility" /></dd></div>
                  <div className="flex items-center justify-between"><dt className="text-muted">Access</dt><dd>{o.liquidity}</dd></div>
                  <div className="flex items-center justify-between"><dt className="text-muted">Horizon</dt><dd>{o.horizon}</dd></div>
                </dl>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent">Learn more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
              </button>
            );
          })}
          <Card className="flex flex-col justify-center bg-gradient-to-br from-accent/15 to-transparent">
            <h2 className="text-xl font-bold">A simple order many beginners follow</h2>
            <ol className="mt-4 space-y-2 text-sm text-muted">
              <li>1. Emergency cushion in savings or an FD</li>
              <li>2. Clear high-interest debt like credit cards</li>
              <li>3. Regular SIP into a diversified fund</li>
              <li>4. Explore ETFs or stocks with money you won&apos;t need for 7+ years</li>
            </ol>
          </Card>
        </div>

        <PathwayRanges />

        <div className="card mt-10 overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-sm">
            <caption className="px-6 pt-5 text-left font-display text-lg font-bold">At a glance</caption>
            <thead><tr className="text-left text-muted"><th className="px-6 py-3 font-medium">Option</th><th className="px-3 py-3 font-medium">Volatility</th><th className="px-3 py-3 font-medium">Access</th><th className="px-3 py-3 font-medium">Horizon</th><th className="px-6 py-3 font-medium">Insured / regulated</th></tr></thead>
            <tbody>
              {OPTIONS.map((o) => (
                <tr key={o.key} className="border-t border-line">
                  <td className="px-6 py-3 font-medium">{o.name}</td>
                  <td className="px-3 py-3">{VOL[o.volatility]}</td>
                  <td className="px-3 py-3 text-muted">{o.liquidity}</td>
                  <td className="px-3 py-3 text-muted">{o.horizon}</td>
                  <td className="px-6 py-3 text-muted">{o.key === "savings" || o.key === "fd" ? "DICGC up to ₹5L/bank" : o.key === "gold" ? "ETFs/funds: SEBI" : "SEBI"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.name ?? ""}>{open && <Detail o={open} />}</Modal>
    </>
  );
}
