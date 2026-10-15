// All maths is illustrative. Rates are assumptions, not predictions.

export const PRESETS = {
  cautious: { label: "Cautious", rate: 5, note: "Mostly deposits and debt funds. Smaller swings, smaller growth." },
  balanced: { label: "Balanced", rate: 8, note: "A mix of equity and debt. Moderate ups and downs." },
  growth: { label: "Growth", rate: 11, note: "Mostly equity. Bigger swings, including years with losses." },
} as const;
export type PresetKey = keyof typeof PRESETS;

/** Value after n months with monthly compounding at an assumed annual rate. */
export function project(current: number, monthly: number, annualRate: number, months: number) {
  const r = annualRate / 100 / 12;
  const g = Math.pow(1 + r, months);
  const fromCurrent = current * g;
  const fromMonthly = r === 0 ? monthly * months : monthly * ((g - 1) / r);
  const contributions = current + monthly * months;
  const total = fromCurrent + fromMonthly;
  return { total, contributions, growth: total - contributions };
}

/** Months until goal is reached, or null if not within maxMonths. */
export function monthsToGoal(goal: number, current: number, monthly: number, annualRate: number, maxMonths = 600) {
  if (current >= goal) return 0;
  const r = annualRate / 100 / 12;
  let v = current;
  for (let m = 1; m <= maxMonths; m++) {
    v = v * (1 + r) + monthly;
    if (v >= goal) return m;
  }
  return null;
}

/** Contribution-only timeline (no growth). */
export function monthsToGoalNoGrowth(goal: number, current: number, monthly: number) {
  if (current >= goal) return 0;
  if (monthly <= 0) return null;
  return Math.ceil((goal - current) / monthly);
}

/** Gain needed to recover from a fall of `drop` percent. */
export const breakEven = (drop: number) => (1 / (1 - drop / 100) - 1) * 100;

/** Small deterministic PRNG so demo charts look the same on every load. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
