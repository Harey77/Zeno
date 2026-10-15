// Zeno guide: a local, rule-based financial educator.
// Every answer has three parts: plain-language explanation -> INR calculation -> explicit risk/limitation.
// Numbers come from the user's Money Snapshot and Plan Builder (localStorage), or from amounts typed in the question.

import { breakEven, monthsToGoal, monthsToGoalNoGrowth, PRESETS, project } from "./finance";
import { duration, inr, pct } from "./format";
import type { AppState } from "./store";

/**
 * The contract this engine follows. Kept as a prompt so the same behaviour can be handed to
 * a hosted LLM later (that needs a server route; this app is a static export, so it runs locally).
 */
export const SYSTEM_PROMPT = `You are Zeno, a financial educator for first-time savers and investors in India.
Follow SEBI's investor-education principles: you explain concepts, you do not recommend specific securities,
funds, or timing, and you never promise or imply guaranteed returns. You are not a SEBI-registered investment adviser.
Always answer in exactly three parts:
1. PLAIN LANGUAGE: what the concept is and why it matters, in 2-3 short sentences, no jargon without a definition.
2. INR EXAMPLE: a concrete calculation in rupees with Indian digit grouping (₹1,00,000). Use the user's own numbers
   from their Money Snapshot and Plan when available, and state every assumption (rate, years, inflation).
   Always separate the user's own contributions from hypothetical growth.
3. RISK / LIMITATION: the specific way this can go wrong, what the example ignores (fees, tax, inflation, volatility),
   and where to verify (SEBI, RBI, AMFI, the product's official documents).
If a question asks what to buy, explain how to evaluate options instead. If unsure or out of scope, say so plainly.`;

export type Answer = {
  topic: string;
  title: string;
  explain: string;
  example: string[];
  risk: string;
  personal: boolean; // true when the example used the user's saved numbers
  links?: { href: string; label: string }[];
  followUps?: string[];
};

type Ctx = {
  income: number; essentials: number; emergencyMonthly: number; emergencyBalance: number; savings: number; discretionary: number;
  goal: number; current: number; monthly: number; years: number; rate: number; preset: string;
  spent: number; topCat: string | null; topCatAmt: number;
};

type Q = { text: string; amount?: number; years?: number; rate?: number };

export function contextFrom(s: AppState): Ctx {
  const month = new Date().toISOString().slice(0, 7);
  const items = s.expenses?.items ?? [];
  const thisMonth = items.filter((e) => e.date.startsWith(month));
  const pool = thisMonth.length ? thisMonth : items;
  const byCat = new Map<string, number>();
  pool.forEach((e) => byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.amount));
  const top = [...byCat.entries()].sort((a, b) => b[1] - a[1])[0];
  return {
    income: s.budget.income, essentials: s.budget.essentials, emergencyMonthly: s.budget.emergency,
    emergencyBalance: s.budget.emergencyBalance, savings: s.budget.savings, discretionary: s.budget.discretionary,
    goal: s.plan.goal, current: s.plan.current, monthly: s.plan.monthly, years: s.plan.years,
    rate: PRESETS[s.plan.preset].rate, preset: PRESETS[s.plan.preset].label,
    spent: pool.reduce((a, e) => a + e.amount, 0), topCat: top?.[0] ?? null, topCatAmt: top?.[1] ?? 0,
  };
}

// ---------- parsing ----------

const UNIT: Record<string, number> = { k: 1e3, thousand: 1e3, l: 1e5, lac: 1e5, lacs: 1e5, lakh: 1e5, lakhs: 1e5, cr: 1e7, crore: 1e7, crores: 1e7 };

