"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bot, Calculator, ExternalLink, Lightbulb, Send, ShieldAlert, Sparkles, User } from "lucide-react";
import { Card, PageHeader, Section, SpotlightCard } from "@/components/ui";
import { RESOURCES } from "@/lib/content";
import { answer, SUGGESTED, type Answer } from "@/lib/advisor";
import { inr } from "@/lib/format";
import { useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";

type Msg = { id: number; from: "you"; text: string } | { id: number; from: "bot"; a: Answer };

function BotMessage({ a, onAsk }: { a: Answer; onAsk: (q: string) => void }) {
  const t = useT();
  const parts = [
    { icon: Lightbulb, label: t("chat.explain"), tone: "text-accent", body: <p>{a.explain}</p> },
    {
      icon: Calculator, label: t("chat.example"), tone: "text-fg",
      body: <ul className="space-y-1.5">{a.example.map((l) => <li key={l} className="flex gap-2"><span className="text-accent">›</span><span className="tabular-nums">{l}</span></li>)}</ul>,
    },
    { icon: ShieldAlert, label: t("chat.risk"), tone: "text-warn", body: <p>{a.risk}</p> },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="max-w-[94%] rounded-2xl rounded-bl-md border border-line bg-bg/70 p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-display font-semibold">{a.title}</p>
        {a.personal && <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-accent">USES YOUR NUMBERS</span>}
      </div>
      <ol className="mt-3 space-y-3">
        {parts.map(({ icon: Icon, label, tone, body }, i) => (
          <motion.li key={label} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * (i + 1) }}
            className={`rounded-xl border p-3 ${i === 2 ? "border-warn/25 bg-warn/5" : "border-line bg-surface/60"}`}>
            <p className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest ${tone}`}><Icon className="h-3.5 w-3.5" /> {i + 1}. {label}</p>
            <div className="mt-1.5 leading-relaxed text-muted">{body}</div>
          </motion.li>
        ))}
      </ol>
      {(a.links?.length || a.followUps?.length) ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {a.links?.map((l) => <Link key={l.href} href={l.href} className="text-xs font-semibold text-accent hover:underline">{l.label} →</Link>)}
          {a.followUps?.map((f) => <button key={f} onClick={() => onAsk(f)} className="rounded-full border border-line px-2.5 py-1 text-xs text-muted hover:border-accent/50 hover:text-fg">{f}</button>)}
        </div>
      ) : null}
    </motion.div>
  );
}

export default function View() {
  const { state, ready } = useStore();
  const t = useT();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const nextId = useRef(1);

  // Greet with the user's own numbers once the store has loaded from localStorage.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (ready) setMsgs((m) => (m.length ? m : [{ id: 0, from: "bot", a: answer("hello", state) }]));
  }, [ready, state]);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  const ask = (q: string) => {
    if (!q.trim() || typing) return;
    setMsgs((m) => [...m, { id: nextId.current++, from: "you", text: q }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { id: nextId.current++, from: "bot", a: answer(q, state) }]);
      setTyping(false);
    }, 450);
  };
  const submit = (e: FormEvent) => { e.preventDefault(); ask(input); };

  const b = state.budget, p = state.plan;

  return (
    <>
      <PageHeader eyebrow="LEARN CENTER · PRECISION AI GUIDE" title="Ask anything. Get the maths, and the catch.">
        Every answer comes in three parts: a plain explanation, a rupee calculation using your own numbers, and the risk. Education only, never a stock tip.
      </PageHeader>
      <Section>
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Card className="flex h-[720px] flex-col p-0">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="relative grid h-10 w-10 place-items-center rounded-full bg-accent text-on-accent">
                  <Bot className="h-5 w-5" />
                  <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-surface bg-accent" />
                </span>
                <div><p className="font-semibold">{t("chat.title")}</p><p className="text-xs text-muted">{t("chat.sub")}</p></div>
              </div>
              <span className="hidden items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-muted sm:flex"><Sparkles className="h-3.5 w-3.5 text-accent" /> Runs on-device</span>
            </div>
            <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5" aria-live="polite">
              <AnimatePresence initial={false}>
                {msgs.map((m) => m.from === "you" ? (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-end gap-2">
                    <p className="max-w-[80%] rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-sm font-medium text-on-accent">{m.text}</p>
                    <User className="mt-2 h-4 w-4 shrink-0 text-muted" />
                  </motion.div>
                ) : <BotMessage key={m.id} a={m.a} onAsk={ask} />)}
              </AnimatePresence>
              {typing && (
                <div className="flex gap-1 px-2" aria-label="Typing">
                  {[0, 0.12, 0.24].map((d) => <motion.span key={d} className="h-2 w-2 rounded-full bg-accent/70" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.7, delay: d }} />)}
                </div>
              )}
            </div>
            <div className="border-t border-line p-4">
              <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {SUGGESTED.map((s) => <button key={s} onClick={() => ask(s)} className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs text-muted transition hover:border-accent/60 hover:text-fg">{s}</button>)}
              </div>
              <form onSubmit={submit} className="flex gap-2">
                <label className="sr-only" htmlFor="ask">Ask a question</label>
                <input id="ask" value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("chat.placeholder")} maxLength={300}
                  className="flex-1 rounded-full border border-line bg-bg/60 px-4 py-2.5 text-sm outline-none transition focus:border-accent" />
                <motion.button whileTap={{ scale: 0.92 }} type="submit" aria-label="Send" disabled={!input.trim() || typing}
                  className="btn-accent grid h-11 w-11 place-items-center rounded-full transition disabled:opacity-40"><Send className="h-4 w-4" /></motion.button>
              </form>
            </div>
          </Card>

          <div className="space-y-4">
            <Card>
              <p className="text-xs font-semibold tracking-widest text-muted">WHAT THE GUIDE CAN SEE</p>
              <p className="mt-1 text-xs text-muted">Read from this browser only. Change them and the next answer updates.</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Income", inr(b.income)], ["Essentials", inr(b.essentials)],
                  ["Emergency saved", inr(b.emergencyBalance)], ["Monthly saving", inr(p.monthly)],
                  ["Goal", inr(p.goal)], ["Starting from", inr(p.current)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-line bg-bg/50 p-3"><dt className="text-xs text-muted">{k}</dt><dd className="font-display font-semibold tabular-nums">{v}</dd></div>
                ))}
              </dl>
              <div className="mt-3 flex gap-3 text-xs">
                <Link href="/budget/" className="font-semibold text-accent hover:underline">Edit snapshot →</Link>
                <Link href="/planner/" className="font-semibold text-accent hover:underline">Edit plan →</Link>
              </div>
            </Card>
            <h2 className="pt-2 text-xl font-bold">Verified resources</h2>
            {RESOURCES.map((r) => (
              <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" className="block">
                <SpotlightCard className="group flex items-start gap-4 p-4">
                  <span className="grid h-10 w-14 shrink-0 place-items-center rounded-lg bg-accent/10 text-[11px] font-bold tracking-wide text-accent">{r.org}</span>
                  <span className="flex-1"><span className="flex items-center gap-1.5 font-semibold">{r.title}<ExternalLink className="h-3.5 w-3.5 text-muted group-hover:text-accent" /></span><span className="text-sm text-muted">{r.body}</span></span>
                </SpotlightCard>
              </a>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link href="/quiz/" className="card p-4 text-sm font-semibold transition hover:border-accent/50">Myth Buster Quiz →</Link>
              <Link href="/glossary/" className="card p-4 text-sm font-semibold transition hover:border-accent/50">Glossary →</Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
