// Asset allocation for the Plan Builder and personalised dashboard.
// A plan's money is split into "sleeves". The split comes from one of four modes:
//   preset  – Cautious / Balanced / Growth model mixes
//   single  – 100% in one of the five asset classes
//   combo   – a named ready-made combination of the five classes
//   custom  – the user's own percentages across the five classes (must total 100)
// Rates are illustrative long-run averages AFTER typical tax (FD/debt interest at slab, equity LTCG 12.5%).
// They are assumptions for education, not forecasts or advice.

import { monthsToGoal, PRESETS, project, type PresetKey } from "./finance";
import { inr } from "./format";

export const ASSETS = ["savings", "fd", "mf", "gold", "stocks"] as const;
export type AssetKey = (typeof ASSETS)[number];
export type AllocMode = "preset" | "single" | "combo" | "custom";
export type Weights = Record<AssetKey, number>; // whole percentages

const S = {
  liquid: { key: "liquid", name: "Savings / liquid fund", examples: "Savings account, sweep-in FD, liquid mutual fund", rate: 3.5, badYear: 0, liquidity: "Same day – 1 day", color: "#7FA698" },
  fd: { key: "fd", name: "Bank FD / RD", examples: "Fixed or recurring deposit, laddered across 1–3 yrs", rate: 5, badYear: 0, liquidity: "Penalty if broken early", color: "#0B7A55" },
  debt: { key: "debt", name: "Debt mutual fund", examples: "Short-duration, corporate bond or gilt funds", rate: 5, badYear: 2, liquidity: "1–2 working days", color: "#14B88A" },
  hybrid: { key: "hybrid", name: "Hybrid fund", examples: "Balanced advantage / aggressive hybrid funds", rate: 8.5, badYear: 18, liquidity: "1–3 working days", color: "#5FD3A8" },
  mf: { key: "mf", name: "Mutual funds / SIPs", examples: "Diversified equity, flexi-cap or index mutual funds via monthly SIP", rate: 9.5, badYear: 28, liquidity: "1–3 working days", color: "#00C985" },
  gold: { key: "gold", name: "Gold ETF / fund", examples: "Gold ETF or gold fund of fund", rate: 6.5, badYear: 15, liquidity: "1–3 working days", color: "#FFB800" },
  index: { key: "index", name: "Large-cap index fund / ETF", examples: "Nifty 50 or Sensex index fund / ETF via SIP", rate: 10.5, badYear: 35, liquidity: "1–3 working days", color: "var(--accent)" },
  flexi: { key: "flexi", name: "Flexi / mid-cap equity", examples: "Flexi-cap or Nifty Midcap 150 index fund via SIP", rate: 12.5, badYear: 45, liquidity: "1–3 working days", color: "#FF8A3D" },
  stocks: { key: "stocks", name: "Stocks / ETFs", examples: "A Nifty 50 ETF first, then a few large listed companies", rate: 11, badYear: 40, liquidity: "Same day (T+1 settlement)", color: "#FF8A3D" },
} as const;
type SleeveKey = keyof typeof S;

/** The five user-facing asset classes and the sleeve each one maps to. */
export const ASSET_INFO: Record<AssetKey, { label: string; short: string; sleeve: SleeveKey }> = {
  savings: { label: "Savings", short: "Savings", sleeve: "liquid" },
  fd: { label: "Fixed Deposits", short: "FDs", sleeve: "fd" },
  mf: { label: "Mutual Funds / SIPs", short: "Mutual Funds", sleeve: "mf" },
  gold: { label: "Gold", short: "Gold", sleeve: "gold" },
  stocks: { label: "Stocks / ETFs", short: "Stocks", sleeve: "stocks" },
};
export const assetRate = (a: AssetKey) => S[ASSET_INFO[a].sleeve].rate;
export const assetBadYear = (a: AssetKey) => S[ASSET_INFO[a].sleeve].badYear;
export const assetColor = (a: AssetKey) => S[ASSET_INFO[a].sleeve].color;

