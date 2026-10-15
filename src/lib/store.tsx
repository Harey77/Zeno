"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { PresetKey } from "./finance";
import type { AllocMode, AssetKey, Weights } from "./allocation";

export type Entry = { id: string; date: string; amount: number };
export const EXPENSE_CATEGORIES = ["Rent", "Food", "Transport", "Bills", "Shopping", "Health", "Fun", "Other"] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type Expense = { id: string; date: string; category: ExpenseCategory; amount: number; note: string };
export type Lang = "en" | "hi" | "mr" | "gu" | "ta" | "bn";
export type AuthMethod = "guest" | "google" | "apple" | "phone" | "email";

export type AppState = {
  version: 1;
  profile: {
    name: string; email: string; phone: string; signedIn: boolean; guest: boolean; currency: "INR";
    level: "new" | "some" | "confident"; tips: boolean; lang: Lang; authMethod: AuthMethod | null;
  };
  expenses: { items: Expense[] };
  budget: { income: number; essentials: number; emergency: number; emergencyBalance: number; savings: number; discretionary: number };
  plan: {
    goal: number; current: number; monthly: number; years: number; preset: PresetKey; builtAt: string | null;
    mode: AllocMode; single: AssetKey; combo: string; custom: Weights;
  };
  progress: { entries: Entry[] };
  practice: { cash: number; units: number; day: number; history: { day: number; action: string; amount: number }[] };
  quiz: { best: number; attempts: number };
};

export const DEFAULT_STATE: AppState = {
  version: 1,
  profile: { name: "", email: "", phone: "", signedIn: false, guest: false, currency: "INR", level: "new", tips: true, lang: "en", authMethod: null },
  expenses: {
    items: [
      { id: "x1", date: "2026-10-01", category: "Rent", amount: 14000, note: "October rent" },
      { id: "x2", date: "2026-10-03", category: "Food", amount: 2400, note: "Groceries" },
      { id: "x3", date: "2026-10-04", category: "Bills", amount: 1850, note: "Electricity + phone" },
      { id: "x4", date: "2026-10-06", category: "Transport", amount: 1200, note: "Metro card" },
      { id: "x5", date: "2026-10-09", category: "Fun", amount: 900, note: "Movie + dinner" },
      { id: "x6", date: "2026-10-11", category: "Shopping", amount: 1600, note: "Shoes" },
      { id: "x7", date: "2026-10-12", category: "Food", amount: 650, note: "Eating out" },
      { id: "x8", date: "2026-10-13", category: "Health", amount: 480, note: "Pharmacy" },
    ],
  },
  budget: { income: 45000, essentials: 24000, emergency: 3000, emergencyBalance: 40000, savings: 7000, discretionary: 6000 },
  plan: {
    goal: 1000000, current: 25000, monthly: 7000, years: 8, preset: "balanced", builtAt: null,
    mode: "preset", single: "mf", combo: "c2", custom: { savings: 10, fd: 20, mf: 40, gold: 10, stocks: 20 },
  },
  progress: {
    entries: [
      { id: "e1", date: "2026-05-01", amount: 5000 },
      { id: "e2", date: "2026-06-01", amount: 5000 },
      { id: "e3", date: "2026-07-01", amount: 6000 },
      { id: "e4", date: "2026-08-01", amount: 7000 },
      { id: "e5", date: "2026-09-01", amount: 7000 },
    ],
  },
  practice: { cash: 500, units: 0, day: 0, history: [] },
  quiz: { best: 0, attempts: 0 },
};

const KEY = "zeno:v1";
const LEGACY_KEY = "honestly:v1"; // pre-rebrand saves are still read once

type Ctx = {
  state: AppState;
  ready: boolean;
  update: <K extends keyof AppState>(key: K, value: Partial<AppState[K]>) => void;
  replace: (s: AppState) => void;
  reset: () => void;
};

const StoreContext = createContext<Ctx | null>(null);

function merge(saved: Partial<AppState>): AppState {
  const out = { ...DEFAULT_STATE } as AppState;
  for (const k of Object.keys(DEFAULT_STATE) as (keyof AppState)[]) {
    const v = saved?.[k];
    if (v && typeof v === "object" && !Array.isArray(v)) (out as Record<string, unknown>)[k] = { ...(DEFAULT_STATE[k] as object), ...v };
  }
  return out;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setState(merge(JSON.parse(raw)));
    } catch { /* storage unavailable: keep defaults */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state, ready]);

  const update = useCallback<Ctx["update"]>((key, value) => {
    setState((s) => ({ ...s, [key]: { ...(s[key] as object), ...(value as object) } }));
  }, []);
  const replace = useCallback((s: AppState) => setState(merge(s)), []);
  const reset = useCallback(() => {
    try { localStorage.removeItem(KEY); localStorage.removeItem(LEGACY_KEY); } catch { /* ignore */ }
    setState(DEFAULT_STATE);
  }, []);

  return <StoreContext.Provider value={{ state, ready, update, replace, reset }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