export function parse(text: string): Q {
  let s = text.toLowerCase().replace(/,/g, "");
  const q: Q = { text: text.toLowerCase() };
  const yr = s.match(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?|saal|varsh)\b/);
  if (yr) { q.years = Math.min(50, Math.max(1, Math.round(Number(yr[1])))); s = s.replace(yr[0], " "); }
  const mo = !yr && s.match(/(\d+)\s*(?:months?|mos?)\b/);
  if (mo) { q.years = Math.max(1, Math.round(Number(mo[1]) / 12)); s = s.replace(mo[0], " "); }
  const rt = s.match(/(\d+(?:\.\d+)?)\s*(?:%|percent|per cent)/);
  if (rt) { q.rate = Number(rt[1]); s = s.replace(rt[0], " "); }
  const amt = s.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(k|thousand|lakhs?|lacs?|l|crores?|cr)?\b/);
  if (amt) {
    const n = Number(amt[1]) * (amt[2] ? UNIT[amt[2]] ?? 1 : 1);
    if (n >= 100) q.amount = n;
  }
  return q;
}

// ---------- helpers ----------

const fv = (p: number, ratePct: number, years: number) => p * Math.pow(1 + ratePct / 100, years);
function pmtFor(goal: number, current: number, ratePct: number, months: number) {
  const r = ratePct / 100 / 12, g = Math.pow(1 + r, months);
  return r === 0 ? (goal - current) / months : Math.max(0, (goal - current * g) / ((g - 1) / r));
}
const round100 = (n: number) => Math.ceil(n / 100) * 100;

// ---------- topics ----------

type Topic = { id: string; title: string; keys: string[]; run: (q: Q, c: Ctx) => Omit<Answer, "topic" | "title"> };