export const COMBOS: { key: string; name: string; desc: string; weights: Weights }[] = [
  { key: "c1", name: "Combination 1 · Steady Saver", desc: "Deposits first, a modest SIP and a gold hedge.", weights: { savings: 20, fd: 50, mf: 20, gold: 10, stocks: 0 } },
  { key: "c2", name: "Combination 2 · SIP Builder", desc: "A monthly mutual-fund SIP at the core, cushioned by FDs.", weights: { savings: 10, fd: 20, mf: 50, gold: 10, stocks: 10 } },
  { key: "c3", name: "Combination 3 · Gold & Growth", desc: "Equal-ish weight to gold and equity for diversification.", weights: { savings: 10, fd: 10, mf: 30, gold: 25, stocks: 25 } },
  { key: "c4", name: "Combination 4 · Market Max", desc: "Mostly equity through funds and ETFs; for long horizons only.", weights: { savings: 5, fd: 0, mf: 40, gold: 5, stocks: 50 } },
];

export const EVEN: Weights = { savings: 20, fd: 20, mf: 20, gold: 20, stocks: 20 };
export const sumWeights = (w: Weights) => ASSETS.reduce((a, k) => a + (w[k] || 0), 0);

/** Scale weights to total exactly 100, putting any rounding remainder on the largest one. */
export function normalize(w: Weights): Weights {
  const total = sumWeights(w);
  if (total <= 0) return { ...EVEN };
  const out = Object.fromEntries(ASSETS.map((k) => [k, Math.floor(((w[k] || 0) * 100) / total)])) as Weights;
  const rest = 100 - sumWeights(out);
  const top = ASSETS.reduce((a, k) => ((w[k] || 0) > (w[a] || 0) ? k : a), ASSETS[0]);
  out[top] += rest;
  return out;
}

type Mix = { sleeve: SleeveKey; weight: number; why: string }[];

const PRESET_MIXES: Record<PresetKey, { headline: string; horizon: string; mix: Mix }> = {
  cautious: {
    headline: "Capital protection first: mostly deposits and debt, a small gold hedge.",
    horizon: "Suits goals under ~5 years, or anyone who would lose sleep over a 10% fall.",
    mix: [
      { sleeve: "fd", weight: 0.45, why: "Known outcome; ladder maturities so some money frees up every year." },
      { sleeve: "debt", weight: 0.25, why: "Slightly more flexible than FDs; small price moves when interest rates change." },
      { sleeve: "liquid", weight: 0.15, why: "Instant access so you never break an FD for a surprise bill." },
      { sleeve: "gold", weight: 0.1, why: "Often holds up when other assets struggle; no income." },
      { sleeve: "index", weight: 0.05, why: "A small equity slice to start learning how markets move." },
    ],
  },
  balanced: {
    headline: "A middle path: hybrid funds and gold steady an equity core.",
    horizon: "Suits goals 5–8 years away, with tolerance for a 15–20% dip along the way.",
    mix: [
      { sleeve: "index", weight: 0.35, why: "Broad, low-cost equity growth engine through a monthly SIP." },
      { sleeve: "hybrid", weight: 0.25, why: "The fund rebalances between equity and debt for you." },
      { sleeve: "fd", weight: 0.2, why: "Ballast: doesn't fall when markets do." },
      { sleeve: "gold", weight: 0.15, why: "Diversifier that tends to move differently from shares." },
      { sleeve: "liquid", weight: 0.05, why: "Small buffer for rebalancing and short-term needs." },
    ],
  },
  growth: {
    headline: "Equity-led: SIPs into index and flexi/mid-cap funds, with gold as a hedge.",
    horizon: "Suits goals 8+ years away, only after a full emergency fund. Expect 30–40% drops at times.",
    mix: [
      { sleeve: "index", weight: 0.45, why: "Core holding: the 50 largest listed companies at low cost." },
      { sleeve: "flexi", weight: 0.4, why: "Higher growth potential, with bigger and longer drawdowns." },
      { sleeve: "gold", weight: 0.1, why: "Cushions some equity crashes; rebalance into equity after falls." },
      { sleeve: "liquid", weight: 0.05, why: "Dry powder so you never sell equity in a panic." },
    ],
  },
};

