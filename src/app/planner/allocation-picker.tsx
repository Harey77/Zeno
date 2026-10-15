"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { Banknote, Check, Coins, Equal, Landmark, LineChart, PiggyBank, Wand2 } from "lucide-react";
import { Chips } from "@/components/ui";
import { PRESETS, type PresetKey } from "@/lib/finance";
import {
  ASSET_INFO, ASSETS, assetBadYear, assetColor, assetRate, COMBOS, EVEN, normalize, sumWeights,
  type AllocMode, type AssetKey, type Weights,
} from "@/lib/allocation";
import { useStore } from "@/lib/store";

const ICONS: Record<AssetKey, typeof Banknote> = { savings: PiggyBank, fd: Landmark, mf: Banknote, gold: Coins, stocks: LineChart };
const MODES: { key: AllocMode; label: string }[] = [
  { key: "preset", label: "Preset" },
  { key: "single", label: "Single asset" },
  { key: "combo", label: "Combination" },
  { key: "custom", label: "Custom mix" },
];

/** Thin stacked bar showing a weights split. */
export function WeightsBar({ w, className = "" }: { w: Weights; className?: string }) {
  const total = Math.max(100, sumWeights(w));
  return (
    <div className={`flex h-2.5 overflow-hidden rounded-full bg-line ${className}`} role="img"
      aria-label={ASSETS.filter((a) => w[a]).map((a) => `${ASSET_INFO[a].short} ${w[a]}%`).join(", ")}>
      {ASSETS.map((a) => (
        <motion.div key={a} style={{ background: assetColor(a) }} animate={{ width: `${((w[a] || 0) / total) * 100}%` }}
          transition={{ type: "spring", stiffness: 160, damping: 22 }} />
      ))}
    </div>
  );
}

function CustomRow({ a, value, onChange }: { a: AssetKey; value: number; onChange: (n: number) => void }) {
  const id = useId();
  const Icon = ICONS[a];
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5">
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium">
        <span className="grid h-6 w-6 place-items-center rounded-md" style={{ background: `color-mix(in srgb, ${assetColor(a)} 18%, transparent)`, color: assetColor(a) }}><Icon className="h-3.5 w-3.5" /></span>
        {ASSET_INFO[a].label}
        <span className="text-xs font-normal text-muted">~{assetRate(a)}%/yr</span>
      </label>
      <div className="flex items-center rounded-lg border border-line bg-bg/60 px-2 focus-within:border-accent">
        <input aria-label={`${ASSET_INFO[a].label} percent`} inputMode="numeric" value={value} maxLength={3}
          onChange={(e) => onChange(Math.min(100, Number(e.target.value.replace(/\D/g, "")) || 0))}
          className="w-10 bg-transparent py-1 text-right font-display font-semibold tabular-nums outline-none" />
        <span className="text-xs text-muted">%</span>
      </div>
      <input id={id} type="range" min={0} max={100} step={5} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="col-span-2" style={{ accentColor: assetColor(a) }} />
    </div>
  );
}

