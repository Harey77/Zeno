"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Receipt, Trash2, X } from "lucide-react";
import { AnimatedNumber, Button, Card, MoneyInput, Notice, Stat } from "@/components/ui";
import { Donut, Legend, LineChart } from "@/components/charts";
import { inr, inrShort, pct } from "@/lib/format";
import { EXPENSE_CATEGORIES, useStore, type ExpenseCategory } from "@/lib/store";

export const CAT_COLORS: Record<ExpenseCategory, string> = {
  Rent: "var(--accent)", Food: "#FFB800", Transport: "#14B88A", Bills: "#0B7A55",
  Shopping: "#FF8A3D", Health: "#FF5C5C", Fun: "#C9A227", Other: "var(--muted)",
};

const field = "mt-2 w-full rounded-xl border border-line bg-bg/60 px-3 py-2.5 text-sm outline-none transition focus:border-accent";
const today = () => new Date().toISOString().slice(0, 10);
const monthLabel = (m: string) => new Date(`${m}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

export function ExpenseTracker() {
  const { state, update } = useStore();
  const items = state.expenses.items;
  const b = state.budget;

  const months = useMemo(() => {
    const set = new Set(items.map((e) => e.date.slice(0, 7)));
    set.add(today().slice(0, 7));
    return [...set].sort().reverse();
  }, [items]);
  const [month, setMonth] = useState(months[0]);
  const [filter, setFilter] = useState<ExpenseCategory | null>(null);

  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<ExpenseCategory>("Food");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const inMonth = items.filter((e) => e.date.startsWith(month)).sort((a, z) => z.date.localeCompare(a.date));
  const spent = inMonth.reduce((a, e) => a + e.amount, 0);
  const budget = b.essentials + b.discretionary;
  const left = budget - spent;

  const byCat = EXPENSE_CATEGORIES.map((c) => ({ label: c, value: inMonth.filter((e) => e.category === c).reduce((a, e) => a + e.amount, 0), color: CAT_COLORS[c] }))
    .filter((s) => s.value > 0).sort((a, z) => z.value - a.value);
  const maxCat = Math.max(1, ...byCat.map((c) => c.value));

  // Cumulative spend by day against an even-pace budget line.
  const [y, m] = month.split("-").map(Number);
  const days = new Date(y, m, 0).getDate();
  const isCurrent = month === today().slice(0, 7);
  const upTo = isCurrent ? new Date().getDate() : days;
  const daily = Array.from({ length: days }, (_, i) => inMonth.filter((e) => Number(e.date.slice(8, 10)) === i + 1).reduce((a, e) => a + e.amount, 0));
  const cum = daily.reduce<number[]>((acc, v, i) => [...acc, (acc[i - 1] ?? 0) + v], []).slice(0, upTo);
  const pace = cum.map((_, i) => (budget * (i + 1)) / days);
  const labels = cum.map((_, i) => `${i + 1}`);
  const avg = upTo ? spent / upTo : 0;
  const projected = avg * days;

  const add = (e: FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return setErr("Enter an amount above ₹0.");
    if (!date) return setErr("Pick a date.");
    setErr(null);
    update("expenses", { items: [...items, { id: crypto.randomUUID(), date, category, amount, note: note.trim() }] });
    setAmount(0); setNote("");
    if (!date.startsWith(month)) setMonth(date.slice(0, 7));
  };
  const remove = (id: string) => update("expenses", { items: items.filter((x) => x.id !== id) });

  const list = filter ? inMonth.filter((e) => e.category === filter) : inMonth;

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-accent">EXPENSE TRACKER</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Where it actually went</h2>
          <p className="mt-1 text-sm text-muted">Log real spending and compare it with your planned essentials + discretionary budget of {inr(budget)}.</p>
        </div>
        <label className="text-sm">
          <span className="sr-only">Month</span>
          <select value={month} onChange={(e) => { setMonth(e.target.value); setFilter(null); }} className="rounded-full border border-line bg-surface px-4 py-2 outline-none focus:border-accent">
            {months.map((mo) => <option key={mo} value={mo}>{monthLabel(mo)}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Spent this month" value={<AnimatedNumber value={spent} format={inr} />} sub={`${inMonth.length} entries`} />
        <Stat label="Planned budget" value={<AnimatedNumber value={budget} format={inr} />} sub="Essentials + discretionary" />
        <Stat label={left >= 0 ? "Left to spend" : "Over budget"} value={<AnimatedNumber value={Math.abs(left)} format={inr} />} tone={left >= 0 ? "good" : "warn"}
          sub={budget ? `${pct((spent / budget) * 100, 0)} used` : undefined} />
        <Stat label="Daily average" value={<AnimatedNumber value={avg} format={inr} />} tone={projected > budget ? "warn" : undefined}
          sub={isCurrent ? `On pace for ${inrShort(projected)}` : `${days}-day month`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <h3 className="flex items-center gap-2 font-semibold"><Plus className="h-4 w-4 text-accent" /> Add an expense</h3>
          <form onSubmit={add} className="mt-4 space-y-4" noValidate>
            <MoneyInput label="Amount" value={amount} onChange={setAmount} max={10_000_000} />
            <div>
              <p className="text-sm font-medium">Category</p>
              <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Category">
                {EXPENSE_CATEGORIES.map((c) => (
                  <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${category === c ? "border-accent bg-accent/15 text-fg" : "border-line text-muted hover:text-fg"}`}>
                    <span className="h-2 w-2 rounded-full" style={{ background: CAT_COLORS[c] }} />{c}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">Date<input type="date" className={`${field} [color-scheme:dark]`} value={date} onChange={(e) => setDate(e.target.value)} /></label>
              <label className="block text-sm font-medium">Note<input className={field} value={note} maxLength={60} placeholder="Optional" onChange={(e) => setNote(e.target.value)} /></label>
            </div>
            {err && <Notice tone="warn">{err}</Notice>}
            <Button type="submit" className="w-full"><Plus className="h-4 w-4" /> Add {amount > 0 ? inr(amount) : "expense"}</Button>
          </form>
        </Card>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold">Spending vs. even pace</h3>
            <Legend items={[{ label: "Cumulative spend", color: "var(--accent)" }, { label: "Even-pace budget", color: "#FFB800", dashed: true }]} />
          </div>
          <div className="mt-4">
            {cum.length > 1 ? (
              <LineChart labels={labels} height={230}
                series={[{ name: "Spent", color: "var(--accent)", values: cum, fill: true }, { name: "Budget pace", color: "#FFB800", values: pace, dashed: true }]} />
            ) : <p className="py-16 text-center text-sm text-muted">Add expenses on two or more days to see the pace chart.</p>}
          </div>
          {cum.length > 1 && (cum.at(-1)! > pace.at(-1)! ? (
            <Notice tone="warn">You&apos;re {inr(cum.at(-1)! - pace.at(-1)!)} ahead of an even pace for day {upTo}. Not a problem if a big bill (like rent) came early.</Notice>
          ) : (
            <Notice tone="good">You&apos;re {inr(pace.at(-1)! - cum.at(-1)!)} under an even pace for day {upTo}.</Notice>
          ))}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <h3 className="font-semibold">By category</h3>
          <p className="text-xs text-muted">Tap a bar to filter the list.</p>
          {byCat.length ? (
            <>
              <div className="mt-5"><Donut segments={byCat} center={inrShort(spent)} sub={monthLabel(month)} size={180} /></div>
              <ul className="mt-5 space-y-2.5">
                {byCat.map((c, i) => (
                  <li key={c.label}>
                    <button onClick={() => setFilter(filter === c.label ? null : (c.label as ExpenseCategory))} aria-pressed={filter === c.label}
                      className={`w-full rounded-lg p-1.5 text-left text-sm transition hover:bg-fg/5 ${filter && filter !== c.label ? "opacity-40" : ""}`}>
                      <span className="flex justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />{c.label}</span>
                        <span className="tabular-nums text-muted">{inr(c.value)} · {pct((c.value / spent) * 100, 0)}</span></span>
                      <span className="mt-1.5 block h-1.5 rounded-full bg-line">
                        <motion.span className="block h-1.5 rounded-full" style={{ background: c.color }} initial={{ width: 0 }} animate={{ width: `${(c.value / maxCat) * 100}%` }} transition={{ delay: i * 0.05, type: "spring", stiffness: 120, damping: 20 }} />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : <p className="py-10 text-center text-sm text-muted">No expenses logged for {monthLabel(month)}.</p>}
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 font-semibold"><Receipt className="h-4 w-4 text-accent" /> Entries</h3>
            {filter && <button onClick={() => setFilter(null)} className="flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-xs text-muted hover:text-fg">{filter} <X className="h-3 w-3" /></button>}
          </div>
          <ul className="mt-4 max-h-[420px] space-y-2 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {list.map((e) => (
                <motion.li key={e.id} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-3 rounded-xl border border-line bg-bg/40 px-3 py-2.5 text-sm">
                  <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: CAT_COLORS[e.category] }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{e.note || e.category}</span>
                    <span className="text-xs text-muted">{e.category} · {new Date(`${e.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </span>
                  <span className="font-display font-semibold tabular-nums">{inr(e.amount)}</span>
                  <button onClick={() => remove(e.id)} aria-label={`Delete ${e.note || e.category} ${inr(e.amount)}`} className="rounded-full p-1.5 text-muted hover:bg-bad/10 hover:text-bad"><Trash2 className="h-4 w-4" /></button>
                </motion.li>
              ))}
            </AnimatePresence>
            {!list.length && <li className="py-10 text-center text-sm text-muted">Nothing here yet.</li>}
          </ul>
        </Card>
      </div>
    </div>
  );
}