const ASSET_WHY: Record<AssetKey, string> = {
  savings: "Your buffer: instant access, no market risk, but usually below inflation.",
  fd: "Predictable and insured by DICGC up to ₹5 lakh per bank; interest is taxed at your slab.",
  mf: "Professionally managed and diversified from ₹100–₹500 a month; equity funds swing with the market.",
  gold: "Behaves differently from shares at times; pays no income and can stay flat for years.",
  stocks: "Highest growth potential and the biggest swings; single companies can fall 50%+.",
};

export type PlanInput = {
  goal: number; current: number; monthly: number; years: number; preset: PresetKey;
  mode?: AllocMode; single?: AssetKey; combo?: string; custom?: Weights;
};

/** Resolve the plan's chosen mode into sleeves plus a short label for UI copy. */
export function resolveMix(p: PlanInput): { label: string; headline: string; horizon: string; mix: Mix; weights?: Weights } {
  const mode = p.mode ?? "preset";
  if (mode === "preset") return { label: `${PRESETS[p.preset].label} preset`, ...PRESET_MIXES[p.preset] };

  let weights: Weights;
  let label: string;
  if (mode === "single") {
    const a = p.single ?? "mf";
    weights = { savings: 0, fd: 0, mf: 0, gold: 0, stocks: 0, [a]: 100 } as Weights;
    label = `100% ${ASSET_INFO[a].label}`;
  } else if (mode === "combo") {
    const c = COMBOS.find((x) => x.key === p.combo) ?? COMBOS[0];
    weights = c.weights;
    label = c.name;
  } else {
    weights = normalize(p.custom ?? EVEN);
    label = "Custom mix";
  }
  const mix: Mix = ASSETS.filter((a) => weights[a] > 0).map((a) => ({ sleeve: ASSET_INFO[a].sleeve, weight: weights[a] / 100, why: ASSET_WHY[a] }));
  const bad = mix.reduce((acc, m) => acc + m.weight * S[m.sleeve].badYear, 0);
  const single = mix.length === 1;
  const headline = single
    ? `Everything in ${ASSET_INFO[p.single ?? "mf"].label}: simple to run, but no diversification.`
    : bad < 8 ? "A low-volatility mix built around deposits and cash."
    : bad < 20 ? "A moderate mix: market-linked growth with a meaningful cushion."
    : "An equity-heavy mix: higher growth potential, deeper falls.";
  const horizon = bad < 8 ? "Suits goals under ~5 years; may struggle to beat inflation over long periods."
    : bad < 20 ? "Suits goals around 5–8 years away, with tolerance for a 15–20% dip."
    : "Suits goals 8+ years away, only after a full emergency fund. Expect 30–40% drops at times.";
  return { label, headline, horizon, mix, weights };
}