const TOPICS: Topic[] = [
  {
    id: "sip", title: "SIP (Systematic Investment Plan)", keys: ["sip", "systematic", "monthly invest", "एसआईपी"],
    run: (q, c) => {
      const amt = q.amount ?? (c.monthly || 5000), y = q.years ?? c.years, r = q.rate ?? c.rate, m = y * 12;
      const res = project(0, amt, r, m);
      return {
        personal: q.amount === undefined,
        explain: "A SIP is an instruction to put a fixed amount into a mutual fund on a fixed date, usually every month. It is a method, not a product: the risk and return come from the fund you choose. Buying every month means you get more units when prices are low and fewer when they're high.",
        example: [
          `${inr(amt)}/month × ${m} months = ${inr(res.contributions)} of your own money.`,
          `If the fund averaged ${r}% a year (an assumption, not a forecast), it could be about ${inr(res.total)}, of which ${inr(res.growth)} is growth.`,
          `At 0% average return you'd have just your ${inr(res.contributions)}. A 25% fall in the final year would show ${inr(res.total)} as about ${inr(res.total * 0.75)}.`,
        ],
        risk: "Equity-fund SIPs can sit below what you put in for one to three years at a stretch. Returns are not guaranteed and past returns don't predict future ones. The fund's expense ratio and capital-gains tax reduce what you keep. Read the scheme's riskometer and Scheme Information Document before investing.",
        links: [{ href: "/planner/", label: "Model it in Plan Builder" }],
        followUps: ["What if I save ₹500 more?", "What happens in a market crash?"],
      };
    },
  },
  {
    id: "emergency", title: "Emergency fund", keys: ["emergency", "cushion", "buffer", "rainy day", "job loss"],
    run: (q, c) => {
      const ess = q.amount ?? c.essentials;
      const t3 = ess * 3, t6 = ess * 6, have = c.emergencyBalance;
      const cover = ess ? have / ess : 0;
      const gap = Math.max(0, t3 - have);
      const fill = c.emergencyMonthly > 0 ? Math.ceil(gap / c.emergencyMonthly) : null;
      return {
        personal: q.amount === undefined,
        explain: "An emergency fund is money kept only for genuine shocks: job loss, a medical bill, an urgent repair. A common guideline is 3 to 6 months of essential expenses, held somewhere you can reach within a day. It's what stops you from selling investments at a loss when life happens.",
        example: [
          `Essentials of ${inr(ess)}/month → 3 months = ${inr(t3)}, 6 months = ${inr(t6)}.`,
          `You have ${inr(have)} saved, which covers about ${cover.toFixed(1)} months.`,
          gap === 0
            ? `You're already past the 3-month mark. Reaching 6 months needs ${inr(Math.max(0, t6 - have))} more.`
            : fill
              ? `At your ${inr(c.emergencyMonthly)}/month emergency contribution, closing the ${inr(gap)} gap to 3 months takes about ${duration(fill)}.`
              : `You'd need ${inr(gap)} more to reach 3 months. Your snapshot has no monthly emergency contribution yet.`,
        ],
        risk: "3–6 months is a rule of thumb. Irregular income, dependants or a single-income household often need more. Keep this money out of equity: a market crash and a job loss often arrive together. Savings-account interest may not keep up with inflation.",
        links: [{ href: "/life/", label: "Stress-test it in Life Happens" }],
      };
    },
  },
  {
    id: "fd", title: "Fixed Deposits", keys: ["fd", "fixed deposit", "deposit", "bank interest"],
    run: (q, c) => {
      const p = q.amount ?? (c.current || 50000), r = q.rate ?? 7, y = q.years ?? 1;
      const mat = p * Math.pow(1 + r / 400, 4 * y), int = mat - p;
      const real = mat / Math.pow(1.05, y);
      return {
        personal: q.amount === undefined && c.current > 0,
        explain: "A fixed deposit lends your money to a bank for a fixed period at a rate locked in on day one. You know the outcome in advance, which makes FDs useful for goals one to five years away and for parking part of an emergency fund.",
        example: [
          `${inr(p)} at ${r}% for ${y} yr${y > 1 ? "s" : ""}, compounded quarterly ≈ ${inr(mat)} (${inr(int)} interest).`,
          `Interest is taxed at your slab rate: in the 30% slab you keep about ${inr(int * 0.7)}; in the 5% slab about ${inr(int * 0.95)} (cess ignored).`,
          `If prices rise 5% a year, ${inr(mat)} after ${y} yr${y > 1 ? "s" : ""} buys roughly what ${inr(real)} buys today.`,
        ],
        risk: "Market risk is low and DICGC insures up to ₹5 lakh per depositor per bank (principal plus interest). But breaking an FD early usually costs a penalty, interest is fully taxable, and after tax and inflation the real return can be close to zero. The rate here is illustrative; check the bank's current card rate.",
        links: [{ href: "/compare/", label: "Compare all 5 pathways" }],
      };
    },
  },
  {
    id: "inflation", title: "Inflation", keys: ["inflation", "prices rise", "purchasing power", "mehngai", "महंगाई", "cost of living"],
    run: (q, c) => {
      const amt = q.amount ?? c.essentials, y = q.years ?? 10, inf = q.rate ?? 6;
      const future = fv(amt, inf, y), lakhToday = 100000 / Math.pow(1 + inf / 100, y);
      return {
        personal: q.amount === undefined,
        explain: "Inflation is the general rise in prices. Each year the same rupee buys a little less, so money earning less than inflation quietly loses value even while the number in your account grows.",
        example: [
          `Your essentials of ${inr(amt)}/month could cost about ${inr(future)}/month in ${y} years at ${inf}% inflation.`,
          `₹1,00,000 kept as idle cash for ${y} years would buy roughly what ${inr(lakhToday)} buys today.`,
          `A savings account paying 3% against ${inf}% inflation loses about ${pct(inf - 3, 0)} of buying power a year.`,
        ],
        risk: `${inf}% is an assumption. Actual inflation changes every year and depends on what you buy: school fees and healthcare often rise faster than the headline CPI. This ignores tax on any interest earned.`,
      };
    },
  },
  {
    id: "saveMore", title: "Saving ₹500 more", keys: ["save more", "500 more", "extra", "increase", "step up", "top up"],
    run: (q, c) => {
      const extra = q.amount ?? 500, y = q.years ?? c.years, m = y * 12, base = c.monthly;
      const grown = project(0, extra, c.rate, m);
      const a = monthsToGoal(c.goal, c.current, base, c.rate), b = monthsToGoal(c.goal, c.current, base + extra, c.rate);
      return {
        personal: true,
        explain: "Raising your monthly saving by a small, fixed amount is one of the few levers you fully control. The extra contributions are certain; any growth on them is not.",
        example: [
          `+${inr(extra)}/month × ${m} months = ${inr(extra * m)} more of your own money.`,
          `At an assumed ${c.rate}% (${c.preset} preset), that extra could grow to about ${inr(grown.total)}.`,
          a !== null && b !== null
            ? `Your ${inr(c.goal)} goal: ${duration(a)} at ${inr(base)}/month vs ${duration(b)} at ${inr(base + extra)}/month, about ${duration(Math.max(0, a - b))} sooner.`
            : `At ${inr(base)}/month your ${inr(c.goal)} goal isn't reached within 50 years under this assumption; ${inr(base + extra)}/month ${b === null ? "still doesn't get there" : `gets there in ${duration(b)}`}.`,
        ],
        risk: "Only the contribution maths is certain. Growth assumes a smooth return that real markets never deliver. Make sure the extra isn't coming out of your emergency cushion or essentials.",
        links: [{ href: "/save-more/", label: "Open the ₹500 comparison" }],
      };
    },
  },
  {
    id: "goal", title: "Reaching your goal", keys: ["goal", "how long", "million", "crore", "10 lakh", "target", "when will i", "timeline"],
    run: (q, c) => {
      const goal = q.amount ?? c.goal, y = q.years ?? c.years;
      const own = monthsToGoalNoGrowth(goal, c.current, c.monthly), grow = monthsToGoal(goal, c.current, c.monthly, c.rate);
      const need = round100(pmtFor(goal, c.current, c.rate, y * 12));
      return {
        personal: true,
        explain: "How fast you reach a goal depends on three things you control (what you start with, what you add each month, how long you stay invested) and one you don't: returns. Your own contributions are the only guaranteed part.",
        example: [
          `Goal ${inr(goal)}; you have ${inr(c.current)} and add ${inr(c.monthly)}/month.`,
          `Your money only (0% growth): ${own === null ? "never, with no monthly saving" : own > 600 ? "over 50 years" : duration(own)}.`,
          `At an assumed ${c.rate}% a year: ${grow === null ? "over 50 years" : duration(grow)}.`,
          `To reach it in ${y} years at ${c.rate}%, you'd need about ${inr(need)}/month.`,
        ],
        risk: `The ${c.rate}% figure is a steady-return assumption. Real returns arrive unevenly, include negative years, and are reduced by fees, tax and inflation. ${inr(goal)} in ${y} years will also buy less than ${inr(goal)} today.`,
        links: [{ href: "/planner/", label: "Adjust in Plan Builder" }],
      };
    },
  },
  {
    id: "crash", title: "Market crashes and recovery", keys: ["crash", "fall", "drop", "down", "correction", "bear", "recover", "volatile", "volatility", "loss"],
    run: (q, c) => {
      const v = q.amount ?? Math.max(c.current, 50000), d = Math.min(95, q.rate ?? 30);
      return {
        personal: q.amount === undefined && c.current >= 50000,
        explain: "Markets fall when more people want to sell than buy, triggered by fear, rising interest rates, weaker profits or prices having run ahead of reality. Falls are a normal part of equity investing. The maths of recovery is lopsided: a loss needs a bigger percentage gain to undo.",
        example: [
          `A ${d}% fall turns ${inr(v)} into ${inr(v * (1 - d / 100))}, a ${inr((v * d) / 100)} paper loss.`,
          `To get back to ${inr(v)} it then needs +${pct(breakEven(d), 1)}, not +${d}%.`,
          "History, not a promise: the Nifty 50 fell about 38% between January and March 2020 and regained its peak by November 2020. In 2008 it fell about 60% and took close to three years to recover.",
        ],
        risk: "Nobody can reliably predict when falls start or how long recovery takes; some individual stocks never recover. Selling during a fall turns a paper loss into a real one. That's why money you need within about five years shouldn't be in equity.",
        links: [{ href: "/risk/", label: "Try the 3D crash simulator" }],
      };
    },
  },
  {
    id: "gold", title: "Gold", keys: ["gold", "sona", "सोना", "jewellery", "jewelry"],
    run: (q, c) => {
      const amt = q.amount ?? Math.round((c.monthly || 5000) * 0.1), y = q.years ?? 5;
      return {
        personal: q.amount === undefined,
        explain: "Gold is a traditional store of value whose price moves with global demand and the rupee-dollar rate. It sometimes holds up when stocks fall, which is why many example portfolios keep a small slice in it. For investing, gold ETFs and gold mutual funds avoid making charges and storage worries.",
        example: [
          `10% of your ${inr(c.monthly)} monthly saving is ${inr(amt)}. Over ${y} years that's ${inr(amt * 12 * y)} into gold.`,
          `Jewellery: on ₹1,00,000 of gold with 10% making charges and 3% GST, you pay about ₹1,13,300 but resale is based only on the metal value.`,
          "In rupee terms gold was roughly flat from about 2012 to 2018, then rose sharply. Long flat stretches are normal.",
        ],
        risk: "Gold pays no interest or dividend, can stay flat or fall for years, and gold ETFs and funds carry an expense ratio. Physical gold adds purity, storage and resale-discount risk.",
        links: [{ href: "/compare/", label: "Compare all 5 pathways" }],
      };
    },
  },
  {
    id: "stocks", title: "Stocks and ETFs", keys: ["stock", "share", "equity", "etf", "demat", "nifty", "sensex", "trading", "शेयर"],
    run: (q) => {
      const amt = q.amount ?? 10000;
      return {
        personal: false,
        explain: "A share is a small piece of ownership in a company. An ETF bundles many shares, often a whole index like the Nifty 50, into one unit you buy on the exchange. Single stocks concentrate risk; broad ETFs spread it.",
        example: [
          `${inr(amt)} in one company that falls 50% becomes ${inr(amt / 2)}, and then needs +100% to get back.`,
          `${inr(amt)} in a Nifty 50 ETF is spread across 50 large companies, so one company's collapse moves it far less.`,
          "Buying needs a demat and trading account with a SEBI-registered broker; brokerage, STT and exchange charges apply on each trade.",
        ],
        risk: "Equity prices can fall 30–50% in bad years and single stocks can go to zero. Tips on social media and Telegram are a common route to pump-and-dump scams. Only invest money you won't need for 7+ years.",
        links: [{ href: "/stocks/", label: "Practise with ₹500 of pretend money" }],
      };
    },
  },
  {
    id: "scam", title: "Spotting scams", keys: ["scam", "fraud", "guaranteed", "double", "telegram", "whatsapp", "tip", "ponzi", "assured"],
    run: (q) => {
      const amt = q.amount ?? 50000, monthly = q.rate ?? 3;
      const yearly = (Math.pow(1 + monthly / 100, 12) - 1) * 100;
      return {
        personal: false,
        explain: "Investment scams sell certainty: guaranteed high returns, urgency, secret tips, and payment to personal accounts. Legitimate market products never guarantee equity-like returns.",
        example: [
          `"Guaranteed ${monthly}% a month" on ${inr(amt)} claims ${inr(amt * Math.pow(1 + monthly / 100, 12))} in a year, which is ${pct(yearly, 1)} a year.`,
          `For comparison, a 1-year bank FD at about 7% would give about ${inr(amt * 1.0719)}.`,
          "A promise several times higher than a bank rate, with no risk, is the signature of a Ponzi scheme.",
        ],
        risk: "Check any adviser or research analyst on SEBI's website before acting. Never share OTPs or pay into personal UPI IDs. If you've been defrauded, call the national cybercrime helpline 1930 or report at cybercrime.gov.in quickly.",
        links: [{ href: "/quiz/", label: "Take the Myth Buster quiz" }],
      };
    },
  },
  {
    id: "debt", title: "Debt and credit cards", keys: ["debt", "credit card", "loan", "emi", "interest rate", "borrow", "karz"],
    run: (q) => {
      const bal = q.amount ?? 50000, apr = q.rate ?? 36, pay = Math.max(round100(bal * 0.1), 1000);
      let b = bal, months = 0, interest = 0;
      while (b > 0 && months < 600) { const i = (b * apr) / 1200; interest += i; b = b + i - pay; months++; }
      return {
        personal: false,
        explain: "High-interest debt grows faster than almost any investment can. Paying it off is a guaranteed 'return' equal to the interest rate you stop paying, which is why many plans clear credit-card debt before investing.",
        example: [
          `${inr(bal)} on a card at ${apr}% a year ≈ ${inr((bal * apr) / 1200)} interest in the first month alone.`,
          `Paying ${inr(pay)}/month clears it in about ${duration(months)}, costing about ${inr(interest)} in interest.`,
          `To beat that by investing instead, you'd need a reliable ${apr}% a year, which no regulated product offers.`,
        ],
        risk: "Card rates commonly run 3–3.75% a month; GST applies on interest and fees, and minimum-due payments stretch debt for years. Missed payments hurt your credit score. Rates here are illustrative; check your card's statement.",
      };
    },
  },
  {
    id: "budget", title: "Budgeting and the 50/30/20 split", keys: ["budget", "50/30/20", "spend", "spending", "expense", "kharcha", "where does my money"],
    run: (_q, c) => {
      const s = (n: number) => (c.income ? pct((n / c.income) * 100, 0) : "—");
      return {
        personal: true,
        explain: "A simple starting split is 50/30/20: about half of take-home pay for needs, 30% for wants, 20% for savings and debt repayment. It isn't a rule, just a way to see whether your money matches your priorities.",
        example: [
          `On ${inr(c.income)}/month: needs ${inr(c.income * 0.5)}, wants ${inr(c.income * 0.3)}, savings ${inr(c.income * 0.2)}.`,
          `Your snapshot: essentials ${inr(c.essentials)} (${s(c.essentials)}), wants ${inr(c.discretionary)} (${s(c.discretionary)}), savings + emergency ${inr(c.savings + c.emergencyMonthly)} (${s(c.savings + c.emergencyMonthly)}).`,
          c.topCat ? `Your tracker shows ${inr(c.spent)} logged so far; the biggest category is ${c.topCat} at ${inr(c.topCatAmt)}.` : "Log expenses in the tracker to see where money actually goes.",
        ],
        risk: "In high-rent cities needs often exceed 50%, and that's not a failure. Percentages hide irregular costs like annual insurance or festivals; set aside for those monthly.",
        links: [{ href: "/budget/", label: "Open Money Snapshot & tracker" }],
      };
    },
  },
  {
    id: "mf", title: "Mutual funds and expense ratios", keys: ["mutual fund", "fund", "nav", "expense ratio", "direct plan", "regular plan", "amc"],
    run: (q, c) => {
      const p = q.amount ?? (c.current || 100000), y = q.years ?? 10, r = q.rate ?? 10;
      const lo = fv(p, r, y), hi = fv(p, r - 1, y);
      return {
        personal: q.amount === undefined && c.current > 0,
        explain: "A mutual fund pools money from many investors and a SEBI-regulated manager invests it. You own units priced at the NAV. The fund charges a yearly expense ratio; 'direct' plans usually cost less than 'regular' plans because no distributor commission is built in.",
        example: [
          `${inr(p)} for ${y} years at an assumed ${r}% before costs → about ${inr(lo)}.`,
          `If costs were 1% a year higher (so ${r - 1}% net) → about ${inr(hi)}. The gap is ${inr(lo - hi)}.`,
          "NAV level says nothing about value: a ₹20 NAV fund isn't 'cheaper' than a ₹500 NAV fund.",
        ],
        risk: "Equity funds can fall 20–40% in a bad year. Past performance and star ratings don't reliably repeat. Check the riskometer, expense ratio and exit load in the scheme documents, available on the AMC and AMFI websites.",
        links: [{ href: "/glossary/", label: "Glossary: Mutual Fund, NAV" }],
      };
    },
  },
  {
    id: "index", title: "Index funds", keys: ["index", "passive", "nifty 50 fund"],
    run: (q, c) => {
      const amt = q.amount ?? (c.monthly || 5000), y = q.years ?? c.years;
      const a = project(0, amt, c.rate, y * 12), b = project(0, amt, c.rate - 0.8, y * 12);
      return {
        personal: q.amount === undefined,
        explain: "An index fund copies a market index like the Nifty 50 instead of paying analysts to pick stocks. You get the market's return, falls included, minus small fees.",
        example: [
          `${inr(amt)}/month for ${y} years: ${inr(a.contributions)} of your money.`,
          `At an assumed ${c.rate}% net: about ${inr(a.total)}. If yearly costs were 0.8% higher: about ${inr(b.total)} (${inr(a.total - b.total)} less).`,
          "Index funds' expense ratios are often well under 0.5% a year for direct plans. Check the fund's current figure.",
        ],
        risk: "An index fund falls when the market falls; there's no manager trying to dodge it. Tracking error means returns can slightly differ from the index. Still equity: suited to goals 5+ years away.",
      };
    },
  },
  {
    id: "tax", title: "Tax on savings and investments", keys: ["tax", "ltcg", "stcg", "80c", "elss", "capital gain"],
    run: (q) => {
      const gain = q.amount ?? 200000;
      const ltcg = Math.max(0, gain - 125000) * 0.125;
      return {
        personal: false,
        explain: "Different products are taxed differently. FD and savings interest is added to your income and taxed at your slab. Equity-fund and share gains are capital gains, taxed at special rates depending on how long you held them.",
        example: [
          `Equity held over 12 months: long-term gains above ₹1.25 lakh a year are taxed at 12.5%. On a ${inr(gain)} gain that's about ${inr(ltcg)}.`,
          `Held 12 months or less: short-term gains are taxed at 20%, so ${inr(gain)} → about ${inr(gain * 0.2)}.`,
          "₹10,000 of FD interest in the 30% slab → about ₹3,000 tax (cess ignored).",
        ],
        risk: "These are the equity capital-gains rates that took effect on 23 July 2024; tax rules change in Union Budgets. Surcharge, cess and debt-fund rules aren't shown, and ELSS's 80C deduction applies only under the old regime. Confirm with the Income Tax Department or a qualified professional.",
      };
    },
  },
  {
    id: "compound", title: "Compound growth", keys: ["compound", "compounding", "interest on interest", "power of"],
    run: (q, c) => {
      const p = q.amount ?? (c.current || 100000), r = q.rate ?? c.rate;
      return {
        personal: q.amount === undefined && c.current > 0,
        explain: "Compounding means earning returns on earlier returns, not just on what you put in. It's slow at first and only becomes large over long periods, and only if returns are positive.",
        example: [
          `${inr(p)} at an assumed ${r}%: ${inr(fv(p, r, 1))} after 1 year, ${inr(fv(p, r, 10))} after 10, ${inr(fv(p, r, 20))} after 20.`,
          `Years 1–10 add ${inr(fv(p, r, 10) - p)}; years 11–20 add ${inr(fv(p, r, 20) - fv(p, r, 10))}. Same rate, more time.`,
          `The same maths works against you on debt: ${inr(p)} at 36% doubles in a little over 2 years.`,
        ],
        risk: "Real returns aren't steady; a bad year early or late changes the outcome a lot. Fees, taxes and inflation all compound too, in the wrong direction.",
      };
    },
  },
  {
    id: "diversify", title: "Diversification", keys: ["diversif", "allocation", "portfolio", "mix", "spread"],
    run: (q, c) => {
      const amt = q.amount ?? (c.monthly || 5000);
      const v0 = amt * 0.5 * 0.7 + amt * 0.3 * 1.0 + amt * 0.2 * 1.05;
      return {
        personal: q.amount === undefined,
        explain: "Diversification means spreading money across things that don't all fall together: equity, debt, gold, cash, and many companies within equity. It doesn't prevent losses; it limits how much any single bad outcome can hurt.",
        example: [
          `Example split of ${inr(amt)}: ${inr(amt * 0.5)} equity fund, ${inr(amt * 0.3)} FD or debt fund, ${inr(amt * 0.2)} gold fund.`,
          `If equity fell 30%, debt was flat and gold rose 5%, the mix would be worth about ${inr(v0)}: down ${pct((1 - v0 / amt) * 100, 1)}, not 30%.`,
          "Owning ten stocks from one sector is not diversification; they tend to fall together.",
        ],
        risk: "In a severe crisis, many assets can fall at the same time. This split is an illustration, not a recommendation; the right mix depends on your timeline and comfort with swings.",
      };
    },
  },
];

