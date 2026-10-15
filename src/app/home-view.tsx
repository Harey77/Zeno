"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight, BookOpen, Calculator, ChartLine, Check, CircleAlert, Compass, Eye, HeartPulse, Languages, LayoutDashboard,
  ListChecks, Megaphone, PiggyBank, Scale, ShieldAlert, Sparkles, TrendingDown, Wallet,
} from "lucide-react";
import { AnimatedNumber, Chips, InrInput, Magnetic, SpotlightCard } from "@/components/ui";
import { inrShort, duration } from "@/lib/format";
import { monthsToGoal, monthsToGoalNoGrowth, project, PRESETS } from "@/lib/finance";
import { DEFAULT_STATE, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { ZenoMark } from "@/components/logo";

// WebGL only runs in the browser; the hero renders fine without it while it loads.
const ParticleField = dynamic(() => import("@/components/three/particle-field"), { ssr: false });

const problems = [
  { icon: Megaphone, title: "Too much noise", body: "Finfluencers, tips and 'guaranteed' schemes make it hard to know what's real." },
  { icon: CircleAlert, title: "Promises, not maths", body: "Apps show the upside and hide the bad years. Beginners panic when the dip arrives." },
  { icon: ShieldAlert, title: "No safety net first", body: "People invest before they have an emergency cushion, then sell at a loss when life happens." },
];
const solutions = [
  { icon: Eye, title: "Your money vs. growth, separated", body: "Every projection shows what you put in apart from hypothetical growth, so nothing is hidden." },
  { icon: TrendingDown, title: "Downside shown up front", body: "Crash and life simulators show what a bad year looks like before it happens." },
  { icon: Compass, title: "A plan in plain language", body: "Step-by-step tools that explain every term, in rupees, in six Indian languages." },
];

const tools = [
  { href: "/budget/", icon: Wallet, title: "Money Snapshot", body: "Map income and track expenses." },
  { href: "/compare/", icon: Scale, title: "Compare 5 Pathways", body: "Savings, FDs, funds, gold, stocks." },
  { href: "/planner/", icon: Calculator, title: "Plan Builder", body: "Goal, timeline and honest maths." },
  { href: "/save-more/", icon: PiggyBank, title: "Save ₹500 More", body: "Small change, clear difference." },
  { href: "/stocks/", icon: ChartLine, title: "Stock Reader", body: "Read a stock card. Practise safely." },
  { href: "/risk/", icon: TrendingDown, title: "Crash Simulator", body: "A 3D look at what −20% costs." },
  { href: "/life/", icon: HeartPulse, title: "Life Happens", body: "Job cuts, bills, missed months." },
  { href: "/dashboard/", icon: LayoutDashboard, title: "Progress", body: "Portfolio, milestones, badges." },
  { href: "/learn/", icon: BookOpen, title: "AI Guide", body: "Answers with your own numbers." },
  { href: "/quiz/", icon: ListChecks, title: "Myth Buster", body: "Eight myths, true or false." },
  { href: "/glossary/", icon: Languages, title: "Glossary", body: "Money words in plain language." },
  { href: "/login/", icon: Sparkles, title: "Profile", body: "Language and sign-in method." },
];

const falls = [
  { title: "Fear spreads faster than facts", body: "Bad news makes many people sell at once. Prices drop even before the full impact is known." },
  { title: "Interest rates rise", body: "When FDs and bonds pay more, some money leaves the stock market, pulling prices down." },
  { title: "Profits disappoint", body: "Share prices reflect expected profits. If companies earn less than hoped, prices adjust." },
  { title: "Prices ran ahead", body: "After long rallies, prices can get ahead of reality. A correction brings them back." },
];

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const fmtMonths = (m: number | null) => (m === null || m > 600 ? "50+ yrs" : duration(Math.round(m)));

function GoalPreview() {
  const { state, ready, update } = useStore();
  const t = useT();
  const [goal, setGoal] = useState(DEFAULT_STATE.plan.goal);
  const [monthly, setMonthly] = useState(DEFAULT_STATE.plan.monthly);
  const [saved, setSaved] = useState(false);
  const synced = useRef(false);

  // Start from the saved plan once localStorage has loaded.
  useEffect(() => {
    if (!ready || synced.current) return;
    synced.current = true;
    setGoal(state.plan.goal); setMonthly(state.plan.monthly);
  }, [ready, state.plan.goal, state.plan.monthly]);

  const rate = PRESETS.balanced.rate;
  const own = monthsToGoalNoGrowth(goal, 0, monthly);
  const bal = monthsToGoal(goal, 0, monthly, rate);
  const tenY = project(0, monthly, rate, 120);
  const share = tenY.total ? (tenY.contributions / tenY.total) * 100 : 100;
  const fmtShort = useCallback((n: number) => inrShort(n), []);

  return (
    <motion.div variants={fadeUp} className="card spotlight p-6 sm:p-7" aria-labelledby="goal-preview"
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`); e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`); }}>
      <div className="flex items-center justify-between">
        <p id="goal-preview" className="text-xs font-semibold tracking-widest text-accent">{t("goal.preview")}</p>
        <span className="flex items-center gap-1.5 text-[11px] text-muted"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> Live</span>
      </div>
      <p className="mt-2 font-display text-lg font-semibold">{t("goal.howLong")}</p>
      <div className="mt-3">
        <Chips label="Goal amount" value={goal} onChange={(v) => { setGoal(v); setSaved(false); }}
          options={[{ value: 100000, label: "₹1 Lakh" }, { value: 1000000, label: "₹10 Lakh" }, { value: 10000000, label: "₹1 Crore" }]} />
      </div>
      <div className="mt-5">
        <InrInput label={t("goal.monthly")} value={monthly} onChange={(n) => { setMonthly(n); setSaved(false); }}
          resetTo={state.plan.monthly || DEFAULT_STATE.plan.monthly} resetLabel={t("goal.reset")} max={10_000_000} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line bg-bg/50 p-4">
          <p className="text-xs text-muted">{t("goal.ownOnly")}</p>
          <p className="mt-1 font-display text-xl font-semibold">{monthly > 0 ? fmtMonths(own) : "—"}</p>
          <p className="mt-1 text-[11px] text-muted">{t("goal.noGrowth")}</p>
        </div>
        <div className="rounded-xl border border-accent/40 bg-accent/10 p-4">
          <p className="text-xs text-muted">{t("goal.withGrowth", { r: rate })}</p>
          <p className="mt-1 font-display text-xl font-semibold text-accent">{monthly > 0 ? fmtMonths(bal) : "—"}</p>
          <p className="mt-1 text-[11px] text-muted">{t("goal.notPrediction")}</p>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-line p-4 text-sm">
        <p className="text-muted">{t("goal.tenYears")}</p>
        <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-line">
          <motion.div className="bg-fg/80" animate={{ width: `${share}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
          <motion.div className="bg-accent" animate={{ width: `${100 - share}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
        </div>
        <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs">
          <span><span className="text-fg">■</span> {t("goal.youPut")} <AnimatedNumber value={tenY.contributions} format={fmtShort} /></span>
          <span><span className="text-accent">■</span> {t("goal.hypGrowth")} <AnimatedNumber value={tenY.growth} format={fmtShort} /></span>
        </div>
      </div>
      <motion.button whileTap={{ scale: 0.98 }} onClick={() => { update("plan", { goal, monthly }); setSaved(true); }}
        className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full border py-2.5 text-sm font-semibold transition ${saved ? "border-accent/60 text-accent" : "border-line hover:border-accent/60"}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={String(saved)} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="flex items-center gap-2">
            {saved ? <><Check className="h-4 w-4" /> {t("goal.saved")}</> : t("goal.usePlan")}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}

export function HomeView() {
  const t = useT();
  return (
    <>
      <section className="relative overflow-hidden">
        <ParticleField />
        <div className="grid-bg pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
        <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.12 }}
          className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[1.15fr_1fr]">
          <motion.div variants={fadeUp}>
            <div className="mb-6 flex items-center gap-3">
              <span className="drop-shadow-[0_10px_30px_rgba(0,245,155,0.55)]"><ZenoMark size={52} /></span>
              <span className="font-display text-3xl font-bold tracking-tight">Zeno</span>
            </div>
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {t("home.eyebrow")}
            </p>
            <h1 className="mt-5 text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
              {t("home.h1a")}<br /><span className="bg-gradient-to-r from-accent to-[var(--accent-2)] bg-clip-text text-transparent">{t("home.h1b")}</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted">{t("home.sub")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Magnetic>
                <Link href="/planner/" className="btn-accent inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold transition">
                  {t("nav.cta")} <ArrowRight className="h-4 w-4" />
                </Link>
              </Magnetic>
              <Magnetic strength={0.25}>
                <Link href="/budget/" className="inline-flex rounded-full border border-line bg-bg/40 px-6 py-3 font-semibold backdrop-blur transition hover:border-accent/60">
                  {t("home.cta2")}
                </Link>
              </Magnetic>
            </div>
            <p className="mt-6 flex items-center gap-2 text-xs text-muted"><Sparkles className="h-3.5 w-3.5 text-accent" /> {t("home.privacy")}</p>
          </motion.div>
          <GoalPreview />
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          {[
            { eyebrow: "THE PROBLEM", tone: "text-warn", h: "Money advice is loud. Most of it is selling something.", items: problems, iconCls: "bg-warn/10 text-warn" },
            { eyebrow: "THE HONEST WAY", tone: "text-accent", h: "Show the maths. Show the bad years. Then plan.", items: solutions, iconCls: "bg-accent/10 text-accent" },
          ].map((col) => (
            <motion.div key={col.eyebrow} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} transition={{ staggerChildren: 0.08 }}>
              <motion.p variants={fadeUp} className={`text-xs font-semibold tracking-[0.2em] ${col.tone}`}>{col.eyebrow}</motion.p>
              <motion.h2 variants={fadeUp} className="mt-3 text-3xl font-bold">{col.h}</motion.h2>
              <div className="mt-6 grid gap-3">
                {col.items.map(({ icon: Icon, title, body }) => (
                  <motion.div key={title} variants={fadeUp}>
                    <SpotlightCard className="flex gap-4 p-5">
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${col.iconCls}`}><Icon className="h-5 w-5" /></span>
                      <div><h3 className="font-semibold">{title}</h3><p className="mt-1 text-sm text-muted">{body}</p></div>
                    </SpotlightCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="card relative overflow-hidden p-6 sm:p-10">
          <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] text-warn">PRIMER</p>
              <h2 className="mt-3 text-3xl font-bold">Why markets fall</h2>
              <p className="mt-3 text-muted">Falls are normal, not a sign that you did something wrong. Nobody can reliably time them, which is why money you need soon doesn&apos;t belong in equity.</p>
              <svg viewBox="0 0 300 110" className="mt-6 w-full" aria-label="Illustrative market line with a fall and partial recovery" role="img">
                <motion.path d="M0,80 C30,70 50,60 80,55 S120,30 140,32 S160,85 180,88 S220,60 250,50 S285,35 300,30" fill="none" stroke="var(--accent)" strokeWidth="2.5"
                  initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: "easeInOut" }} />
                <circle cx="140" cy="32" r="4" fill="var(--accent)" /><circle cx="180" cy="88" r="4" fill="var(--warn)" />
                <text x="140" y="20" fill="var(--muted)" fontSize="10" textAnchor="middle">peak</text>
                <text x="180" y="104" fill="var(--warn)" fontSize="10" textAnchor="middle">fall</text>
              </svg>
              <Link href="/risk/" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">Try the 3D crash simulator <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2">
              {falls.map((f, i) => (
                <li key={f.title} className="rounded-2xl border border-line bg-bg/60 p-5">
                  <span className="font-display text-sm font-bold text-accent">0{i + 1}</span>
                  <h3 className="mt-2 font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted">{f.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-3xl font-bold">Thirteen honest tools, one place</h2>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} transition={{ staggerChildren: 0.04 }}
          className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(({ href, icon: Icon, title, body }) => (
            <motion.div key={href} variants={fadeUp}>
              <Link href={href} className="group block">
                <SpotlightCard className="flex items-center gap-4 p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent transition group-hover:bg-accent group-hover:text-on-accent"><Icon className="h-5 w-5" /></span>
                  <div className="flex-1"><h3 className="font-semibold">{title}</h3><p className="text-sm text-muted">{body}</p></div>
                  <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-1 group-hover:text-accent" />
                </SpotlightCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </>
  );
}
