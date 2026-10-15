"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "motion/react";
import { History, RotateCcw, Undo2 } from "lucide-react";
import { AnimatedNumber, Button, Card, MoneyInput, Notice, PageHeader, Section } from "@/components/ui";
import { inr, pct } from "@/lib/format";
import { breakEven } from "@/lib/finance";

const Drawdown3D = dynamic(() => import("@/components/three/drawdown-3d"), {
  ssr: false,
  loading: () => <div className="grid h-80 place-items-center text-sm text-muted sm:h-96">Loading 3D view…</div>,
});

const SHOCKS = [-5, -10, -20, -35, 5, 10, 20];

// Monthly sequences shaped like real episodes. Illustrative, not exact index data.
const SCENARIOS = [
  {
    key: "2020", title: "2020-style shock",
    body: "Nifty 50 fell about 38% from January to March 2020, then regained its peak by November.",
    moves: [-6, -23, -14, 15, 3, 7, 8, 1, 4, 11],
  },
  {
    key: "2008", title: "2008-style slide",
    body: "Nifty 50 fell about 60% from January to October 2008 and took close to three years to recover.",
    moves: [-5, -10, -3, 5, -8, -12, -2, -8, -12, -25, -5],
  },
  {
    key: "chop", title: "Sideways chop",
    body: "No crash, just a year of ups and downs that goes nowhere. Often harder to sit through.",
    moves: [4, -6, 5, -3, -5, 6, -4, 3, -2, 4, -3, 1],
  },
];