/** Concrete, rupee-specific next step for one sleeve. Product types only, never named schemes. */
function actionFor(key: SleeveKey, monthly: number, start: number): string {
  const m = inr(monthly), s = inr(start);
  const lump = start > 0;
  switch (key) {
    case "liquid": return `Keep ${m}/month in a savings or sweep-in account${lump ? ` (plus ${s} now)` : ""}. Treat it as your buffer and rebalancing cash.`;
    case "fd": return `Start a ${m}/month recurring deposit. Each year, roll the matured amount into a 1–3 year FD so one matures every year.${lump ? ` Split the ${s} you have across 2–3 FDs of different tenures.` : ""} Keep each bank under the ₹5 lakh DICGC limit.`;
    case "debt": return `Run a ${m}/month SIP into a short-duration or corporate-bond fund (direct plan).${lump ? ` Add the ${s} as a lump sum.` : ""} Check credit quality and expense ratio in the factsheet.`;
    case "hybrid": return `Set up a ${m}/month SIP into a balanced-advantage or aggressive-hybrid fund (direct plan).${lump ? ` Move the ${s} in over 6 months via an STP.` : ""}`;
    case "mf": return `Set up a ${m}/month SIP on a fixed date (say the 5th) into a direct-plan diversified equity or index fund. Compare expense ratios: direct index funds are often under 0.5%.${lump ? ` Spread the ${s} over 6–12 months with an STP rather than investing it all at once.` : ""}`;
    case "gold": return `Put ${m}/month into a gold ETF or gold fund of fund, not jewellery (making charges plus 3% GST aren't recoverable).${lump ? ` Add the ${s} gradually.` : ""} Rebalance back to target once a year.`;
    case "index": return `Run a ${m}/month SIP into a Nifty 50 or Sensex index fund, or buy the equivalent ETF monthly.${lump ? ` Spread the ${s} over 6–12 months.` : ""}`;
    case "flexi": return `Run a ${m}/month SIP into a flexi-cap or mid-cap index fund. Expect bigger swings than the Nifty 50; don't stop the SIP in a fall.${lump ? ` Spread the ${s} over 12 months.` : ""}`;
    case "stocks": return `Open a demat account with a SEBI-registered broker. Put most of the ${m}/month into a Nifty 50 ETF; if you buy individual shares, cap any one company at 10% of this sleeve.${lump ? ` Deploy the ${s} over 6–12 months.` : ""}`;
  }
}

export function buildAllocation(p: PlanInput) {
  const cfg = resolveMix(p);
  const months = p.years * 12;
  const sleeves = cfg.mix.map(({ sleeve, weight, why }) => {
    const s = S[sleeve];
    const monthly = p.monthly * weight, start = p.current * weight;
    const res = project(start, monthly, s.rate, months);
    return { ...s, weight, why, monthly, start, value: res.total, contributions: res.contributions, growth: res.growth, action: actionFor(sleeve, monthly, start) };
  });
  const blended = sleeves.reduce((a, s) => a + s.weight * s.rate, 0);
  const total = sleeves.reduce((a, s) => a + s.value, 0);
  const contributions = p.current + p.monthly * months;
  const badYearPct = sleeves.reduce((a, s) => a + s.weight * s.badYear, 0);
  // Stress: a bad year hits in the final year, when the balance is biggest.
  const stressed = sleeves.reduce((a, s) => a + s.value * (1 - s.badYear / 100), 0);
  const eta = monthsToGoal(p.goal, p.current, p.monthly, blended);
  const milestones = [0.25, 0.5, 0.75, 1].map((f) => ({ f, months: monthsToGoal(p.goal * f, p.current, p.monthly, blended) }));
  const yearly = Array.from({ length: p.years + 1 }, (_, y) => {
    const by = sleeves.map((s) => project(s.start, s.monthly, s.rate, y * 12).total);
    return { year: y, total: by.reduce((a, v) => a + v, 0), contributions: p.current + p.monthly * 12 * y, by };
  });
  return { ...cfg, mode: p.mode ?? "preset", sleeves, blended, total, contributions, growth: total - contributions, badYearPct, stressed, eta, milestones, yearly };
}

export type Allocation = ReturnType<typeof buildAllocation>;

/** Which of the five user-facing asset classes a sleeve belongs to (debt, hybrid and index funds are mutual funds). */
export function assetOf(sleeve: string): AssetKey {
  if (sleeve === "liquid") return "savings";
  if (sleeve === "fd" || sleeve === "gold" || sleeve === "stocks") return sleeve;
  return "mf";
}
