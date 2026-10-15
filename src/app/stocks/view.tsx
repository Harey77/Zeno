"use client";

import { useState } from "react";
import { FastForward, HelpCircle, RotateCcw, ShieldCheck } from "lucide-react";
import { Button, Card, Modal, Notice, PageHeader, Section, Slider } from "@/components/ui";
import { LineChart } from "@/components/charts";
import { inr, pct } from "@/lib/format";
import { seeded } from "@/lib/finance";
import { STOCK_TERMS } from "@/lib/content";
import { useStore } from "@/lib/store";

const SHARES = 42_000_000; // fictional shares outstanding
const EPS = 38.6;           // fictional earnings per share

// One deterministic fictional price path: 1 year of history + 10 years of "future" for practice mode.
const PRICES = buildPrices();

function buildPrices() {
  const rnd = seeded(20251015);
  const out = [1180];
  for (let i = 1; i < 252 * 11; i++) {
    const shock = (rnd() + rnd() + rnd() - 1.5) * 0.032; // roughly normal
    const drift = 0.00035 + (i > 330 && i < 420 ? -0.004 : 0); // includes a rough patch
    out.push(Math.max(80, out[i - 1] * (1 + drift + shock)));
  }
  return out;
}

const STEPS = [
  { t: "Choose a SEBI-registered broker", b: "Check the broker's registration on the SEBI or exchange website. Compare account charges and brokerage." },
  { t: "Keep documents ready", b: "PAN card, Aadhaar (linked to your mobile), a cancelled cheque or bank statement, and a signature." },
  { t: "Complete e-KYC", b: "Usually online: Aadhaar OTP, a selfie or in-person video verification, and e-signing the forms." },
  { t: "Link your bank account", b: "Money moves only between your own verified bank account and your trading account." },
  { t: "Set nominees and enable 2-factor login", b: "Add a nominee and use a strong password plus 2FA from day one." },
  { t: "Start small and slow", b: "Your first trades are for learning. Start with an index ETF and amounts you're comfortable losing." },
];

const PRECAUTIONS = [
  "Never share OTPs, passwords or your screen with anyone claiming to be from your broker or SEBI.",
  "Don't pay money into personal bank accounts or UPI IDs for 'guaranteed' tips or IPO allotments.",
  "Check any adviser's SEBI registration number before taking advice.",
  "Turn on SMS and email alerts from the depository (CDSL/NSDL) for every transaction.",
];

function Term({ k, children }: { k: keyof typeof STOCK_TERMS; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-left text-xs text-muted underline decoration-dotted underline-offset-4 hover:text-accent">
        {children} <HelpCircle className="h-3 w-3" />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={STOCK_TERMS[k].title}><p className="text-muted">{STOCK_TERMS[k].body}</p></Modal>
    </>
  );
}