const GREETING = /^(hi|hello|hey|namaste|namaskar|hii+|help)\b/;

// Short keys ("fd", "sip", "tip") must match whole words, or "multiple" would count as "tip".
function hit(text: string, key: string) {
  return key.length <= 4 && /^[a-z0-9 ]+$/.test(key) ? new RegExp(`\\b${key}s?\\b`).test(text) : text.includes(key);
}

function score(text: string, keys: string[]) {
  return keys.reduce((a, k) => a + (hit(text, k) ? k.length + 2 : 0), 0);
}

export function answer(input: string, state: AppState): Answer {
  const q = parse(input);
  const c = contextFrom(state);

  if (GREETING.test(q.text.trim())) {
    return {
      topic: "hello", title: "Namaste, I'm the Zeno guide",
      explain: "I explain money concepts in plain language and work through the numbers with you. I'm an educator, not a SEBI-registered adviser, so I won't tell you what to buy.",
      example: [
        `I can see your snapshot: income ${inr(c.income)}, essentials ${inr(c.essentials)}, saving ${inr(c.monthly)}/month toward ${inr(c.goal)}.`,
        "Ask things like \"How long to reach my goal?\", \"Is my emergency fund enough?\", or \"SIP of 3000 for 15 years\".",
      ],
      risk: "Every example is illustrative. Real returns vary, can be negative, and are reduced by fees, tax and inflation.",
      personal: true,
      followUps: ["Is my emergency fund enough?", "How long to reach my goal?", "What is a SIP?"],
    };
  }

  let best: Topic | null = null, bestScore = 0;
  for (const t of TOPICS) {
    const s = score(q.text, t.keys);
    if (s > bestScore) { best = t; bestScore = s; }
  }

  if (!best) {
    return {
      topic: "unknown", title: "I don't have a reliable answer for that",
      explain: "I only answer topics I can explain accurately: SIPs, FDs, emergency funds, inflation, goals, crashes, gold, stocks and ETFs, mutual and index funds, debt, budgeting, tax basics, compounding, diversification and scams. I'd rather say so than guess.",
      example: [
        `Your current plan: ${inr(c.monthly)}/month toward ${inr(c.goal)}, starting from ${inr(c.current)}.`,
        "Try including a number, for example \"FD of 2 lakh for 3 years\" or \"what if inflation is 7%\".",
      ],
      risk: "For personal advice on specific products, consult a SEBI-registered investment adviser; you can verify registration on SEBI's website.",
      personal: true,
      links: [{ href: "/glossary/", label: "Browse the glossary" }],
      followUps: ["What is a SIP?", "Is an FD safe?", "Why do markets fall?"],
    };
  }

  return { topic: best.id, title: best.title, ...best.run(q, c) };
}

export const SUGGESTED = [
  "Is my emergency fund enough?",
  "How long to reach my goal?",
  "SIP of 3000 for 15 years",
  "What if I save ₹500 more?",
  "FD of 2 lakh for 3 years",
  "What happens in a 30% crash?",
  "Guaranteed 3% a month — scam?",
  "How is my budget split?",
];