export function AllocationPicker() {
  const { state, update } = useStore();
  const p = state.plan;
  const mode = p.mode ?? "preset";
  const total = sumWeights(p.custom);
  const valid = total === 100;
  const setCustom = (a: AssetKey, n: number) => update("plan", { custom: { ...p.custom, [a]: n } });

  return (
    <div>
      <p className="text-sm font-medium">Asset allocation</p>
      <p className="mt-0.5 text-xs text-muted">Use a preset, put everything in one asset, pick a ready-made combination, or set your own split.</p>
      <div role="tablist" aria-label="Allocation mode" className="mt-3 grid grid-cols-2 gap-1 rounded-2xl border border-line p-1 sm:grid-cols-4">
        {MODES.map((m) => (
          <button key={m.key} role="tab" aria-selected={mode === m.key} onClick={() => update("plan", { mode: m.key })}
            className="relative rounded-xl px-2 py-2 text-xs font-semibold transition sm:text-sm">
            {mode === m.key && <motion.span layoutId="alloc-tab" className="absolute inset-0 rounded-xl bg-accent" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <span className={`relative ${mode === m.key ? "text-on-accent" : "text-muted hover:text-fg"}`}>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Keyed so each mode animates in; no exit-wait, so switching never depends on an animation finishing. */}
        <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }} className="mt-4">
          {mode === "preset" && (
            <div>
              <Chips<PresetKey> label="Preset" value={p.preset} onChange={(v) => update("plan", { preset: v })}
                options={(Object.keys(PRESETS) as PresetKey[]).map((k) => ({ value: k, label: `${PRESETS[k].label} · ${PRESETS[k].rate}%` }))} />
              <p className="mt-3 text-xs text-muted">{PRESETS[p.preset].note} Assumes a steady {PRESETS[p.preset].rate}% a year, which real markets never deliver smoothly.</p>
            </div>
          )}

          {mode === "single" && (
            <div role="radiogroup" aria-label="Single asset" className="grid gap-2">
              {ASSETS.map((a) => {
                const Icon = ICONS[a], on = p.single === a;
                return (
                  <button key={a} role="radio" aria-checked={on} onClick={() => update("plan", { single: a })}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${on ? "border-accent bg-accent/10" : "border-line hover:border-accent/40"}`}>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: `color-mix(in srgb, ${assetColor(a)} 18%, transparent)`, color: assetColor(a) }}><Icon className="h-4 w-4" /></span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold">100% {ASSET_INFO[a].label}</span>
                      <span className="text-xs text-muted">~{assetRate(a)}%/yr assumed · {assetBadYear(a) ? `bad year −${assetBadYear(a)}%` : "no market falls"}</span>
                    </span>
                    {on && <Check className="h-4 w-4 text-accent" />}
                  </button>
                );
              })}
              <p className="text-xs text-warn">One asset means no diversification: its weaknesses become your whole plan&apos;s weaknesses.</p>
            </div>
          )}

          {mode === "combo" && (
            <div role="radiogroup" aria-label="Combination" className="grid gap-2">
              {COMBOS.map((c) => {
                const on = p.combo === c.key;
                return (
                  <button key={c.key} role="radio" aria-checked={on} onClick={() => update("plan", { combo: c.key })}
                    className={`rounded-xl border p-3 text-left transition ${on ? "border-accent bg-accent/10" : "border-line hover:border-accent/40"}`}>
                    <span className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">{c.name}</span>{on && <Check className="h-4 w-4 text-accent" />}</span>
                    <span className="mt-0.5 block text-xs text-muted">{c.desc}</span>
                    <WeightsBar w={c.weights} className="mt-2.5" />
                    <span className="mt-1.5 flex flex-wrap gap-x-3 text-[11px] text-muted">
                      {ASSETS.filter((a) => c.weights[a]).map((a) => <span key={a}><span style={{ color: assetColor(a) }}>●</span> {ASSET_INFO[a].short} {c.weights[a]}%</span>)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {mode === "custom" && (
            <div className="space-y-4">
              {ASSETS.map((a) => <CustomRow key={a} a={a} value={p.custom[a] || 0} onChange={(n) => setCustom(a, n)} />)}
              <div className={`rounded-xl border p-3 ${valid ? "border-accent/40 bg-accent/5" : "border-warn/50 bg-warn/10"}`} role="status" aria-live="polite">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Total</span>
                  <motion.span key={total} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className={`font-display text-lg font-bold tabular-nums ${valid ? "text-accent" : "text-warn"}`}>{total}%</motion.span>
                </div>
                <WeightsBar w={p.custom} className="mt-2" />
                {!valid && <p className="mt-2 text-xs text-warn">{total > 100 ? `${total - 100}% over` : `${100 - total}% left to allocate`}. Allocations must add up to exactly 100% before you can build the plan.</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => update("plan", { custom: normalize(p.custom) })} disabled={valid}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold transition hover:border-accent/60 disabled:opacity-40">
                  <Wand2 className="h-3.5 w-3.5" /> Scale to 100%
                </button>
                <button onClick={() => update("plan", { custom: { ...EVEN } })}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold transition hover:border-accent/60">
                  <Equal className="h-3.5 w-3.5" /> Even split
                </button>
              </div>
            </div>
          )}
        </motion.div>

    </div>
  );
}