export default function View() {
  const { state, update } = useStore();
  const prices = PRICES;
  const year = prices.slice(0, 252);
  const price = year[251];
  const weekly = year.filter((_, i) => i % 5 === 0 || i === 251);
  const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  const labels = weekly.map((_, i) => months[Math.min(11, Math.floor((i / weekly.length) * 12))]);
  const rets = year.slice(1).map((v, i) => Math.log(v / year[i]));
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const vol = Math.sqrt(rets.reduce((a, b) => a + (b - mean) ** 2, 0) / rets.length) * Math.sqrt(252) * 100;
  const lo = Math.min(...year), hi = Math.max(...year);
  const yearChange = (price / year[0] - 1) * 100;

  const pr = state.practice;
  const pIdx = Math.min(251 + pr.day, prices.length - 1);
  const pPrice = prices[pIdx];
  const holding = pr.units * pPrice;
  const invested = pr.history.filter((h) => h.action === "Bought").reduce((a, h) => a + h.amount, 0)
    - pr.history.filter((h) => h.action === "Sold").reduce((a, h) => a + h.amount, 0);
  const total = pr.cash + holding;
  const [amount, setAmount] = useState(500);
  const maxBuy = Math.max(50, Math.floor(pr.cash));
  const buyAmt = Math.min(amount, maxBuy, pr.cash);

  const buy = () => buyAmt > 0 && update("practice", { cash: pr.cash - buyAmt, units: pr.units + buyAmt / pPrice, history: [{ day: pr.day, action: "Bought", amount: buyAmt }, ...pr.history] });
  const sell = () => pr.units > 0 && update("practice", { cash: pr.cash + holding, units: 0, history: [{ day: pr.day, action: "Sold", amount: holding }, ...pr.history] });
  const next = () => update("practice", { day: Math.min(pr.day + 21, prices.length - 252) });
  const resetP = () => update("practice", { cash: 500, units: 0, day: 0, history: [] });

  return (
    <>
      <PageHeader eyebrow="STOCK READER & PRACTICE MODE" title="Learn to read a stock card">
        Tap any term for a plain-language explanation. Then practise with ₹500 of pretend money. No real trades, no real company.
      </PageHeader>
      <Section>
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold">Kaveri Motors Ltd</h2>
                <span className="rounded-full border border-warn/40 bg-warn/10 px-2.5 py-0.5 text-xs text-warn">Fictional company</span>
              </div>
              <p className="mt-1 text-sm text-muted">KAVMOT · Auto & EV components · Sample data</p>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl font-bold tabular-nums">{inr(price, 2)}</p>
              <p className={`text-sm ${yearChange >= 0 ? "text-good" : "text-bad"}`}>{yearChange >= 0 ? "+" : ""}{pct(yearChange)} in 1 year</p>
            </div>
          </div>
          <div className="mt-6"><LineChart series={[{ name: "Price", color: "var(--accent)", values: weekly, fill: true }]} labels={labels} height={260} format={(n) => `₹${Math.round(n)}`} /></div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              { k: "pe" as const, label: "P/E ratio", v: (price / EPS).toFixed(1) },
              { k: "mcap" as const, label: "Market cap", v: `₹${Math.round((price * SHARES) / 1e7).toLocaleString("en-IN")} Cr` },
              { k: "vol" as const, label: "Volatility (1Y)", v: `${vol.toFixed(0)}% · ${vol > 35 ? "High" : vol > 20 ? "Medium" : "Low"}` },
              { k: "high52" as const, label: "52-week range", v: `₹${Math.round(lo)} – ₹${Math.round(hi)}` },
              { k: "div" as const, label: "Dividend yield", v: "0.8%" },
            ].map((s) => (
              <div key={s.k} className="rounded-xl border border-line bg-bg/50 p-4">
                <Term k={s.k}>{s.label}</Term>
                <p className="mt-1.5 font-display text-lg font-semibold tabular-nums">{s.v}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-bold">Try with ₹500</h2>
              <span className="rounded-full border border-line px-3 py-1 text-xs text-muted">Practice month {Math.floor(pr.day / 21)}</span>
            </div>
            <p className="mt-1 text-sm text-muted">Pretend money, fictional prices. Fractional units allowed so ₹500 works.</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-line p-3"><p className="text-xs text-muted">Cash</p><p className="font-display text-lg font-semibold tabular-nums">{inr(pr.cash, 2)}</p></div>
              <div className="rounded-xl border border-line p-3"><p className="text-xs text-muted">Holding</p><p className="font-display text-lg font-semibold tabular-nums">{inr(holding, 2)}</p></div>
              <div className="rounded-xl border border-line p-3"><p className="text-xs text-muted">Total</p><p className={`font-display text-lg font-semibold tabular-nums ${total >= 500 ? "text-good" : "text-bad"}`}>{inr(total, 2)}</p></div>
            </div>
            <p className="mt-3 text-sm text-muted">Practice price: <b className="text-fg">{inr(pPrice, 2)}</b> · Units: {pr.units.toFixed(4)}</p>
            <div className="mt-5">
              <Slider label="Amount to buy" value={Math.min(amount, maxBuy)} min={50} max={maxBuy} step={10} onChange={setAmount} format={(n) => inr(n)} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={buy} disabled={pr.cash < 1}>Buy {inr(buyAmt)}</Button>
              <Button variant="outline" onClick={sell} disabled={pr.units <= 0}>Sell all</Button>
              <Button variant="outline" onClick={next}><FastForward className="h-4 w-4" /> Skip 1 month</Button>
              <Button variant="ghost" onClick={resetP}><RotateCcw className="h-4 w-4" /> Reset</Button>
            </div>
            {pr.units > 0 && holding < invested && <div className="mt-4"><Notice tone="warn">Your practice holding is below what you put in. This is what a dip feels like. Selling now would lock in the loss.</Notice></div>}
          </Card>
          <Card>
            <h3 className="font-semibold">Practice log</h3>
            {pr.history.length === 0 ? <p className="mt-3 text-sm text-muted">No practice trades yet. Buy some, then skip a few months to see how it moves.</p> : (
              <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto text-sm">
                {pr.history.map((h, i) => (
                  <li key={i} className="flex justify-between rounded-lg border border-line px-3 py-2">
                    <span><span className={h.action === "Bought" ? "text-accent" : "text-warn"}>{h.action}</span> <span className="text-muted">· month {Math.floor(h.day / 21)}</span></span>
                    <span className="tabular-nums">{inr(h.amount, 2)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <h2 className="text-xl font-bold">Opening a Demat account, step by step</h2>
            <ol className="mt-5 space-y-4">
              {STEPS.map((s, i) => (
                <li key={s.t} className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/15 font-display text-sm font-bold text-accent">{i + 1}</span>
                  <div><p className="font-semibold">{s.t}</p><p className="text-sm text-muted">{s.b}</p></div>
                </li>
              ))}
            </ol>
          </Card>
          <Card className="border-warn/30">
            <ShieldCheck className="h-7 w-7 text-warn" />
            <h2 className="mt-3 text-xl font-bold">KYC precautions</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted">{PRECAUTIONS.map((p) => <li key={p} className="flex gap-2"><span className="text-warn">!</span>{p}</li>)}</ul>
          </Card>
        </div>
      </Section>
    </>
  );
}