export default function View() {
  const [start, setStart] = useState(50000);
  const [history, setHistory] = useState<number[]>([]);
  const [scenario, setScenario] = useState<string | null>(null);

  const path = history.reduce<number[]>((acc, s) => [...acc, acc[acc.length - 1] * (1 + s / 100)], [start]);
  const value = path[path.length - 1];
  const change = value - start;
  const changePct = (value / start - 1) * 100;
  const needed = value < start ? (start / value - 1) * 100 : 0;
  let peak = start, maxDD = 0;
  for (const v of path) { peak = Math.max(peak, v); maxDD = Math.max(maxDD, (peak - v) / peak); }
  const labels = ["Start", ...history.map((s, i) => `Move ${i + 1}: ${s > 0 ? "+" : ""}${s}%`)];
  const sc = SCENARIOS.find((s) => s.key === scenario);

  const push = (s: number) => { setHistory([...history, s]); setScenario(null); };

  return (
    <>
      <PageHeader eyebrow="RISK TRANSLATOR · 3D CRASH SIMULATOR" title="What a fall really costs you">
        Losses and gains aren&apos;t symmetric. A 20% fall needs a 25% rise just to get back to where you started. Stack moves, or replay a historical-style crash, and turn the 3D view to see the gap.
      </PageHeader>
      <Section>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          <Card className="space-y-6">
            <MoneyInput label="Test portfolio" value={start} onChange={(n) => { setStart(n || 1); setHistory([]); setScenario(null); }} hint="Starts at ₹50,000. Change it if you like." />
            <div>
              <p className="text-sm font-medium">Apply a market move</p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {SHOCKS.map((s) => (
                  <motion.button key={s} onClick={() => push(s)} whileHover={{ y: -2 }} whileTap={{ scale: 0.94 }}
                    className={`rounded-xl border py-3 font-display text-base font-bold transition ${s < 0 ? "border-bad/40 bg-bad/10 text-bad hover:bg-bad/20" : "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"}`}>
                    {s > 0 ? "+" : ""}{s}%
                  </motion.button>
                ))}
                <motion.button onClick={() => setHistory(history.slice(0, -1))} disabled={!history.length} whileTap={{ scale: 0.94 }} aria-label="Undo last move"
                  className="grid place-items-center rounded-xl border border-line text-muted transition hover:text-fg disabled:opacity-30"><Undo2 className="h-4 w-4" /></motion.button>
              </div>
              <p className="mt-2 text-xs text-muted">Moves stack, like consecutive bad or good months.</p>
            </div>
            <div>
              <p className="flex items-center gap-2 text-sm font-medium"><History className="h-4 w-4 text-warn" /> Replay a scenario</p>
              <div className="mt-3 grid gap-2">
                {SCENARIOS.map((s) => (
                  <button key={s.key} onClick={() => { setHistory(s.moves); setScenario(s.key); }} aria-pressed={scenario === s.key}
                    className={`rounded-xl border p-3 text-left transition ${scenario === s.key ? "border-warn/60 bg-warn/10" : "border-line hover:border-warn/40"}`}>
                    <span className="block text-sm font-semibold">{s.title}</span>
                    <span className="block text-xs text-muted">{s.body}</span>
                  </button>
                ))}
              </div>
            </div>
            <Button variant="outline" onClick={() => { setHistory([]); setScenario(null); }} disabled={!history.length}><RotateCcw className="h-4 w-4" /> Reset to {inr(start)}</Button>
          </Card>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="card p-4"><p className="text-xs text-muted">Portfolio now</p><p className="mt-1 font-display text-xl font-bold"><AnimatedNumber value={value} format={inr} /></p></div>
              <div className="card p-4"><p className="text-xs text-muted">{change < 0 ? "Loss" : "Gain"} from start</p>
                <p className={`mt-1 font-display text-xl font-bold ${change < 0 ? "text-bad" : change > 0 ? "text-accent" : ""}`}><AnimatedNumber value={change} format={inr} /></p>
                <p className="text-xs text-muted">{changePct >= 0 ? "+" : ""}{pct(changePct, 2)}</p></div>
              <div className="card p-4"><p className="text-xs text-muted">Worst drop from peak</p><p className="mt-1 font-display text-xl font-bold text-warn">{maxDD ? `−${pct(maxDD * 100, 1)}` : "—"}</p></div>
              <div className="card border-warn/40 p-4"><p className="text-xs text-muted">Gain needed to break even</p><p className="mt-1 font-display text-xl font-bold text-warn">{needed ? `+${pct(needed, 2)}` : "—"}</p></div>
            </div>
            <Card className="p-0">
              <div className="flex items-center justify-between px-5 pt-4">
                <p className="text-sm text-muted">Path of your test portfolio{sc ? ` · ${sc.title}` : ""}</p>
                <span className="text-xs text-muted">{history.length} move{history.length === 1 ? "" : "s"}</span>
              </div>
              <Drawdown3D path={path} start={start} labels={labels} />
            </Card>
            {needed > 0 && (
              <Notice tone="warn">Your portfolio is down {pct(-changePct, 2)}, but it needs to rise <b>{pct(needed, 2)}</b> to return to {inr(start)}. Nobody knows if or when that will happen. This is why money you need soon shouldn&apos;t be in volatile investments.</Notice>
            )}
            {sc && <Notice tone="info">This sequence is shaped like the real episode to show how it felt month by month. It isn&apos;t exact index data, and the next crash won&apos;t follow the same path.</Notice>}
          </div>
        </div>

        <Card className="mt-6 overflow-x-auto">
          <h2 className="text-xl font-bold">The break-even table</h2>
          <p className="mt-1 text-sm text-muted">Gain needed = 1 ÷ (1 − fall) − 1. Starting from {inr(start)}.</p>
          <table className="mt-4 w-full min-w-[480px] text-sm">
            <thead><tr className="text-left text-muted"><th className="py-2 font-medium">Fall</th><th className="py-2 font-medium">Value after</th><th className="py-2 font-medium">Amount lost</th><th className="py-2 font-medium">Gain needed to recover</th></tr></thead>
            <tbody>
              {[5, 10, 20, 35, 50].map((d) => (
                <tr key={d} className="border-t border-line">
                  <td className="py-3 text-bad">−{d}%</td>
                  <td className="py-3 tabular-nums">{inr(start * (1 - d / 100))}</td>
                  <td className="py-3 tabular-nums">{inr(start * d / 100)}</td>
                  <td className="py-3 font-semibold tabular-nums text-warn">+{pct(breakEven(d), 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </Section>
    </>
  );
}
